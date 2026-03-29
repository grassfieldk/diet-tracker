import { Badge, Divider, Loader, Stack, Text } from "@mantine/core";
import type { ChatItem } from "@/types";
import { BotBubble } from "./BotBubble";
import { UserBubble } from "./UserBubble";

interface ChatHistoryProps {
  items: ChatItem[];
  loading?: boolean;
}

function formatDateBadge(date: Date): string {
  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "今日";
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

export function ChatHistory({ items, loading = false }: ChatHistoryProps) {
  if (loading) {
    return <Loader size="sm" display="block" mx="auto" mt="xl" />;
  }
  if (items.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl" size="sm">
        記録はまだありません
      </Text>
    );
  }

  const nodes: React.ReactNode[] = [];
  let lastDateStr = "";

  for (const item of items) {
    const dateStr = item.createdAt.toDateString();
    if (dateStr !== lastDateStr) {
      lastDateStr = dateStr;
      nodes.push(
        <Divider
          key={`sep-${dateStr}`}
          label={
            <Badge variant="light" color="gray" size="sm" radius="xl">
              {formatDateBadge(item.createdAt)}
            </Badge>
          }
          labelPosition="center"
          my={4}
        />,
      );
    }
    if (item.kind === "user") {
      nodes.push(<UserBubble key={item.id} item={item} />);
    } else {
      nodes.push(<BotBubble key={item.id} item={item} />);
    }
  }

  return (
    <Stack gap="sm" pb="xs">
      {nodes}
    </Stack>
  );
}
