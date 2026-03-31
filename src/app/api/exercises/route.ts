import {
  buildRecordedDateFilter,
  parseDateDaysLimitQuery,
} from "@/lib/api/query";
import { parseJsonBody, requireUserId } from "@/lib/api/request";
import { toExerciseResponse } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;

  const { searchParams } = new URL(request.url);
  const parsed = parseDateDaysLimitQuery(searchParams);
  if ("response" in parsed) {
    return parsed.response;
  }
  const { date, days, limit } = parsed.value;
  const recordedDateFilter = buildRecordedDateFilter({ date, days });

  const records = await prisma.exerciseRecord.findMany({
    where: {
      userId,
      ...(recordedDateFilter ? { recordedDate: recordedDateFilter } : {}),
    },
    orderBy: { recordedDate: limit ? "desc" : "asc" },
    ...(limit ? { take: limit } : {}),
  });

  const sorted = limit ? [...records].reverse() : records;

  return Response.json(sorted.map(toExerciseResponse));
}

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;

  const parsedBody = await parseJsonBody<{
    analysis?: { totalCaloriesBurned?: unknown };
    rawText?: unknown;
    recordedDate?: unknown;
  }>(request);
  if ("response" in parsedBody) {
    return parsedBody.response;
  }
  const { analysis, rawText, recordedDate } = parsedBody.data;

  if (!analysis) {
    return Response.json({ error: "analysis is required" }, { status: 400 });
  }

  if (
    typeof analysis.totalCaloriesBurned !== "number" ||
    !Number.isFinite(analysis.totalCaloriesBurned) ||
    analysis.totalCaloriesBurned < 0
  ) {
    return Response.json(
      { error: "analysis.totalCaloriesBurned must be a finite number" },
      { status: 400 },
    );
  }

  let parsedRecordedDate: Date;
  if (recordedDate == null) {
    parsedRecordedDate = new Date();
  } else {
    parsedRecordedDate = new Date(String(recordedDate));
    if (Number.isNaN(parsedRecordedDate.getTime())) {
      return Response.json(
        { error: "recordedDate is invalid" },
        { status: 400 },
      );
    }
  }

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  const record = await prisma.exerciseRecord.create({
    data: {
      userId,
      rawText: typeof rawText === "string" ? rawText : null,
      analysisJson: analysis,
      totalCaloriesBurned: analysis.totalCaloriesBurned,
      recordedDate: parsedRecordedDate,
    },
  });

  return Response.json(toExerciseResponse(record), { status: 201 });
}
