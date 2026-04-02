import { parseJsonBody, requireUserId } from "@/lib/api/request";
import { toMealResponse } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;
  const { id } = await params;

  const parsedBody = await parseJsonBody<{
    totalCalories?: unknown;
    totalProtein?: unknown;
    totalFat?: unknown;
    totalCarbs?: unknown;
  }>(request);
  if ("response" in parsedBody) {
    return parsedBody.response;
  }
  const { totalCalories, totalProtein, totalFat, totalCarbs } = parsedBody.data;

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
        totalCalories: totalCalories as number,
        totalProtein: totalProtein as number,
        totalFat: totalFat as number,
        totalCarbs: totalCarbs as number,
        analysisJson: {
          ...baseAnalysis,
          totalCalories: totalCalories as number,
          totalProtein: totalProtein as number,
          totalFat: totalFat as number,
          totalCarbs: totalCarbs as number,
        },
      },
    });

    return Response.json(toMealResponse(record));
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;
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
