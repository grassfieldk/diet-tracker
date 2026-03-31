import type {
  ExerciseAnalysis,
  ExerciseRecord,
  MealCategory,
  MealRecord,
  NutritionAnalysis,
  WeightRecord,
} from "@/types";

export interface ApiMealRecord {
  id: string;
  mealCategory: MealCategory;
  rawText: string;
  analysis: NutritionAnalysis;
  recordedAt: string;
}

export interface ApiExerciseRecord {
  id: string;
  rawText: string;
  analysis: ExerciseAnalysis;
  recordedAt: string;
}

export interface ApiWeightRecord {
  id: string;
  weight: number;
  recordedAt: string;
}

export function toMealRecord(r: ApiMealRecord): MealRecord {
  return {
    id: r.id,
    mealCategory: r.mealCategory,
    analysis: r.analysis,
    recordedAt: new Date(r.recordedAt),
  };
}

export function toExerciseRecord(r: ApiExerciseRecord): ExerciseRecord {
  return {
    id: r.id,
    rawText: r.rawText,
    analysis: r.analysis,
    recordedAt: new Date(r.recordedAt),
  };
}

export function toWeightRecord(r: ApiWeightRecord): WeightRecord {
  return { id: r.id, weight: r.weight, recordedAt: new Date(r.recordedAt) };
}
