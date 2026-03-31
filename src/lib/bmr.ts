import type { ActivityLevel, Sex } from "@/types";

/** ハリス-ベネディクト式で基礎代謝を計算する */
export function calculateBmr(
  heightCm: number,
  weightKg: number,
  age: number,
  sex: Sex,
): number {
  if (sex === "male") {
    return Math.round(
      66.47 + 13.75 * weightKg + 5.003 * heightCm - 6.755 * age,
    );
  }
  return Math.round(655.1 + 9.563 * weightKg + 1.85 * heightCm - 4.676 * age);
}

export const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  multiplier: number;
}[] = [
  {
    value: "sedentary",
    label: "ほとんどしない",
    multiplier: 1.2,
  },
  {
    value: "light",
    label: "週に 1、2 回",
    multiplier: 1.375,
  },
  {
    value: "moderate",
    label: "2 日に 1 回程度",
    multiplier: 1.55,
  },
  {
    value: "active",
    label: "ほぼ毎日",
    multiplier: 1.725,
  },
  {
    value: "very_active",
    label: "毎日 2 回以上",
    multiplier: 1.9,
  },
];

/** TDEE を計算する */
export function calculateTdee(
  bmr: number,
  activityLevel: ActivityLevel,
): number {
  const level = ACTIVITY_LEVELS.find((l) => l.value === activityLevel);
  return Math.round(bmr * (level?.multiplier ?? 1.2));
}

/** 誕生日から現在の年齢を計算する */
export function ageFromBirthDate(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}
