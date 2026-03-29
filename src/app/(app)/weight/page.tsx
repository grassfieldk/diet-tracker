"use client";

import { Button, Group, NumberInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { WeightEditModal } from "@/components/weight/WeightEditModal";
import { WeightGraph } from "@/components/weight/WeightGraph";
import { WeightList } from "@/components/weight/WeightList";
import type { WeightRecord } from "@/types";

interface ApiWeightRecord {
  id: string;
  weight: number;
  recordedAt: string;
}

function toWeightRecord(r: ApiWeightRecord): WeightRecord {
  return { id: r.id, weight: r.weight, recordedAt: new Date(r.recordedAt) };
}

export default function WeightPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [editing, setEditing] = useState<WeightRecord | null>(null);
  const [days, setDays] = useState(30);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      weight: "" as number | string,
      date: new Date(),
    },
    validate: {
      weight: (v) =>
        v === "" || Number(v) < 10 || Number(v) > 500
          ? "10〜500 の範囲で入力してください"
          : null,
    },
  });

  const loadRecords = (d: number) => {
    fetch(`/api/weights?days=${d}`)
      .then((r) => r.json())
      .then((data: ApiWeightRecord[]) => {
        const converted = data.map(toWeightRecord);
        setRecords(converted);
        // 最新レコードの体重をデフォルト値として設定（初回ロード時のみ）
        if (converted.length > 0) {
          const latest = converted[converted.length - 1];
          form.setFieldValue("weight", latest.weight);
        }
      })
      .catch(() => {});
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: days が変わったときだけ再取得するため意図的
  useEffect(() => {
    loadRecords(days);
  }, [days]);

  const handleSubmit = async (values: {
    weight: number | string;
    date: Date;
  }) => {
    const w = Number(values.weight);
    setSaving(true);
    try {
      const res = await fetch("/api/weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: w,
          recordedAt: values.date.toISOString(),
        }),
      });
      const saved: ApiWeightRecord = await res.json();
      // 同日分が上書きされた場合に備え、既存レコードと id で突き合わせて upsert する
      setRecords((prev) => {
        const exists = prev.some((r) => r.id === saved.id);
        const next = exists
          ? prev.map((r) => (r.id === saved.id ? toWeightRecord(saved) : r))
          : [...prev, toWeightRecord(saved)];
        return next.sort(
          (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime(),
        );
      });
      form.setValues({ weight: "", date: new Date() });
    } catch {
      // エラー時は何もしない
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/weights/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // エラー時は状態を変更しない
    }
  };

  const handleSave = async (id: string, weight: number) => {
    try {
      const res = await fetch(`/api/weights/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight }),
      });
      const updated: ApiWeightRecord = await res.json();
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? toWeightRecord(updated) : r)),
      );
    } catch {
      // エラー時は状態を変更しない
    }
  };

  const inputArea = (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
    >
      <Group align="flex-end" gap="sm">
        <DatePickerInput
          valueFormat="MM/DD"
          placeholder="MM/DD"
          maxDate={new Date()}
          style={{ width: "4rem", textAlign: "center" }}
          styles={{ input: { textAlign: "center" } }}
          {...form.getInputProps("date")}
        />
        <NumberInput
          placeholder="0.0"
          min={10}
          max={500}
          decimalScale={1}
          fixedDecimalScale
          step={0.1}
          style={{ flex: 1 }}
          styles={{ input: { textAlign: "center" } }}
          {...form.getInputProps("weight")}
        />
        <Button
          type="submit"
          loading={saving}
          disabled={form.values.weight === ""}
        >
          記録
        </Button>
      </Group>
    </form>
  );

  return (
    <>
      <PageLayout
        top={<WeightGraph records={records} onRangeChange={setDays} />}
        bottom={inputArea}
      >
        <WeightList
          records={records}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      </PageLayout>

      <WeightEditModal
        record={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </>
  );
}
