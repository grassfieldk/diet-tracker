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
  notes?: string;
}

export interface ExerciseItem {
  name: string;
  duration: number; // 分
  caloriesBurned: number;
}

export interface ExerciseAnalysis {
  exercises: ExerciseItem[];
  totalCaloriesBurned: number;
  notes?: string;
}

export type MessageType = "meal" | "weight" | "exercise" | "off-topic";
export type InputMode = "meal" | "weight" | "exercise";

export type MealCategory = "朝食" | "昼食" | "夕食" | "間食";

// --- チャット UI 用の型 ---

/** ユーザーが送信したメッセージ */
export interface UserChatItem {
  kind: "user";
  id: string;
  text: string;
  createdAt: Date;
}

/** AI / システムの返答 */
export type BotResponseType =
  | "meal"
  | "weight"
  | "exercise"
  | "off-topic"
  | "pending";

export interface BotChatItem {
  kind: "bot";
  id: string;
  type: BotResponseType;
  mealCategory?: MealCategory;
  analysis?: NutritionAnalysis;
  weightKg?: number;
  exerciseAnalysis?: ExerciseAnalysis;
  createdAt: Date;
}

export type ChatItem = UserChatItem | BotChatItem;

// --- 後方互換（mock-ai.ts / mock-data.ts が参照）---
/** @deprecated ChatItem を使用してください */
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
  mealCategory: MealCategory;
  analysis: NutritionAnalysis;
  recordedAt: Date;
}

/** 履歴画面で扱う運動記録 */
export interface ExerciseRecord {
  id: string;
  rawText: string;
  analysis: ExerciseAnalysis;
  recordedAt: Date;
}

/** 体重管理画面で扱う体重記録 */
export interface WeightRecord {
  id: string;
  weight: number;
  recordedAt: Date;
}

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type CalTarget = "bmr" | "tdee";

export interface UserProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  birthDate?: string; // ISO date string
  sex: Sex;
  bmr: number;
  tdee?: number;
  activityLevel?: ActivityLevel;
  calTarget?: CalTarget;
}
