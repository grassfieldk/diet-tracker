import type { Sex } from "@/types";

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
