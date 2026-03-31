import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import type { NutritionAnalysis } from "@/types";

export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  const limit = searchParams.get("limit"); // 件数制限
  const daysParam = searchParams.get("days");

  if (date && daysParam) {
    return Response.json(
      { error: "date and days cannot be used together" },
      { status: 400 },
    );
  }

  const parsedLimit = limit ? Number.parseInt(limit, 10) : null;
  if (limit && (!Number.isInteger(parsedLimit) || parsedLimit <= 0)) {
    return Response.json(
      { error: "limit must be a positive integer" },
      { status: 400 },
    );
  }

  const parsedDays = daysParam ? Number.parseInt(daysParam, 10) : null;
  if (
    daysParam &&
    (!Number.isInteger(parsedDays) || parsedDays <= 0 || parsedDays > 3650)
  ) {
    return Response.json(
      { error: "days must be a positive integer up to 3650" },
      { status: 400 },
    );
  }

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json(
        { error: "date must be YYYY-MM-DD" },
        { status: 400 },
      );
    }
    startDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(startDate.getTime())) {
      return Response.json({ error: "date is invalid" }, { status: 400 });
    }
    endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
  }

  let sinceDate: Date | null = null;
  if (parsedDays) {
    sinceDate = new Date();
    sinceDate.setUTCHours(0, 0, 0, 0);
    sinceDate.setUTCDate(sinceDate.getUTCDate() - (parsedDays - 1));
  }

  const records = await prisma.mealRecord.findMany({
    where: {
      userId,
      ...(startDate && endDate
        ? {
            recordedDate: {
              gte: startDate,
              lt: endDate,
            },
          }
        : {}),
      ...(sinceDate
        ? {
            recordedDate: {
              gte: sinceDate,
            },
          }
        : {}),
    },
    orderBy: { recordedDate: parsedLimit ? "desc" : "asc" },
    ...(parsedLimit ? { take: parsedLimit } : {}),
  });

  const sorted = parsedLimit ? [...records].reverse() : records;

  return Response.json(
    sorted.map((r) => ({
      id: r.id,
      mealCategory: r.mealCategory,
      rawText: r.rawText ?? "",
      analysis: r.analysisJson as unknown as NutritionAnalysis,
      totalCalories: r.totalCalories,
      totalProtein: r.totalProtein,
      totalFat: r.totalFat,
      totalCarbs: r.totalCarbs,
      recordedAt: r.recordedDate,
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
  const payload = body as {
    mealCategory?: unknown;
    analysis?: unknown;
    rawText?: unknown;
    recordedDate?: unknown;
  };
  const { mealCategory, analysis, rawText, recordedDate } = payload;

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
      mealCategory,
      rawText: typeof rawText === "string" ? rawText : null,
      analysisJson: analysis,
      totalCalories,
      totalProtein,
      totalFat,
      totalCarbs,
      recordedDate: parsedRecordedDate,
    },
  });

  return Response.json(
    {
      id: record.id,
      mealCategory: record.mealCategory,
      rawText: record.rawText ?? "",
      analysis: record.analysisJson as unknown as NutritionAnalysis,
      totalCalories: record.totalCalories,
      totalProtein: record.totalProtein,
      totalFat: record.totalFat,
      totalCarbs: record.totalCarbs,
      recordedAt: record.recordedDate,
    },
    { status: 201 },
  );
}
