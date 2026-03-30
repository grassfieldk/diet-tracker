"use client";

import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { ChatInput } from "@/components/chat/ChatInput";
import { BmrSetupModal } from "@/components/home/BmrSetupModal";
import { DailySummary } from "@/components/home/DailySummary";
import { PageLayout } from "@/components/layout/PageLayout";
import type {
  BotChatItem,
  ChatItem,
  ExerciseAnalysis,
  InputMode,
  MealCategory,
  NutritionAnalysis,
  UserChatItem,
  UserProfile,
} from "@/types";

const INITIAL_LOAD_LIMIT = 20;

// モジュールレベルキャッシュ（タブ切り替えで破棄されない）
let cachedItems: ChatItem[] | null = null;
let cachedProfile: UserProfile | null = null;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomePage() {
  const [items, setItems] = useState<ChatItem[]>(cachedItems ?? []);
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [loading, setLoading] = useState(cachedItems === null);
  const [sending, setSending] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cachedItems !== null) return;

    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data: UserProfile | null) => {
        if (data) {
          cachedProfile = data;
          setProfile(data);
        }
      })
      .catch(() => {});

    Promise.all([
      fetch(`/api/meals?limit=${INITIAL_LOAD_LIMIT}`).then((r) => r.json()),
      fetch(`/api/exercises?date=${todayString()}`).then((r) => r.json()),
    ])
      .then(
        ([mealData, exerciseData]: [
          Array<{
            id: string;
            mealCategory: MealCategory;
            rawText: string;
            analysis: NutritionAnalysis;
            recordedAt: string;
          }>,
          Array<{
            id: string;
            rawText: string;
            analysis: ExerciseAnalysis;
            recordedAt: string;
          }>,
        ]) => {
          const loaded: ChatItem[] = [];
          for (const record of mealData) {
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
          for (const record of exerciseData) {
            loaded.push({
              kind: "user",
              id: `user-${record.id}`,
              text: record.rawText,
              createdAt: new Date(record.recordedAt),
            });
            loaded.push({
              kind: "bot",
              id: record.id,
              type: "exercise",
              exerciseAnalysis: record.analysis,
              createdAt: new Date(record.recordedAt),
            });
          }
          loaded.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          cachedItems = loaded;
          setItems(loaded);
          setLoading(false);
        },
      )
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: items 追加時に最下部へスクロールするため意図的な依存
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  const handleSend = async (text: string, mode: InputMode) => {
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

    setItems((prev) => {
      const next = [...prev, userItem, pendingItem];
      cachedItems = next;
      return next;
    });
    setSending(true);

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });
      const analyzed: {
        type: "meal" | "weight" | "exercise" | "off-topic";
        mealCategory?: MealCategory;
        analysis?: NutritionAnalysis | ExerciseAnalysis;
        weightKg?: number;
      } = await analyzeRes.json();

      if (analyzed.type === "meal" && analyzed.analysis) {
        const nutritionAnalysis = analyzed.analysis as NutritionAnalysis;
        const saveRes = await fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealCategory: analyzed.mealCategory,
            analysis: nutritionAnalysis,
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
          analysis: nutritionAnalysis,
          createdAt,
        };
        setItems((prev) => {
          const next = prev.map((item) => (item.id === bid ? botItem : item));
          cachedItems = next;
          return next;
        });
      } else if (analyzed.type === "exercise" && analyzed.analysis) {
        const exerciseAnalysis = analyzed.analysis as ExerciseAnalysis;
        const saveRes = await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis: exerciseAnalysis,
            rawText: text,
            recordedDate: todayString(),
          }),
        });
        const saved: { id: string } = await saveRes.json();

        const botItem: BotChatItem = {
          kind: "bot",
          id: saved.id ?? bid,
          type: "exercise",
          exerciseAnalysis,
          createdAt,
        };
        setItems((prev) => {
          const next = prev.map((item) => (item.id === bid ? botItem : item));
          cachedItems = next;
          return next;
        });
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
        setItems((prev) => {
          const next = prev.map((item) => (item.id === bid ? botItem : item));
          cachedItems = next;
          return next;
        });
      } else {
        setItems((prev) => {
          const next = prev.map((item) =>
            item.id === bid
              ? ({ ...item, type: "off-topic" } as BotChatItem)
              : item,
          );
          cachedItems = next;
          return next;
        });
      }
    } catch {
      // エラー時は pending bot アイテムを除去
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== bid);
        cachedItems = next;
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  const handleProfileSave = async (p: UserProfile) => {
    cachedProfile = p;
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
      <PageLayout
        top={
          <DailySummary items={items} profile={profile} onSetupClick={open} />
        }
        bottom={<ChatInput onSend={handleSend} disabled={sending} />}
      >
        <ChatHistory items={items} loading={loading} />
        <div ref={bottomRef} />
      </PageLayout>

      <BmrSetupModal
        opened={opened}
        onClose={close}
        onSave={handleProfileSave}
      />
    </>
  );
}
