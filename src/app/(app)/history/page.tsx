"use client";

import { Loader, ScrollArea, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { DayGroup } from "@/components/history/DayGroup";
import { MealEditModal } from "@/components/history/MealEditModal";
import type { MealCategory, MealRecord, NutritionAnalysis } from "@/types";

function formatDateLabel(date: Date): string {
  const DOW = ["日", "月", "火", "水", "木", "金", "土"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const w = DOW[date.getDay()];
  return `${y}/${m}/${d}（${w}）`;
}

function groupByDate(
  records: MealRecord[],
): { label: string; key: string; records: MealRecord[] }[] {
  const map = new Map<string, MealRecord[]>();
  for (const record of records) {
    const d = record.recordedAt;
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(record);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, recs]) => ({
      key,
      label: formatDateLabel(recs[0].recordedAt),
      records: recs,
    }));
}

interface ApiMealRecord {
  id: string;
  mealCategory: MealCategory;
  rawText: string;
  analysis: NutritionAnalysis;
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

// モジュールレベルキャッシュ
let cachedRecords: MealRecord[] | null = null;

export default function HistoryPage() {
  const [records, setRecords] = useState<MealRecord[]>(cachedRecords ?? []);
  const [loading, setLoading] = useState(cachedRecords === null);
  const [editing, setEditing] = useState<MealRecord | null>(null);

  useEffect(() => {
    if (cachedRecords !== null) return;
    fetch("/api/meals")
      .then((r) => r.json())
      .then((data: ApiMealRecord[]) => {
        const converted = data.map(toMealRecord);
        cachedRecords = converted;
        setRecords(converted);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

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

  const groups = groupByDate(records);

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
                records={g.records}
                onEdit={setEditing}
                onDelete={handleDelete}
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
