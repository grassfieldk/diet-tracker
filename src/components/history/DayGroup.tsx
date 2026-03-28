"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Collapse,
  Group,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCandy,
  IconChevronDown,
  IconChevronUp,
  IconCoffee,
  IconEdit,
  IconMoon,
  IconSun,
  IconTrash,
} from "@tabler/icons-react";
import type { MealCategory, MealRecord } from "@/types";

const CATEGORY_COLOR: Record<MealCategory, string> = {
  朝食: "orange",
  昼食: "blue",
  夕食: "violet",
  間食: "gray",
};

function getCategoryIcon(category: MealCategory) {
  const icons = {
    朝食: IconCoffee,
    昼食: IconSun,
    夕食: IconMoon,
    間食: IconCandy,
  };
  const Icon = icons[category];
  return <Icon size={10} />;
}

interface MealRecordRowProps {
  record: MealRecord;
  onEdit: (record: MealRecord) => void;
  onDelete: (id: string) => void;
}

function MealRecordRow({ record, onEdit, onDelete }: MealRecordRowProps) {
  const [expanded, { toggle }] = useDisclosure(false);
  const { analysis } = record;

  return (
    <Paper
      withBorder
      radius="sm"
      p="sm"
      onClick={toggle}
      style={{ cursor: "pointer" }}
    >
      <Stack gap={6}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            <Badge
              size="xs"
              color={CATEGORY_COLOR[record.mealCategory]}
              variant="light"
              style={{ flexShrink: 0 }}
              leftSection={getCategoryIcon(record.mealCategory)}
            >
              {record.mealCategory}
            </Badge>
            <Text size="sm" style={{ wordBreak: "break-word" }}>
              {record.analysis.foods.map((f) => f.name).join("、")}
            </Text>
          </Group>
          <Group gap={4} style={{ flexShrink: 0 }}>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              aria-label="編集"
            >
              <IconEdit size={14} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record.id);
              }}
              aria-label="削除"
            >
              <IconTrash size={14} />
            </ActionIcon>
            {expanded ? (
              <IconChevronUp size={14} style={{ flexShrink: 0 }} />
            ) : (
              <IconChevronDown size={14} style={{ flexShrink: 0 }} />
            )}
          </Group>
        </Group>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "4em 4em 4em 4em",
            alignItems: "center",
            // textAlign: "right",
            gap: "0 4px",
          }}
        >
          <Text size="xs" fw={600} ta="right">
            {analysis.totalCalories.toLocaleString()} kcal
          </Text>
          <Text size="xs" c="dimmed" ta="right">
            P: {analysis.totalProtein}g
          </Text>
          <Text size="xs" c="dimmed" ta="right">
            F: {analysis.totalFat}g
          </Text>
          <Text size="xs" c="dimmed" ta="right">
            C: {analysis.totalCarbs}g
          </Text>
        </Box>

        <Collapse in={expanded}>
          <Box pt={4}>
            <Table fz="xs" verticalSpacing={2} withColumnBorders={false}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>食品</Table.Th>
                  <Table.Th>量</Table.Th>
                  <Table.Th ta="right">kcal</Table.Th>
                  <Table.Th ta="right">P(g)</Table.Th>
                  <Table.Th ta="right">F(g)</Table.Th>
                  <Table.Th ta="right">C(g)</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {analysis.foods.map((food, i) => (
                  <Table.Tr key={`${food.name}-${i}`}>
                    <Table.Td>{food.name}</Table.Td>
                    <Table.Td>{food.quantity}</Table.Td>
                    <Table.Td ta="right">{food.calories}</Table.Td>
                    <Table.Td ta="right">{food.protein}</Table.Td>
                    <Table.Td ta="right">{food.fat}</Table.Td>
                    <Table.Td ta="right">{food.carbs}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {analysis.notes && (
              <Text size="xs" c="dimmed" mt={4}>
                {analysis.notes}
              </Text>
            )}
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
}

interface DayGroupProps {
  dateLabel: string;
  records: MealRecord[];
  onEdit: (record: MealRecord) => void;
  onDelete: (id: string) => void;
}

export function DayGroup({
  dateLabel,
  records,
  onEdit,
  onDelete,
}: DayGroupProps) {
  const totalCalories = records.reduce(
    (s, r) => s + r.analysis.totalCalories,
    0,
  );
  const totalProtein = records.reduce((s, r) => s + r.analysis.totalProtein, 0);
  const totalFat = records.reduce((s, r) => s + r.analysis.totalFat, 0);
  const totalCarbs = records.reduce((s, r) => s + r.analysis.totalCarbs, 0);

  return (
    <Stack gap="xs">
      <Paper
        bg="var(--mantine-color-default-hover)"
        px="md"
        py="xs"
        radius="sm"
      >
        <Group justify="space-between" wrap="wrap" gap={4}>
          <Text fw={600} size="sm">
            {dateLabel}
          </Text>
          <Group gap={12}>
            <Text size="sm" fw={600}>
              {totalCalories.toLocaleString()} kcal
            </Text>
            <Text size="xs" c="dimmed">
              P {Math.round(totalProtein * 10) / 10}g　F{" "}
              {Math.round(totalFat * 10) / 10}g　C{" "}
              {Math.round(totalCarbs * 10) / 10}g
            </Text>
          </Group>
        </Group>
      </Paper>
      <Stack gap="xs">
        {records.map((record) => (
          <MealRecordRow
            key={record.id}
            record={record}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Stack>
    </Stack>
  );
}
