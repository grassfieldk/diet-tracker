"use client";

import { ScrollArea, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { ChatInput } from "@/components/chat/ChatInput";
import { BmrSetupModal } from "@/components/home/BmrSetupModal";
import { DailySummary } from "@/components/home/DailySummary";
import { analyzeMock } from "@/lib/mock-ai";
import { MOCK_CHAT_MESSAGES, MOCK_USER_PROFILE } from "@/lib/mock-data";
import type { ChatMessage, UserProfile } from "@/types";

const MAX_MESSAGES = 20;

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [profile, setProfile] = useState<UserProfile | null>(MOCK_USER_PROFILE);
  const [opened, { open, close }] = useDisclosure(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages 追加時に最下部へスクロールするため意図的な依存
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const result = analyzeMock(text);
    const newMsg: ChatMessage = {
      ...result,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMsg].slice(-MAX_MESSAGES));
  };

  return (
    <>
      <Stack gap="md" style={{ height: "100%" }}>
        <DailySummary
          messages={messages}
          profile={profile}
          onSetupClick={open}
        />
        <ScrollArea style={{ flex: 1, minHeight: 0 }}>
          <ChatHistory messages={messages} />
          <div ref={bottomRef} />
        </ScrollArea>
        <ChatInput onSend={handleSend} />
      </Stack>

      <BmrSetupModal opened={opened} onClose={close} onSave={setProfile} />
    </>
  );
}
