import type { ChatMessage, MealRecord, UserProfile } from "@/types";

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    rawText: "朝 ご飯 納豆",
    type: "meal",
    mealCategory: "朝食",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    analysis: {
      foods: [
        {
          name: "ご飯",
          quantity: "1杯(150g)",
          calories: 252,
          protein: 3.8,
          fat: 0.5,
          carbs: 55.7,
        },
        {
          name: "納豆",
          quantity: "1パック(45g)",
          calories: 81,
          protein: 6.6,
          fat: 4.5,
          carbs: 5.4,
        },
      ],
      totalCalories: 333,
      totalProtein: 10.4,
      totalFat: 5.0,
      totalCarbs: 61.1,
    },
  },
  {
    id: "2",
    rawText: "体重 87.4kg",
    type: "weight",
    createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    weightKg: 87.4,
  },
  {
    id: "3",
    rawText: "昼 ラーメン 餃子3個",
    type: "meal",
    mealCategory: "昼食",
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    analysis: {
      foods: [
        {
          name: "ラーメン",
          quantity: "1杯",
          calories: 457,
          protein: 17.0,
          fat: 14.0,
          carbs: 66.0,
        },
        {
          name: "餃子",
          quantity: "3個",
          calories: 111,
          protein: 5.4,
          fat: 6.0,
          carbs: 9.0,
        },
      ],
      totalCalories: 568,
      totalProtein: 22.4,
      totalFat: 20.0,
      totalCarbs: 75.0,
      notes: "ラーメンは種類により大きく異なります",
    },
  },
];

export const MOCK_USER_PROFILE: UserProfile = {
  heightCm: 175,
  weightKg: 87.4,
  age: 35,
  sex: "male",
  bmr: 1961,
};

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const MOCK_MEAL_RECORDS: MealRecord[] = [
  // 3日前
  {
    id: "h1",
    mealCategory: "朝食",
    recordedAt: daysAgo(3),
    analysis: {
      foods: [
        {
          name: "食パン",
          quantity: "2枚(120g)",
          calories: 317,
          protein: 11.3,
          fat: 4.4,
          carbs: 58.8,
        },
        {
          name: "バター",
          quantity: "10g",
          calories: 74,
          protein: 0.1,
          fat: 8.2,
          carbs: 0.0,
        },
        {
          name: "コーヒー（ブラック）",
          quantity: "1杯",
          calories: 4,
          protein: 0.3,
          fat: 0.0,
          carbs: 0.7,
        },
      ],
      totalCalories: 395,
      totalProtein: 11.7,
      totalFat: 12.6,
      totalCarbs: 59.5,
    },
  },
  {
    id: "h2",
    mealCategory: "昼食",
    recordedAt: daysAgo(3),
    analysis: {
      foods: [
        {
          name: "牛丼",
          quantity: "並盛",
          calories: 635,
          protein: 22.0,
          fat: 17.0,
          carbs: 94.0,
        },
        {
          name: "みそ汁",
          quantity: "1杯",
          calories: 35,
          protein: 2.5,
          fat: 1.2,
          carbs: 3.9,
        },
      ],
      totalCalories: 670,
      totalProtein: 24.5,
      totalFat: 18.2,
      totalCarbs: 97.9,
    },
  },
  {
    id: "h3",
    mealCategory: "夕食",
    recordedAt: daysAgo(3),
    analysis: {
      foods: [
        {
          name: "焼き魚（サバ）",
          quantity: "1切れ(100g)",
          calories: 202,
          protein: 20.6,
          fat: 12.1,
          carbs: 0.3,
        },
        {
          name: "ご飯",
          quantity: "1杯(150g)",
          calories: 252,
          protein: 3.8,
          fat: 0.5,
          carbs: 55.7,
        },
        {
          name: "豆腐のみそ汁",
          quantity: "1杯",
          calories: 51,
          protein: 3.8,
          fat: 2.0,
          carbs: 4.3,
        },
      ],
      totalCalories: 505,
      totalProtein: 28.2,
      totalFat: 14.6,
      totalCarbs: 60.3,
    },
  },
  // 2日前
  {
    id: "h4",
    mealCategory: "朝食",
    recordedAt: daysAgo(2),
    analysis: {
      foods: [
        {
          name: "ヨーグルト（無糖）",
          quantity: "100g",
          calories: 62,
          protein: 3.6,
          fat: 3.0,
          carbs: 4.9,
        },
        {
          name: "バナナ",
          quantity: "1本(100g)",
          calories: 86,
          protein: 1.1,
          fat: 0.2,
          carbs: 22.5,
        },
      ],
      totalCalories: 148,
      totalProtein: 4.7,
      totalFat: 3.2,
      totalCarbs: 27.4,
    },
  },
  {
    id: "h5",
    mealCategory: "昼食",
    recordedAt: daysAgo(2),
    analysis: {
      foods: [
        {
          name: "カレーライス",
          quantity: "1皿",
          calories: 748,
          protein: 18.5,
          fat: 20.4,
          carbs: 118.4,
        },
      ],
      totalCalories: 748,
      totalProtein: 18.5,
      totalFat: 20.4,
      totalCarbs: 118.4,
      notes: "カレーのルーや具材により大きく変動します",
    },
  },
  {
    id: "h6",
    mealCategory: "夕食",
    recordedAt: daysAgo(2),
    analysis: {
      foods: [
        {
          name: "唐揚げ",
          quantity: "4個(120g)",
          calories: 358,
          protein: 24.5,
          fat: 22.1,
          carbs: 13.3,
        },
        {
          name: "ビール",
          quantity: "350ml",
          calories: 140,
          protein: 1.1,
          fat: 0.0,
          carbs: 11.2,
        },
        {
          name: "サラダ",
          quantity: "1皿",
          calories: 25,
          protein: 1.2,
          fat: 0.3,
          carbs: 4.5,
        },
      ],
      totalCalories: 523,
      totalProtein: 26.8,
      totalFat: 22.4,
      totalCarbs: 29.0,
    },
  },
  // 昨日
  {
    id: "h7",
    mealCategory: "朝食",
    recordedAt: daysAgo(1),
    analysis: {
      foods: [
        {
          name: "ご飯",
          quantity: "1杯(150g)",
          calories: 252,
          protein: 3.8,
          fat: 0.5,
          carbs: 55.7,
        },
        {
          name: "納豆",
          quantity: "1パック(45g)",
          calories: 81,
          protein: 6.6,
          fat: 4.5,
          carbs: 5.4,
        },
        {
          name: "卵焼き",
          quantity: "2切れ",
          calories: 128,
          protein: 8.6,
          fat: 9.0,
          carbs: 2.0,
        },
      ],
      totalCalories: 461,
      totalProtein: 19.0,
      totalFat: 14.0,
      totalCarbs: 63.1,
    },
  },
  {
    id: "h8",
    mealCategory: "昼食",
    recordedAt: daysAgo(1),
    analysis: {
      foods: [
        {
          name: "おにぎり（ツナマヨ）",
          quantity: "1個(100g)",
          calories: 201,
          protein: 4.0,
          fat: 3.4,
          carbs: 39.4,
        },
        {
          name: "おにぎり（鮭）",
          quantity: "1個(100g)",
          calories: 170,
          protein: 5.3,
          fat: 0.6,
          carbs: 36.2,
        },
        {
          name: "サラダチキン",
          quantity: "1袋(115g)",
          calories: 120,
          protein: 25.3,
          fat: 1.6,
          carbs: 0.0,
        },
      ],
      totalCalories: 491,
      totalProtein: 34.6,
      totalFat: 5.6,
      totalCarbs: 75.6,
    },
  },
  {
    id: "h9",
    mealCategory: "夕食",
    recordedAt: daysAgo(1),
    analysis: {
      foods: [
        {
          name: "ミートソーススパゲッティ",
          quantity: "1人前(250g)",
          calories: 530,
          protein: 22.0,
          fat: 14.0,
          carbs: 78.0,
        },
      ],
      totalCalories: 530,
      totalProtein: 22.0,
      totalFat: 14.0,
      totalCarbs: 78.0,
    },
  },
];
