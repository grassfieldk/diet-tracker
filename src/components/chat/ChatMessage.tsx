"use client";

import { Box, Group, Paper, Stack, Table, Text } from "@mantine/core";
import { IconScale } from "@tabler/icons-react";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <Stack gap={6}>
      {/* ユーザー入力 */}
      <Group justify="flex-end">
        <Stack gap={2} align="flex-end" maw="75%">
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
      <Group justify="flex-start" style={{ minWidth: 0, overflow: "hidden" }}>
        <Box maw="90%" style={{ minWidth: 0, overflow: "hidden" }}>
          {message.type === "meal" && message.analysis && (
            <Paper
              p="sm"
              withBorder
              radius="md"
              style={{ borderTopLeftRadius: 4 }}
            >
              <Stack gap={8}>
                <Text size="sm" fw={600}>
                  合計 {message.analysis.totalCalories.toLocaleString()} kcal
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
                </Box>

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
