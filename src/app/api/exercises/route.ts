import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import type { ExerciseAnalysis } from "@/types";

export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  const limit = searchParams.get("limit");

  const records = await prisma.exerciseRecord.findMany({
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
      rawText: r.rawText ?? "",
      analysis: r.analysisJson as unknown as ExerciseAnalysis,
      totalCaloriesBurned: r.totalCaloriesBurned,
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
  const { analysis, rawText, recordedDate } = body;

  if (!analysis) {
    return Response.json({ error: "analysis is required" }, { status: 400 });
  }

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  const record = await prisma.exerciseRecord.create({
    data: {
      userId,
      rawText: rawText ?? null,
      analysisJson: analysis,
      totalCaloriesBurned: analysis.totalCaloriesBurned,
      recordedDate: recordedDate ? new Date(recordedDate) : new Date(),
    },
  });

  return Response.json(
    {
      id: record.id,
      rawText: record.rawText ?? "",
      analysis: record.analysisJson as unknown as ExerciseAnalysis,
      totalCaloriesBurned: record.totalCaloriesBurned,
      recordedAt: record.recordedDate,
    },
    { status: 201 },
  );
}
