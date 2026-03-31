import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import type { NutritionAnalysis } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { totalCalories, totalProtein, totalFat, totalCarbs } = body as {
    totalCalories?: unknown;
    totalProtein?: unknown;
    totalFat?: unknown;
    totalCarbs?: unknown;
  };

  const totals = [totalCalories, totalProtein, totalFat, totalCarbs];
  if (
    totals.some(
      (value) =>
        typeof value !== "number" || !Number.isFinite(value) || value < 0,
    )
  ) {
    return Response.json(
      { error: "nutrition totals are invalid" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.mealRecord.findUnique({
      where: { id, userId },
    });
    if (!existing) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const baseAnalysis =
      typeof existing.analysisJson === "object" &&
      existing.analysisJson !== null
        ? (existing.analysisJson as object)
        : {};

    const record = await prisma.mealRecord.update({
      where: { id, userId },
      data: {
        totalCalories,
        totalProtein,
        totalFat,
        totalCarbs,
        analysisJson: {
          ...baseAnalysis,
          totalCalories,
          totalProtein,
          totalFat,
          totalCarbs,
        },
      },
    });

    return Response.json({
      id: record.id,
      mealCategory: record.mealCategory,
      rawText: record.rawText ?? "",
      analysis: record.analysisJson as unknown as NutritionAnalysis,
      totalCalories: record.totalCalories,
      totalProtein: record.totalProtein,
      totalFat: record.totalFat,
      totalCarbs: record.totalCarbs,
      recordedAt: record.recordedDate,
    });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;
  const { id } = await params;

  try {
    await prisma.mealRecord.delete({
      where: { id, userId },
    });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
