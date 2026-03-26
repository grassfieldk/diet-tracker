"use client";

import { Badge, Box, Group, Paper, Stack, Table, Text } from "@mantine/core";
import {
  IconCandy,
  IconCoffee,
  IconMoon,
  IconScale,
  IconSun,
} from "@tabler/icons-react";
import type { ChatMessage as ChatMessageType, MealCategory } from "@/types";

const CONFIDENCE_BADGE = {
  high: { label: "高", color: "green" },
  medium: { label: "中", color: "yellow" },
  low: { label: "低", color: "red" },
} as const;

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

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <Stack gap={6}>
      {/* ユーザー入力 */}
      <Group justify="flex-end">
        <Stack gap={2} align="flex-end" maw="75%">
          {message.type === "meal" && message.mealCategory && (
            <Badge
              size="xs"
              color={CATEGORY_COLOR[message.mealCategory]}
              variant="light"
              leftSection={getCategoryIcon(message.mealCategory)}
            >
              {message.mealCategory}
            </Badge>
          )}
          <Paper
            px="md"
            py="xs"
            bg="blue.6"
            radius="md"
            style={{ borderBottomRightRadius: 4 }}
          >
            <Text
              size="sm"
              c="white"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {message.rawText}
            </Text>
          </Paper>
        </Stack>
      </Group>

      {/* AI 返答 */}
      <Group justify="flex-start">
        <Box maw="90%">
          {message.type === "meal" && message.analysis && (
            <Paper
              p="sm"
              withBorder
              radius="md"
              style={{ borderTopLeftRadius: 4 }}
            >
              <Stack gap={8}>
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600}>
                    合計 {message.analysis.totalCalories.toLocaleString()} kcal
                  </Text>
                  <Badge
                    size="xs"
                    color={CONFIDENCE_BADGE[message.analysis.confidence].color}
                  >
                    推定精度:{" "}
                    {CONFIDENCE_BADGE[message.analysis.confidence].label}
                  </Badge>
                </Group>

                <Table verticalSpacing={2} fz="xs" withColumnBorders={false}>
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
                    {message.analysis.foods.map((food, i) => (
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

                {message.analysis.notes && (
                  <Text size="xs" c="dimmed">
                    {message.analysis.notes}
                  </Text>
                )}
              </Stack>
            </Paper>
          )}

          {message.type === "weight" && message.weightKg !== undefined && (
            <Paper
              px="md"
              py="sm"
              withBorder
              radius="md"
              style={{ borderTopLeftRadius: 4 }}
            >
              <Group gap={6}>
                <IconScale size={16} />
                <Text size="sm">体重 {message.weightKg} kg を記録しました</Text>
              </Group>
            </Paper>
          )}

          {message.type === "off-topic" && (
            <Paper
              px="md"
              py="sm"
              withBorder
              radius="md"
              style={{ borderTopLeftRadius: 4 }}
            >
              <Text size="sm" c="dimmed">
                食事や体重に関する内容を入力してください。
              </Text>
            </Paper>
          )}
        </Box>
      </Group>
    </Stack>
  );
}
