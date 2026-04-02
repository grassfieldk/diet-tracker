import { Box, Group, Paper, Stack, Table, Text } from "@mantine/core";
import { IconFlame, IconSalad, IconScale } from "@tabler/icons-react";
import type { BotChatItem } from "@/types";

interface RecordBubbleProps {
  item: BotChatItem;
}

const RECORD_CONFIG = {
  meal: {
    icon: IconSalad,
    color: "var(--mantine-color-yellow-6)",
  },
  weight: {
    icon: IconScale,
    color: "var(--mantine-color-blue-6)",
  },
  exercise: {
    icon: IconFlame,
    color: "var(--mantine-color-orange-6)",
  },
} as const;

function getTitle(item: BotChatItem): string {
  if (item.type === "meal" && item.analysis && item.mealCategory) {
    return `${item.mealCategory}に ${item.analysis.totalCalories.toLocaleString()}kcal を摂取しました`;
  }
  if (item.type === "exercise" && item.exerciseAnalysis) {
    return `${item.exerciseAnalysis.totalCaloriesBurned.toLocaleString()}kcal を消費しました`;
  }
  if (item.type === "weight" && item.weightKg !== undefined) {
    return `体重 ${item.weightKg}kg を記録しました`;
  }
  return "";
}

export function RecordBubble({ item }: RecordBubbleProps) {
  const config = RECORD_CONFIG[item.type as keyof typeof RECORD_CONFIG];
  if (!config) return null;

  const { icon: Icon, color } = config;
  const title = getTitle(item);

  return (
    <Paper p="sm" withBorder radius="md" style={{ borderTopLeftRadius: 4 }}>
      <Stack gap={8}>
        <Group gap={6}>
          <Icon size={16} color={color} />
          <Text size="sm">{title}</Text>
        </Group>

        {item.type === "meal" && item.analysis && (
          <>
            <Text size="sm" fw={500}>
              合計 {item.analysis.totalCalories.toLocaleString()}kcal
            </Text>
            <Box style={{ overflowX: "auto" }}>
              <Table verticalSpacing={2} fz="xs" withColumnBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>食品</Table.Th>
                    <Table.Th>量</Table.Th>
                    <Table.Th ta="center">kcal</Table.Th>
                    <Table.Th ta="center">P</Table.Th>
                    <Table.Th ta="center">F</Table.Th>
                    <Table.Th ta="center">C</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {item.analysis.foods.map((food, i) => (
                    <Table.Tr key={`${food.name}-${i}`}>
                      <Table.Td>{food.name}</Table.Td>
                      <Table.Td>{food.quantity}</Table.Td>
                      <Table.Td ta="center">{food.calories}</Table.Td>
                      <Table.Td ta="center">{food.protein}</Table.Td>
                      <Table.Td ta="center">{food.fat}</Table.Td>
                      <Table.Td ta="center">{food.carbs}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
            {item.analysis.notes && (
              <Text size="xs" c="dimmed">
                {item.analysis.notes}
              </Text>
            )}
          </>
        )}

        {item.type === "exercise" && item.exerciseAnalysis && (
          <>
            <Text size="sm" fw={500}>
              合計 {item.exerciseAnalysis.totalCaloriesBurned.toLocaleString()}
              kcal 消費
            </Text>
            <Table verticalSpacing={2} fz="xs" withColumnBorders={false}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>運動</Table.Th>
                  <Table.Th ta="center">時間</Table.Th>
                  <Table.Th ta="center">消費kcal</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {item.exerciseAnalysis.exercises.map((ex, i) => (
                  <Table.Tr key={`${ex.name}-${i}`}>
                    <Table.Td>{ex.name}</Table.Td>
                    <Table.Td ta="center">{ex.duration}分</Table.Td>
                    <Table.Td ta="center">{ex.caloriesBurned}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {item.exerciseAnalysis.notes && (
              <Text size="xs" c="dimmed">
                {item.exerciseAnalysis.notes}
              </Text>
            )}
          </>
        )}

        {item.type === "weight" && item.weightKg !== undefined && (
          <Text size="sm" fw={500}>
            {item.weightKg}kg
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
