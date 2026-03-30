"use client";

import {
  ActionIcon,
  Group,
  NumberInput,
  Select,
  Stack,
  Textarea,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useRef, useState } from "react";
import type { InputMode } from "@/types";

interface ChatInputProps {
  onSend: (text: string, mode: InputMode) => void;
  disabled?: boolean;
}

const MODE_OPTIONS: { value: InputMode; label: string }[] = [
  { value: "meal", label: "食事" },
  { value: "weight", label: "体重" },
  { value: "exercise", label: "運動" },
];

const PLACEHOLDERS: Record<InputMode, string> = {
  meal: "例: 朝 ご飯 納豆",
  weight: "例: 67.5",
  exercise: "例: ランニング 30分",
};

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<InputMode>("meal");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (disabled) return;
    // weight モードは NumberInput を使うが、API には文字列で送る
    const payload = mode === "weight" ? String(value).trim() : value.trim();
    if (!payload) return;
    onSend(payload, mode);
    setValue("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <Stack gap="xs">
      <Select
        size="xs"
        data={MODE_OPTIONS}
        value={mode}
        onChange={(v) => v && setMode(v as InputMode)}
        allowDeselect={false}
        w={90}
      />
      <Group gap="xs" align="flex-end">
        {mode === "weight" ? (
          <NumberInput
            aria-label="体重"
            placeholder={PLACEHOLDERS[mode]}
            value={value ? Number(value) : undefined}
            onChange={(v) => setValue(v == null ? "" : String(v))}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            step={0.1}
            min={20}
            max={300}
            disabled={disabled}
            style={{ flex: 1 }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            placeholder={PLACEHOLDERS[mode]}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            autosize
            minRows={1}
            maxRows={4}
            disabled={disabled}
            style={{ flex: 1 }}
          />
        )}
        <ActionIcon
          size={38}
          variant="filled"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="送信"
        >
          <IconSend size={18} />
        </ActionIcon>
      </Group>
    </Stack>
  );
}
