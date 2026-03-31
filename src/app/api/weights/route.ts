import { parsePositiveIntParam } from "@/lib/api/query";
import { parseJsonBody, requireUserId } from "@/lib/api/request";
import { toWeightResponse } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;

  const { searchParams } = new URL(request.url);
  const latestParsed = parsePositiveIntParam(searchParams, "latest", 50);
  if ("response" in latestParsed) {
    return latestParsed.response;
  }
  const parsedLatest = latestParsed.value;

  if (parsedLatest) {
    const latestRecords = await prisma.weightRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: parsedLatest,
    });

    return Response.json(latestRecords.map(toWeightResponse));
  }

  const daysParsed = parsePositiveIntParam(searchParams, "days", 365);
  if ("response" in daysParsed) {
    return daysParsed.response;
  }
  const days = daysParsed.value ?? 30;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.weightRecord.findMany({
    where: {
      userId,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "asc" },
  });

  return Response.json(records.map(toWeightResponse));
}

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;

  const parsedBody = await parseJsonBody<{
    weight?: unknown;
    recordedAt?: unknown;
  }>(request);
  if ("response" in parsedBody) {
    return parsedBody.response;
  }
  const { weight, recordedAt } = parsedBody.data;

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

  return Response.json(toWeightResponse(record), { status: 201 });
}
