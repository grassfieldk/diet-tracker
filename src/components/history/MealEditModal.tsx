"use client";

import { Button, Group, Modal, NumberInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { toFiniteNumber } from "@/lib/client/number";
import type { MealRecord } from "@/types";

interface NutritionValues {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

interface MealEditModalProps {
  record: MealRecord | null;
  onClose: () => void;
  onSave: (id: string, values: NutritionValues) => void;
}

export function MealEditModal({ record, onClose, onSave }: MealEditModalProps) {
  const form = useForm({
    initialValues: {
      totalCalories: record?.analysis.totalCalories ?? 0,
      totalProtein: record?.analysis.totalProtein ?? 0,
      totalFat: record?.analysis.totalFat ?? 0,
      totalCarbs: record?.analysis.totalCarbs ?? 0,
    },
    validate: {
      totalCalories: (v) => (Number(v) < 0 ? "0以上で入力してください" : null),
    },
  });

  // record が変わったとき（別レコードを開いたとき）にフォームをリセット
  useEffect(() => {
    if (record) {
      form.setValues({
        totalCalories: record.analysis.totalCalories,
        totalProtein: record.analysis.totalProtein,
        totalFat: record.analysis.totalFat,
        totalCarbs: record.analysis.totalCarbs,
      });
    }
  }, [record, form.setValues]);

  return (
    <Modal
      opened={record !== null}
      onClose={onClose}
      title="記録を編集"
      centered
    >
      <form
        onSubmit={form.onSubmit((values) => {
          if (!record) return;
          onSave(record.id, {
            totalCalories: toFiniteNumber(values.totalCalories),
            totalProtein: toFiniteNumber(values.totalProtein),
            totalFat: toFiniteNumber(values.totalFat),
            totalCarbs: toFiniteNumber(values.totalCarbs),
          });
          onClose();
        })}
      >
        <Stack>
          <Group grow>
            <NumberInput
              label="カロリー (kcal)"
              min={0}
              {...form.getInputProps("totalCalories")}
            />
            <NumberInput
              label="タンパク質 (g)"
              min={0}
              decimalScale={1}
              step={0.1}
              {...form.getInputProps("totalProtein")}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="脂質 (g)"
              min={0}
              decimalScale={1}
              step={0.1}
              {...form.getInputProps("totalFat")}
            />
            <NumberInput
              label="炭水化物 (g)"
              min={0}
              decimalScale={1}
              step={0.1}
              {...form.getInputProps("totalCarbs")}
            />
          </Group>
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
