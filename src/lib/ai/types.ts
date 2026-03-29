import type { NutritionAnalysis } from "@/types";

export interface AIAdapter {
  analyzeNutrition(text: string): Promise<NutritionAnalysis>;
}
