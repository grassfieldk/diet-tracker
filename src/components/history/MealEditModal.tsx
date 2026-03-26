"use client";

import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { MealRecord } from "@/types";

interface MealEditModalProps {
  record: MealRecord | null;
  onClose: () => void;
  onSave: (id: string, rawText: string) => void;
}

export function MealEditModal({ record, onClose, onSave }: MealEditModalProps) {
  const form = useForm({
    initialValues: {
      rawText: record?.rawText ?? "",
      totalCalories: record?.analysis.totalCalories ?? 0,
      totalProtein: record?.analysis.totalProtein ?? 0,
      totalFat: record?.analysis.totalFat ?? 0,
      totalCarbs: record?.analysis.totalCarbs ?? 0,
    },
    validate: {
      rawText: (v) =>
        v.trim().length === 0 ? "入力内容を入力してください" : null,
      totalCalories: (v) => (Number(v) < 0 ? "0以上で入力してください" : null),
    },
  });

  // record が変わったとき（別レコードを開いたとき）にフォームをリセット
  useEffect(() => {
    if (record) {
      form.setValues({
        rawText: record.rawText,
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
          onSave(record.id, values.rawText.trim());
          onClose();
        })}
      >
        <Stack>
          <Textarea
            label="入力内容"
            autosize
            minRows={2}
            {...form.getInputProps("rawText")}
          />
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
