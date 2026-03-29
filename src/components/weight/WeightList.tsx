"use client";

import { ActionIcon, Divider, Group, Stack, Text } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { WeightRecord } from "@/types";

interface WeightListProps {
  records: WeightRecord[];
  onEdit: (record: WeightRecord) => void;
  onDelete: (id: string) => void;
}

function formatDate(date: Date): string {
  const DOW = ["日", "月", "火", "水", "木", "金", "土"];
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const w = DOW[date.getDay()];
  return `${date.getFullYear()}/${m}/${d}（${w}）`;
}

export function WeightList({ records, onEdit, onDelete }: WeightListProps) {
  if (records.length === 0) {
    return (
      <Text ta="center" c="dimmed" size="sm" py="md">
        記録がありません
      </Text>
    );
  }

  return (
    <Stack gap={0}>
      {[...records].reverse().map((record, i) => (
        <div key={record.id}>
          {i > 0 && <Divider />}
          <Group justify="space-between" px="md" py="xs">
            <Group gap="md">
              <Text size="sm" c="dimmed" style={{ minWidth: "10rem" }}>
                {formatDate(record.recordedAt)}
              </Text>
              <Text fw={600}>
                {record.weight.toFixed(1)}
                <Text component="span" size="sm" fw={400} c="dimmed">
                  {" "}
                  kg
                </Text>
              </Text>
            </Group>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => onEdit(record)}
                aria-label="編集"
              >
                <IconPencil size={14} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => onDelete(record.id)}
                aria-label="削除"
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          </Group>
        </div>
      ))}
    </Stack>
  );
}
