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

export interface ChatMessage {
  id: string;
  rawText: string;
  type: MessageType;
  createdAt: Date;
  analysis?: NutritionAnalysis;
  weightKg?: number;
}

export type Sex = "male" | "female";

export interface UserProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  bmr: number;
}
