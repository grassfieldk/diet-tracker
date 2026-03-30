"use client";

import { Loader, ScrollArea, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { DayGroup } from "@/components/history/DayGroup";
import { MealEditModal } from "@/components/history/MealEditModal";
import type {
  ExerciseAnalysis,
  ExerciseRecord,
  MealCategory,
  MealRecord,
  NutritionAnalysis,
} from "@/types";

function formatDateLabel(date: Date): string {
  const DOW = ["日", "月", "火", "水", "木", "金", "土"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const w = DOW[date.getDay()];
  return `${y}/${m}/${d}（${w}）`;
}

function groupByDate(
  meals: MealRecord[],
  exercises: ExerciseRecord[],
): {
  label: string;
  key: string;
  meals: MealRecord[];
  exercises: ExerciseRecord[];
}[] {
  const keys = new Set<string>();
  const mealMap = new Map<string, MealRecord[]>();
  const exerciseMap = new Map<string, ExerciseRecord[]>();

  for (const record of meals) {
    const d = record.recordedAt;
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    keys.add(key);
    if (!mealMap.has(key)) mealMap.set(key, []);
    mealMap.get(key)?.push(record);
  }
  for (const record of exercises) {
    const d = record.recordedAt;
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    keys.add(key);
    if (!exerciseMap.has(key)) exerciseMap.set(key, []);
    exerciseMap.get(key)?.push(record);
  }

  return Array.from(keys)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => {
      const recs = mealMap.get(key) ?? [];
      const execs = exerciseMap.get(key) ?? [];
      const firstDate =
        recs[0]?.recordedAt ?? execs[0]?.recordedAt ?? new Date();
      return {
        key,
        label: formatDateLabel(firstDate),
        meals: recs,
        exercises: execs,
      };
    });
}

interface ApiMealRecord {
  id: string;
  mealCategory: MealCategory;
  rawText: string;
  analysis: NutritionAnalysis;
  recordedAt: string;
}

interface ApiExerciseRecord {
  id: string;
  rawText: string;
  analysis: ExerciseAnalysis;
  recordedAt: string;
}

function toMealRecord(r: ApiMealRecord): MealRecord {
  return {
    id: r.id,
    mealCategory: r.mealCategory,
    analysis: r.analysis,
    recordedAt: new Date(r.recordedAt),
  };
}

function toExerciseRecord(r: ApiExerciseRecord): ExerciseRecord {
  return {
    id: r.id,
    rawText: r.rawText,
    analysis: r.analysis,
    recordedAt: new Date(r.recordedAt),
  };
}

// モジュールレベルキャッシュ
let cachedRecords: MealRecord[] | null = null;
let cachedExercises: ExerciseRecord[] | null = null;

export default function HistoryPage() {
  const [records, setRecords] = useState<MealRecord[]>(cachedRecords ?? []);
  const [exercises, setExercises] = useState<ExerciseRecord[]>(
    cachedExercises ?? [],
  );
  const [loading, setLoading] = useState(
    cachedRecords === null || cachedExercises === null,
  );
  const [editing, setEditing] = useState<MealRecord | null>(null);

  useEffect(() => {
    if (cachedRecords !== null && cachedExercises !== null) return;
    Promise.all([
      fetch("/api/meals").then((r) => r.json()),
      fetch("/api/exercises").then((r) => r.json()),
    ])
      .then(
        ([mealData, exerciseData]: [ApiMealRecord[], ApiExerciseRecord[]]) => {
          const convertedMeals = mealData.map(toMealRecord);
          const convertedExercises = exerciseData.map(toExerciseRecord);
          cachedRecords = convertedMeals;
          cachedExercises = convertedExercises;
          setRecords(convertedMeals);
          setExercises(convertedExercises);
          setLoading(false);
        },
      )
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleDeleteExercise = async (id: string) => {
    try {
      await fetch(`/api/exercises/${id}`, { method: "DELETE" });
      setExercises((prev) => {
        const next = prev.filter((r) => r.id !== id);
        cachedExercises = next;
        return next;
      });
    } catch {
      // エラー時は状態を変更しない
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/meals/${id}`, { method: "DELETE" });
      setRecords((prev) => {
        const next = prev.filter((r) => r.id !== id);
        cachedRecords = next;
        return next;
      });
    } catch {
      // エラー時は状態を変更しない
    }
  };

  const handleSave = async (
    id: string,
    values: {
      totalCalories: number;
      totalProtein: number;
      totalFat: number;
      totalCarbs: number;
    },
  ) => {
    try {
      const res = await fetch(`/api/meals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const updated: ApiMealRecord = await res.json();
      setRecords((prev) => {
        const next = prev.map((r) => (r.id === id ? toMealRecord(updated) : r));
        cachedRecords = next;
        return next;
      });
    } catch {
      // エラー時は状態を変更しない
    }
  };

  const groups = groupByDate(records, exercises);

  return (
    <>
      <ScrollArea style={{ height: "100%" }}>
        <Stack gap="xl" pb="md">
          {loading ? (
            <Loader size="sm" display="block" mx="auto" mt="xl" />
          ) : groups.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              記録がありません
            </Text>
          ) : (
            groups.map((g) => (
              <DayGroup
                key={g.key}
                dateLabel={g.label}
                meals={g.meals}
                exercises={g.exercises}
                onEdit={setEditing}
                onDelete={handleDelete}
                onDeleteExercise={handleDeleteExercise}
              />
            ))
          )}
        </Stack>
      </ScrollArea>

      <MealEditModal
        record={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </>
  );
}
