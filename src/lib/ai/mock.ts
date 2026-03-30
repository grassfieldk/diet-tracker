import type { ExerciseAnalysis, NutritionAnalysis } from "@/types";
import type { AIAdapter } from "./types";

export const mockAdapter: AIAdapter = {
  async analyzeNutrition(text: string): Promise<NutritionAnalysis | null> {
    const name = text.length > 12 ? `${text.slice(0, 12)}…` : text;
    return {
      foods: [
        {
          name,
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
  },

  async analyzeExercise(text: string): Promise<ExerciseAnalysis | null> {
    const durationMatch = /(\d+)\s*(分|時間)/.exec(text);
    let durationMin = 30;
    if (durationMatch) {
      durationMin =
        durationMatch[2] === "時間"
          ? Number(durationMatch[1]) * 60
          : Number(durationMatch[1]);
    }
    const caloriesBurned = Math.round(durationMin * 5);
    const name = text.replace(/\s*\d+\s*(分|時間).*/, "").trim() || text;
    return {
      exercises: [{ name, duration: durationMin, caloriesBurned }],
      totalCaloriesBurned: caloriesBurned,
    };
  },
};
