import { GoogleGenAI } from "@google/genai";
import type { NutritionAnalysis } from "@/types";
import type { AIAdapter } from "./types";

const PROMPT_TEMPLATE = (text: string) =>
  `
以下の食事テキストを解析し、食品リストと栄養素をJSONのみで返せ。説明文は一切含めるな。
数値は推定でよい。不明な場合は一般的な値を使え。

テキスト: "${text}"

レスポンス形式（このJSONのみ返すこと）:
{
  "foods": [
    {"name": "食品名", "quantity": "量", "calories": 数値, "protein": 数値, "fat": 数値, "carbs": 数値}
  ],
  "totalCalories": 数値,
  "totalProtein": 数値,
  "totalFat": 数値,
  "totalCarbs": 数値,
  "notes": "補足があれば（任意）"
}
`.trim();

export function createGeminiAdapter(): AIAdapter {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  return {
    async analyzeNutrition(text: string): Promise<NutritionAnalysis> {
      const response = await ai.models.generateContent({
        model,
        contents: PROMPT_TEMPLATE(text),
        config: {
          responseMimeType: "application/json",
        },
      });

      const raw = response.text ?? "";
      // コードブロックが含まれる場合に備えてクリーンアップ
      const json = raw.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(json) as NutritionAnalysis;
    },
  };
}
