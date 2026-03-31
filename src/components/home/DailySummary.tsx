"use client";

import { Anchor, Box, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { PfcBar } from "@/components/common/PfcBar";
import type { BotChatItem, ChatItem, UserProfile } from "@/types";

interface BmrBarProps {
  consumed: number;
  target: number;
  targetLabel: string;
}

function BmrBar({ consumed, target, targetLabel }: BmrBarProps) {
  // バー全体を target*1.5 の範囲とし、target位置にマーカーを置く
  const MAX = target * 1.5;
  const normalPct = Math.min((consumed / MAX) * 100, (target / MAX) * 100);
  const overPct =
    consumed > target
      ? Math.min(((consumed - target) / MAX) * 100, 100 - (target / MAX) * 100)
      : 0;
  const markerPct = (target / MAX) * 100;
  const diff = Math.round(consumed - target);
  const over = diff > 0;

  return (
    <Box style={{ width: "100%" }}>
      <Group justify="space-between" mb={2}>
        <Text size="xs" c="dimmed">
          {targetLabel} {target.toLocaleString()} kcal
        </Text>
        <Text size="xs" fw={600} c={over ? "orange.7" : "blue.6"}>
          {over ? "+" : ""}
          {diff.toLocaleString()} kcal
        </Text>
      </Group>
      <Tooltip
        label={`${consumed.toLocaleString()} / ${target.toLocaleString()} kcal`}
        position="bottom"
      >
        <Box
          style={{
            position: "relative",
            height: 16,
            borderRadius: 8,
            background: "var(--mantine-color-default-border)",
            overflow: "visible",
          }}
        >
          {/* 通常摂取バー */}
          <Box
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${normalPct}%`,
              borderRadius: 8,
              background: over
                ? "var(--mantine-color-orange-5)"
                : "var(--mantine-color-blue-5)",
              transition: "width 0.3s ease",
            }}
          />
          {/* 超過バー */}
          {overPct > 0 && (
            <Box
              style={{
                position: "absolute",
                left: `${markerPct}%`,
                top: 0,
                height: "100%",
                width: `${overPct}%`,
                borderTopRightRadius: 7,
                borderBottomRightRadius: 7,
                background: "var(--mantine-color-red-6)",
                transition: "width 0.3s ease",
              }}
            />
          )}
          {/* BMR マーカー */}
          <Box
            style={{
              position: "absolute",
              left: `${markerPct}%`,
              top: 0,
              transform: "translateX(-50%)",
              width: 2,
              height: 16,
              borderRadius: 1,
              background: "var(--mantine-color-default-color)",
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

interface DailySummaryProps {
  items: ChatItem[];
  profile: UserProfile | null;
  onSetupClick: () => void;
}

export function DailySummary({
  items,
  profile,
  onSetupClick,
}: DailySummaryProps) {
  const todayStr = new Date().toDateString();
  const todayBotMeals = items.filter(
    (item): item is BotChatItem =>
      item.kind === "bot" &&
      item.type === "meal" &&
      item.analysis != null &&
      item.createdAt.toDateString() === todayStr,
  );

  const todayBotExercises = items.filter(
    (item): item is BotChatItem =>
      item.kind === "bot" &&
      item.type === "exercise" &&
      item.exerciseAnalysis != null &&
      item.createdAt.toDateString() === todayStr,
  );

  const totalCalories = todayBotMeals.reduce(
    (sum, m) => sum + (m.analysis?.totalCalories ?? 0),
    0,
  );
  const totalProtein = todayBotMeals.reduce(
    (sum, m) => sum + (m.analysis?.totalProtein ?? 0),
    0,
  );
  const totalFat = todayBotMeals.reduce(
    (sum, m) => sum + (m.analysis?.totalFat ?? 0),
    0,
  );
  const totalCarbs = todayBotMeals.reduce(
    (sum, m) => sum + (m.analysis?.totalCarbs ?? 0),
    0,
  );
  const totalBurned = todayBotExercises.reduce(
    (sum, e) => sum + (e.exerciseAnalysis?.totalCaloriesBurned ?? 0),
    0,
  );

  const calTarget = profile?.calTarget ?? "bmr";
  const targetValue =
    calTarget === "tdee" && profile?.tdee != null ? profile.tdee : profile?.bmr;
  const targetLabel = calTarget === "tdee" ? "TDEE" : "BMR";

  const bmrDiff =
    targetValue != null
      ? Math.round(totalCalories - totalBurned - targetValue)
      : null;

  return (
    <Paper p="md" withBorder radius="md">
      <Group align="flex-start" justify="space-between" wrap="nowrap" gap="md">
        <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
          <Group align="baseline" justify="space-between" gap={4}>
            <Text size="xs">今日の摂取カロリー</Text>
            <Group align="baseline" gap={4}>
              <Text size="xl" fw={600}>
                {totalCalories.toLocaleString()}
              </Text>
              <Text size="sm">kcal</Text>
            </Group>
          </Group>

          {totalBurned > 0 && (
            <Group align="baseline" justify="space-between" gap={4}>
              <Text size="xs" c="teal">
                運動消費
              </Text>
              <Group align="baseline" gap={4}>
                <Text size="sm" fw={600} c="teal">
                  -{totalBurned.toLocaleString()}
                </Text>
                <Text size="xs" c="teal">
                  kcal
                </Text>
              </Group>
            </Group>
          )}

          {profile !== null && targetValue != null && bmrDiff !== null && (
            <BmrBar
              consumed={totalCalories - totalBurned}
              target={targetValue}
              targetLabel={targetLabel}
            />
          )}

          {profile === null && (
            <Anchor
              size="xs"
              onClick={onSetupClick}
              style={{ cursor: "pointer" }}
            >
              BMR を設定する
            </Anchor>
          )}
        </Stack>
      </Group>

      <Box mt={8}>
        <PfcBar protein={totalProtein} fat={totalFat} carbs={totalCarbs} />
      </Box>
    </Paper>
  );
}
