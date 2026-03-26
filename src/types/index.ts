export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionAnalysis {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export type MessageType = "meal" | "weight" | "off-topic";

export type MealCategory = "朝食" | "昼食" | "夕食" | "間食";

export interface ChatMessage {
  id: string;
  rawText: string;
  type: MessageType;
  createdAt: Date;
  mealCategory?: MealCategory;
  analysis?: NutritionAnalysis;
  weightKg?: number;
}

/** 履歴画面で扱う食事記録 */
export interface MealRecord {
  id: string;
  rawText: string;
  mealCategory: MealCategory;
  analysis: NutritionAnalysis;
  recordedAt: Date;
}

export type Sex = "male" | "female";

export interface UserProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  bmr: number;
}
