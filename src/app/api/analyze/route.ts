import { getAIAdapter } from "@/lib/ai";
import { auth0 } from "@/lib/auth0";
import { detectCategory, detectType } from "@/lib/mock-ai";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { text } = body;

  if (!text || typeof text !== "string") {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const trimmed = text.trim();
  const type = detectType(trimmed);

  if (type === "weight") {
    const match = /体重\s*(\d+(?:\.\d+)?)\s*k?g/.exec(trimmed);
    return Response.json({
      type: "weight",
      weightKg: match ? Number(match[1]) : undefined,
    });
  }

  if (type === "off-topic") {
    return Response.json({ type: "off-topic" });
  }

  // meal: AI アダプターで栄養解析
  const adapter = getAIAdapter();
  const analysis = await adapter.analyzeNutrition(trimmed);
  const mealCategory = detectCategory(trimmed);

  return Response.json({ type: "meal", mealCategory, analysis });
}
