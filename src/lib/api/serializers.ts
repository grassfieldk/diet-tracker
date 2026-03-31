import type { ExerciseAnalysis, NutritionAnalysis } from "@/types";

interface MealLike {
  id: string;
  mealCategory: string;
  rawText: string | null;
  analysisJson: unknown;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  recordedDate: Date;
}

interface ExerciseLike {
  id: string;
  rawText: string | null;
  analysisJson: unknown;
  totalCaloriesBurned: number;
  recordedDate: Date;
}

interface WeightLike {
  id: string;
  weight: number;
  recordedAt: Date;
}

export function toMealResponse(record: MealLike) {
  return {
    id: record.id,
    mealCategory: record.mealCategory,
    rawText: record.rawText ?? "",
    analysis: record.analysisJson as NutritionAnalysis,
    totalCalories: record.totalCalories,
    totalProtein: record.totalProtein,
    totalFat: record.totalFat,
    totalCarbs: record.totalCarbs,
    recordedAt: record.recordedDate,
  };
}

export function toExerciseResponse(record: ExerciseLike) {
  return {
    id: record.id,
    rawText: record.rawText ?? "",
    analysis: record.analysisJson as ExerciseAnalysis,
    totalCaloriesBurned: record.totalCaloriesBurned,
    recordedAt: record.recordedDate,
  };
}

export function toWeightResponse(record: WeightLike) {
  return {
    id: record.id,
    weight: record.weight,
    recordedAt: record.recordedAt,
  };
}
