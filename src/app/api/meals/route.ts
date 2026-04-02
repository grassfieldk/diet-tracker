import {
  buildRecordedDateFilter,
  parseDateDaysLimitQuery,
} from "@/lib/api/query";
import { parseJsonBody, requireUserId } from "@/lib/api/request";
import { toMealResponse } from "@/lib/api/serializers";
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

  const records = await prisma.mealRecord.findMany({
    where: {
      userId,
      ...(recordedDateFilter ? { recordedDate: recordedDateFilter } : {}),
    },
    orderBy: { recordedDate: limit ? "desc" : "asc" },
    ...(limit ? { take: limit } : {}),
  });

  const sorted = limit ? [...records].reverse() : records;

  return Response.json(sorted.map(toMealResponse));
}

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;

  const parsedBody = await parseJsonBody<{
    mealCategory?: unknown;
    analysis?: unknown;
    rawText?: unknown;
    recordedDate?: unknown;
  }>(request);
  if ("response" in parsedBody) {
    return parsedBody.response;
  }
  const { mealCategory, analysis, rawText, recordedDate } = parsedBody.data;

  if (!mealCategory || !analysis || typeof analysis !== "object") {
    return Response.json(
      { error: "mealCategory and analysis are required" },
      { status: 400 },
    );
  }

  if (!["朝食", "昼食", "夕食", "間食"].includes(String(mealCategory))) {
    return Response.json({ error: "mealCategory is invalid" }, { status: 400 });
  }

  const nutrition = analysis as {
    totalCalories?: unknown;
    totalProtein?: unknown;
    totalFat?: unknown;
    totalCarbs?: unknown;
  };
  const totals = [
    nutrition.totalCalories,
    nutrition.totalProtein,
    nutrition.totalFat,
    nutrition.totalCarbs,
  ];
  if (
    totals.some(
      (value) =>
        typeof value !== "number" || !Number.isFinite(value) || value < 0,
    )
  ) {
    return Response.json(
      { error: "analysis totals must be finite numbers" },
      { status: 400 },
    );
  }
  const [totalCalories, totalProtein, totalFat, totalCarbs] =
    totals as number[];

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

  // User が存在しない場合は作成
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  const record = await prisma.mealRecord.create({
    data: {
      userId,
      mealCategory: String(mealCategory),
      rawText: typeof rawText === "string" ? rawText : null,
      analysisJson: analysis,
      totalCalories,
      totalProtein,
      totalFat,
      totalCarbs,
      recordedDate: parsedRecordedDate,
    },
  });

  return Response.json(toMealResponse(record), { status: 201 });
}
