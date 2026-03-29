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

  const records = await prisma.mealRecord.findMany({
    where: {
      userId,
      ...(date
        ? {
            recordedDate: {
              gte: new Date(`${date}T00:00:00.000Z`),
              lt: new Date(`${date}T24:00:00.000Z`),
            },
          }
        : {}),
    },
    orderBy: { recordedDate: limit ? "desc" : "asc" },
    ...(limit ? { take: Number(limit) } : {}),
  });

  const sorted = limit ? [...records].reverse() : records;

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

  const body = await request.json();
  const { mealCategory, analysis, rawText, recordedDate } = body;

  if (!mealCategory || !analysis) {
    return Response.json(
      { error: "mealCategory and analysis are required" },
      { status: 400 },
    );
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
      rawText: rawText ?? null,
      analysisJson: analysis,
      totalCalories: analysis.totalCalories,
      totalProtein: analysis.totalProtein,
      totalFat: analysis.totalFat,
      totalCarbs: analysis.totalCarbs,
      recordedDate: recordedDate ? new Date(recordedDate) : new Date(),
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
