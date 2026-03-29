import { Box, Group, Loader, Paper, Stack, Table, Text } from "@mantine/core";
import { IconScale } from "@tabler/icons-react";
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
              <Text size="sm" fw={600}>
                合計 {item.analysis.totalCalories.toLocaleString()} kcal
              </Text>

              <Box style={{ overflowX: "auto" }}>
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
                    {item.analysis.foods.map((food, i) => (
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
              </Box>

              {item.analysis.notes && (
                <Text size="xs" c="dimmed">
                  {item.analysis.notes}
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
              <Text size="sm">体重 {item.weightKg} kg を記録しました</Text>
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
