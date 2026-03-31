import { getAIAdapter } from "@/lib/ai";
import { parseJsonBody, requireUserId } from "@/lib/api/request";
import { detectCategory } from "@/lib/mock-ai";
import type { InputMode } from "@/types";

const WEIGHT_REGEX = /(\d+(?:\.\d+)?)\s*k?g?/i;

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }

  const parsedBody = await parseJsonBody<{ text: string; mode: InputMode }>(
    request,
  );
  if ("response" in parsedBody) {
    return parsedBody.response;
  }
  const { text, mode } = parsedBody.data;

  if (!text || typeof text !== "string") {
    return Response.json({ error: "text is required" }, { status: 400 });
  }
  if (!mode || !["meal", "weight", "exercise"].includes(mode)) {
    return Response.json({ error: "mode is required" }, { status: 400 });
  }

  const trimmed = text.trim();
  const adapter = getAIAdapter();

  if (mode === "weight") {
    const match = WEIGHT_REGEX.exec(trimmed);
    const weightKg = match ? Number(match[1]) : null;
    if (weightKg === null || weightKg < 20 || weightKg > 300) {
      return Response.json({ type: "off-topic" });
    }
    return Response.json({ type: "weight", weightKg });
  }

  if (mode === "exercise") {
    const analysis = await adapter.analyzeExercise(trimmed);
    if (!analysis) return Response.json({ type: "off-topic" });
    return Response.json({ type: "exercise", analysis });
  }

  // meal
  const analysis = await adapter.analyzeNutrition(trimmed);
  if (!analysis) return Response.json({ type: "off-topic" });
  const mealCategory = detectCategory(trimmed);
  return Response.json({ type: "meal", mealCategory, analysis });
}
