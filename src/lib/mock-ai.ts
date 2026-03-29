import type {
  ChatMessage,
  MealCategory,
  MessageType,
  NutritionAnalysis,
} from "@/types";

const WEIGHT_REGEX = /体重\s*(\d+(?:\.\d+)?)\s*k?g/;

const MEAL_CATEGORY_RULES: [string[], MealCategory][] = [
  [["朝", "朝食", "モーニング"], "朝食"],
  [["昼", "昼食", "ランチ"], "昼食"],
  [["夕", "夜", "夕食", "夕飯", "晩食", "晩飯", "ディナー"], "夕食"],
  [["おやつ", "間食", "スナック"], "間食"],
];

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

export function detectType(text: string): MessageType {
  if (WEIGHT_REGEX.test(text)) return "weight";
  if (FOOD_KEYWORDS.some((kw) => text.includes(kw))) return "meal";
  return "off-topic";
}

export function detectCategory(text: string): MealCategory {
  for (const [keywords, category] of MEAL_CATEGORY_RULES) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "間食";
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
      mealCategory: detectCategory(trimmed),
      analysis: mockAnalyzeNutrition(trimmed),
    };
  }

  return { rawText: trimmed, type: "off-topic" };
}
