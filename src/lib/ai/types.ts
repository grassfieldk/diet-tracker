import type { ExerciseAnalysis, NutritionAnalysis } from "@/types";

export interface AIAdapter {
  analyzeNutrition(text: string): Promise<NutritionAnalysis | null>;
  analyzeExercise(text: string): Promise<ExerciseAnalysis | null>;
}
