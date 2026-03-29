import { Group, Paper, Stack, Text } from "@mantine/core";
import type { UserChatItem } from "@/types";

interface UserBubbleProps {
  item: UserChatItem;
}

export function UserBubble({ item }: UserBubbleProps) {
  return (
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
            {item.text}
          </Text>
        </Paper>
      </Stack>
    </Group>
  );
}
