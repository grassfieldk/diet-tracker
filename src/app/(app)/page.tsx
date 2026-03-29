"use client";

import { ScrollArea, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { ChatInput } from "@/components/chat/ChatInput";
import { BmrSetupModal } from "@/components/home/BmrSetupModal";
import { DailySummary } from "@/components/home/DailySummary";
import type {
  BotChatItem,
  ChatItem,
  MealCategory,
  NutritionAnalysis,
  UserChatItem,
  UserProfile,
} from "@/types";

const INITIAL_LOAD_LIMIT = 20;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomePage() {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sending, setSending] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data: UserProfile | null) => {
        if (data) setProfile(data);
      })
      .catch(() => {});

    fetch(`/api/meals?limit=${INITIAL_LOAD_LIMIT}`)
      .then((r) => r.json())
      .then(
        (
          data: Array<{
            id: string;
            mealCategory: MealCategory;
            rawText: string;
            analysis: NutritionAnalysis;
            recordedAt: string;
          }>,
        ) => {
          const loaded: ChatItem[] = [];
          for (const record of data) {
            loaded.push({
              kind: "user",
              id: `user-${record.id}`,
              text: record.rawText,
              createdAt: new Date(record.recordedAt),
            });
            loaded.push({
              kind: "bot",
              id: record.id,
              type: "meal",
              mealCategory: record.mealCategory,
              analysis: record.analysis,
              createdAt: new Date(record.recordedAt),
            });
          }
          setItems(loaded);
        },
      )
      .catch(() => {});
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: items 追加時に最下部へスクロールするため意図的な依存
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  const handleSend = async (text: string) => {
    const uid = `user-${Date.now()}`;
    const bid = `bot-${Date.now()}`;
    const createdAt = new Date();

    const userItem: UserChatItem = { kind: "user", id: uid, text, createdAt };
    const pendingItem: BotChatItem = {
      kind: "bot",
      id: bid,
      type: "pending",
      createdAt,
    };

    setItems((prev) => [...prev, userItem, pendingItem]);
    setSending(true);

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const analyzed: {
        type: "meal" | "weight" | "off-topic";
        mealCategory?: MealCategory;
        analysis?: NutritionAnalysis;
        weightKg?: number;
      } = await analyzeRes.json();

      if (analyzed.type === "meal" && analyzed.analysis) {
        const saveRes = await fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealCategory: analyzed.mealCategory,
            analysis: analyzed.analysis,
            rawText: text,
            recordedDate: todayString(),
          }),
        });
        const saved: { id: string } = await saveRes.json();

        const botItem: BotChatItem = {
          kind: "bot",
          id: saved.id ?? bid,
          type: "meal",
          mealCategory: analyzed.mealCategory,
          analysis: analyzed.analysis,
          createdAt,
        };
        setItems((prev) =>
          prev.map((item) => (item.id === bid ? botItem : item)),
        );
      } else if (analyzed.type === "weight" && analyzed.weightKg != null) {
        await fetch("/api/weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weight: analyzed.weightKg }),
        });

        const botItem: BotChatItem = {
          kind: "bot",
          id: bid,
          type: "weight",
          weightKg: analyzed.weightKg,
          createdAt,
        };
        setItems((prev) =>
          prev.map((item) => (item.id === bid ? botItem : item)),
        );
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === bid
              ? ({ ...item, type: "off-topic" } as BotChatItem)
              : item,
          ),
        );
      }
    } catch {
      // エラー時は pending bot アイテムを除去
      setItems((prev) => prev.filter((item) => item.id !== bid));
    } finally {
      setSending(false);
    }
  };

  const handleProfileSave = async (p: UserProfile) => {
    setProfile(p);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
    } catch {
      // ローカルは更新済みのためエラーは無視
    }
  };

  return (
    <>
      <Stack gap="md" style={{ height: "100%" }}>
        <DailySummary items={items} profile={profile} onSetupClick={open} />
        <ScrollArea style={{ flex: 1, minHeight: 0 }} scrollbars="y">
          <ChatHistory items={items} />
          <div ref={bottomRef} />
        </ScrollArea>
        <ChatInput onSend={handleSend} disabled={sending} />
      </Stack>

      <BmrSetupModal
        opened={opened}
        onClose={close}
        onSave={handleProfileSave}
      />
    </>
  );
}
