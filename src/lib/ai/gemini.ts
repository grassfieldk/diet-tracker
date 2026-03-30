import { GoogleGenAI } from "@google/genai";
import type { ExerciseAnalysis, NutritionAnalysis } from "@/types";
import type { AIAdapter } from "./types";

const OFF_TOPIC_INSTRUCTION =
  "入力内容が上記の解析対象と全く無関係な場合は、JSONの代わりに文字列 false のみを返せ。";

const NUTRITION_PROMPT = (text: string) =>
  `
以下の食事テキストを解析し、食品リストと栄養素をJSONのみで返せ。説明文は一切含めるな。
数値は推定でよい。不明な場合は一般的な値を使え。
${OFF_TOPIC_INSTRUCTION}

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

const EXERCISE_PROMPT = (text: string) =>
  `
以下の運動テキストを解析し、運動リストと消費カロリーをJSONのみで返せ。説明文は一切含めるな。
数値は推定でよい。時間の記載がない場合は30分と仮定せよ。
${OFF_TOPIC_INSTRUCTION}

テキスト: "${text}"

レスポンス形式（このJSONのみ返すこと）:
{
  "exercises": [
    {"name": "運動名", "duration": 分数, "caloriesBurned": 数値}
  ],
  "totalCaloriesBurned": 数値,
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
    async analyzeNutrition(text: string): Promise<NutritionAnalysis | null> {
      const response = await ai.models.generateContent({
        model,
        contents: NUTRITION_PROMPT(text),
        config: { responseMimeType: "text/plain" },
      });

      const raw = (response.text ?? "")
        .replace(/```json\n?|\n?```/g, "")
        .trim();
      if (raw === "false") return null;
      return JSON.parse(raw) as NutritionAnalysis;
    },

    async analyzeExercise(text: string): Promise<ExerciseAnalysis | null> {
      const response = await ai.models.generateContent({
        model,
        contents: EXERCISE_PROMPT(text),
        config: { responseMimeType: "text/plain" },
      });

      const raw = (response.text ?? "")
        .replace(/```json\n?|\n?```/g, "")
        .trim();
      if (raw === "false") return null;
      return JSON.parse(raw) as ExerciseAnalysis;
    },
  };
}
