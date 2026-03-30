import type { MealCategory } from "@/types";

const MEAL_CATEGORY_RULES: [string[], MealCategory][] = [
  [["朝", "朝食", "モーニング"], "朝食"],
  [["昼", "昼食", "ランチ"], "昼食"],
  [["夕", "夜", "夕食", "夕飯", "晩食", "晩飯", "ディナー"], "夕食"],
  [["おやつ", "間食", "スナック"], "間食"],
];

export function detectCategory(text: string): MealCategory {
  for (const [keywords, category] of MEAL_CATEGORY_RULES) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "間食";
}
