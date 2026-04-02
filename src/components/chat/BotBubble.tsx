import { Box, Group, Loader, Paper, Text } from "@mantine/core";
import type { BotChatItem } from "@/types";
import { RecordBubble } from "./RecordBubble";

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

        {(item.type === "meal" ||
          item.type === "weight" ||
          item.type === "exercise") && <RecordBubble item={item} />}

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
