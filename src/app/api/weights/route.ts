import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? "30");

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

  const body = await request.json();
  const { weight, recordedAt } = body;

  if (weight == null || typeof weight !== "number") {
    return Response.json({ error: "weight is required" }, { status: 400 });
  }

  // User が存在しない場合は作成
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  // 指定日（未指定の場合は当日）の既存レコードがあれば上書き
  const targetDate = recordedAt ? new Date(recordedAt) : new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

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
