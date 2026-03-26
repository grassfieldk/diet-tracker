import { Stack, Text } from "@mantine/core";
import type { ChatMessage as ChatMessageType } from "@/types";
import { ChatMessage } from "./ChatMessage";

interface ChatHistoryProps {
  messages: ChatMessageType[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  if (messages.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl" size="sm">
        今日の記録はまだありません
      </Text>
    );
  }

  return (
    <Stack gap="lg" pb="xs">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </Stack>
  );
}
