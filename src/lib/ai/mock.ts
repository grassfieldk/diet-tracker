import type { NutritionAnalysis } from "@/types";
import type { AIAdapter } from "./types";

export const mockAdapter: AIAdapter = {
  async analyzeNutrition(text: string): Promise<NutritionAnalysis> {
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
};
