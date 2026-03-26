"use client";

import { ActionIcon, Group, Textarea } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Group gap="xs" align="flex-end">
      <Textarea
        ref={textareaRef}
        placeholder="食事内容や体重を入力（例: 昼 ラーメン　/　体重 87.4kg）"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        autosize
        minRows={1}
        maxRows={4}
        disabled={disabled}
        style={{ flex: 1 }}
      />
      <ActionIcon
        size="lg"
        variant="filled"
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        aria-label="送信"
      >
        <IconSend size={18} />
      </ActionIcon>
    </Group>
  );
}
