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

  // 当日分が既に存在する場合は上書き
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.weightRecord.findFirst({
    where: {
      userId,
      recordedAt: { gte: todayStart, lte: todayEnd },
    },
  });

  const record = existing
    ? await prisma.weightRecord.update({
        where: { id: existing.id },
        data: { weight, recordedAt: new Date() },
      })
    : await prisma.weightRecord.create({
        data: {
          userId,
          weight,
          recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        },
      });

  return Response.json(
    { id: record.id, weight: record.weight, recordedAt: record.recordedAt },
    { status: 201 },
  );
}
