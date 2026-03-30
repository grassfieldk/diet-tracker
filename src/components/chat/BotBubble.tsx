import { Box, Group, Loader, Paper, Stack, Table, Text } from "@mantine/core";
import { IconFlame, IconSalad, IconScale } from "@tabler/icons-react";
import type { BotChatItem } from "@/types";

interface BotBubbleProps {
  item: BotChatItem;
}

export function BotBubble({ item }: BotBubbleProps) {
  return (
    <Group justify="flex-start" style={{ minWidth: 0, overflow: "hidden" }}>
      <Box maw="90%" style={{ minWidth: 0, overflow: "hidden" }}>
        {item.type === "pending" && (
          <Paper
            px="md"
            py="sm"
            withBorder
            radius="md"
            style={{ borderTopLeftRadius: 4 }}
          >
            <Loader size="xs" />
          </Paper>
        )}

        {item.type === "meal" && item.analysis && (
          <Paper
            p="sm"
            withBorder
            radius="md"
            style={{ borderTopLeftRadius: 4 }}
          >
            <Stack gap={8}>
              <Group gap={6}>
                <IconSalad size={16} />
                <Text size="sm">
                  合計 {item.analysis.totalCalories.toLocaleString()}kcal
                  を記録しました
                </Text>
              </Group>

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
            </Stack>
          </Paper>
        )}

        {item.type === "exercise" && item.exerciseAnalysis && (
          <Paper
            p="sm"
            withBorder
            radius="md"
            style={{ borderTopLeftRadius: 4 }}
          >
            <Stack gap={8}>
              <Group gap={6}>
                <IconFlame size={16} color="var(--mantine-color-teal-6)" />
                <Text size="sm">
                  {item.exerciseAnalysis.totalCaloriesBurned.toLocaleString()}
                  kcal 消費しました
                </Text>
              </Group>

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
            </Stack>
          </Paper>
        )}

        {item.type === "weight" && item.weightKg !== undefined && (
          <Paper
            px="md"
            py="sm"
            withBorder
            radius="md"
            style={{ borderTopLeftRadius: 4 }}
          >
            <Group gap={6}>
              <IconScale size={16} />
              <Text size="sm">体重 {item.weightKg}kg を記録しました</Text>
            </Group>
          </Paper>
        )}

        {item.type === "off-topic" && (
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
  );
}
