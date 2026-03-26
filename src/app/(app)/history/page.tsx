"use client";

import { ScrollArea, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { DayGroup } from "@/components/history/DayGroup";
import { MealEditModal } from "@/components/history/MealEditModal";
import { MOCK_MEAL_RECORDS } from "@/lib/mock-data";
import type { MealRecord } from "@/types";

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

export default function HistoryPage() {
  const [records, setRecords] = useState<MealRecord[]>(MOCK_MEAL_RECORDS);
  const [editing, setEditing] = useState<MealRecord | null>(null);

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = (id: string, rawText: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, rawText } : r)),
    );
  };

  const groups = groupByDate(records);

  return (
    <>
      <ScrollArea style={{ height: "100%" }}>
        <Stack gap="xl" pb="md">
          {groups.length === 0 ? (
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
