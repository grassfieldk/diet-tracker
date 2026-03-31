import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;

  const { searchParams } = new URL(request.url);
  const latestParam = searchParams.get("latest");

  const parsedLatest = latestParam ? Number.parseInt(latestParam, 10) : null;
  if (
    latestParam &&
    (!Number.isInteger(parsedLatest) || parsedLatest <= 0 || parsedLatest > 50)
  ) {
    return Response.json(
      { error: "latest must be a positive integer up to 50" },
      { status: 400 },
    );
  }

  if (parsedLatest) {
    const latestRecords = await prisma.weightRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: parsedLatest,
    });

    return Response.json(
      latestRecords.map((r) => ({
        id: r.id,
        weight: r.weight,
        recordedAt: r.recordedAt,
      })),
    );
  }

  const daysParam = searchParams.get("days") ?? "30";
  const days = Number.parseInt(daysParam, 10);
  if (!Number.isInteger(days) || days <= 0 || days > 365) {
    return Response.json(
      { error: "days must be a positive integer up to 365" },
      { status: 400 },
    );
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.weightRecord.findMany({
    where: {
      userId,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "asc" },
  });

  return Response.json(
    records.map((r) => ({
      id: r.id,
      weight: r.weight,
      recordedAt: r.recordedAt,
    })),
  );
}

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as { weight?: unknown; recordedAt?: unknown };
  const { weight, recordedAt } = payload;

  if (
    weight == null ||
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight < 10 ||
    weight > 500
  ) {
    return Response.json({ error: "weight is required" }, { status: 400 });
  }

  // User が存在しない場合は作成
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  // 指定日（未指定の場合は当日）の既存レコードがあれば上書き
  const targetDate = recordedAt ? new Date(String(recordedAt)) : new Date();
  if (Number.isNaN(targetDate.getTime())) {
    return Response.json({ error: "recordedAt is invalid" }, { status: 400 });
  }

  const dayStart = new Date(targetDate);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const existing = await prisma.weightRecord.findFirst({
    where: {
      userId,
      recordedAt: { gte: dayStart, lte: dayEnd },
    },
  });

  const record = existing
    ? await prisma.weightRecord.update({
        where: { id: existing.id },
        data: { weight, recordedAt: targetDate },
      })
    : await prisma.weightRecord.create({
        data: {
          userId,
          weight,
          recordedAt: targetDate,
        },
      });

  return Response.json(
    { id: record.id, weight: record.weight, recordedAt: record.recordedAt },
    { status: 201 },
  );
}
