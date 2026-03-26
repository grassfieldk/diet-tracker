import type { ChatMessage, MessageType, NutritionAnalysis } from "@/types";

const WEIGHT_REGEX = /体重\s*(\d+(?:\.\d+)?)\s*k?g/;

const FOOD_KEYWORDS = [
  "朝",
  "昼",
  "夜",
  "夕",
  "おやつ",
  "間食",
  "ご飯",
  "食べ",
  "飲ん",
  "買っ",
  "食った",
  "食べた",
  "kcal",
  "カロリー",
];

function detectType(text: string): MessageType {
  if (WEIGHT_REGEX.test(text)) return "weight";
  if (FOOD_KEYWORDS.some((kw) => text.includes(kw))) return "meal";
  return "off-topic";
}

function mockAnalyzeNutrition(text: string): NutritionAnalysis {
  return {
    foods: [
      {
        name: text.length > 12 ? `${text.slice(0, 12)}…` : text,
        quantity: "適量",
        calories: 350,
        protein: 15.0,
        fat: 10.0,
        carbs: 50.0,
      },
    ],
    totalCalories: 350,
    totalProtein: 15.0,
    totalFat: 10.0,
    totalCarbs: 50.0,
    confidence: "low",
    notes: "詳細な情報が少ないため推定精度が低くなっています",
  };
}

export function analyzeMock(
  text: string,
): Omit<ChatMessage, "id" | "createdAt"> {
  const trimmed = text.trim();
  const type = detectType(trimmed);

  if (type === "weight") {
    const match = WEIGHT_REGEX.exec(trimmed);
    return {
      rawText: trimmed,
      type: "weight",
      weightKg: match ? Number(match[1]) : undefined,
    };
  }

  if (type === "meal") {
    return {
      rawText: trimmed,
      type: "meal",
      analysis: mockAnalyzeNutrition(trimmed),
    };
  }

  return { rawText: trimmed, type: "off-topic" };
}
