"use client";

import { Button, Group, Modal, NumberInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { WeightRecord } from "@/types";

interface WeightEditModalProps {
  record: WeightRecord | null;
  onClose: () => void;
  onSave: (id: string, weight: number) => void;
}

export function WeightEditModal({
  record,
  onClose,
  onSave,
}: WeightEditModalProps) {
  const form = useForm({
    initialValues: { weight: record?.weight ?? 60 },
    validate: {
      weight: (v) =>
        Number(v) < 10 || Number(v) > 500
          ? "10〜500 の範囲で入力してください"
          : null,
    },
  });

  useEffect(() => {
    if (record) form.setValues({ weight: record.weight });
  }, [record, form.setValues]);

  return (
    <Modal
      opened={record !== null}
      onClose={onClose}
      title="体重を編集"
      centered
    >
      <form
        onSubmit={form.onSubmit((values) => {
          if (!record) return;
          onSave(record.id, Number(values.weight));
          onClose();
        })}
      >
        <Stack>
          <NumberInput
            label="体重 (kg)"
            min={10}
            max={500}
            decimalScale={1}
            step={0.1}
            {...form.getInputProps("weight")}
          />
          <Group justify="flex-end">
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
