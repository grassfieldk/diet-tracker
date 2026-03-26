import type { ChatMessage, UserProfile } from "@/types";

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    rawText: "朝 ご飯 納豆",
    type: "meal",
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
      confidence: "high",
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
      confidence: "medium",
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
