"use client";

import { Anchor, Box, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { PfcBar } from "@/components/common/PfcBar";
import type { ChatMessage, UserProfile } from "@/types";

interface BmrBarProps {
  consumed: number;
  bmr: number;
}

function BmrBar({ consumed, bmr }: BmrBarProps) {
  // バー全体を bmr*1.5 の範囲とし、bmr位置にマーカーを置く
  const MAX = bmr * 1.5;
  const normalPct = Math.min((consumed / MAX) * 100, (bmr / MAX) * 100);
  const overPct =
    consumed > bmr
      ? Math.min(((consumed - bmr) / MAX) * 100, 100 - (bmr / MAX) * 100)
      : 0;
  const markerPct = (bmr / MAX) * 100;
  const diff = Math.round(consumed - bmr);
  const over = diff > 0;

  return (
    <Box style={{ width: "100%" }}>
      <Group justify="space-between" mb={2}>
        <Text size="xs" c="dimmed">
          BMR {bmr.toLocaleString()} kcal
        </Text>
        <Text size="xs" fw={600} c={over ? "orange.7" : "blue.6"}>
          {over ? "+" : ""}
          {diff.toLocaleString()} kcal
        </Text>
      </Group>
      <Tooltip
        label={`${consumed.toLocaleString()} / ${bmr.toLocaleString()} kcal`}
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
  messages: ChatMessage[];
  profile: UserProfile | null;
  onSetupClick: () => void;
}

export function DailySummary({
  messages,
  profile,
  onSetupClick,
}: DailySummaryProps) {
  const mealMessages = messages.filter((m) => m.type === "meal" && m.analysis);

  const totalCalories = mealMessages.reduce(
    (sum, m) => sum + (m.analysis?.totalCalories ?? 0),
    0,
  );
  const totalProtein = mealMessages.reduce(
    (sum, m) => sum + (m.analysis?.totalProtein ?? 0),
    0,
  );
  const totalFat = mealMessages.reduce(
    (sum, m) => sum + (m.analysis?.totalFat ?? 0),
    0,
  );
  const totalCarbs = mealMessages.reduce(
    (sum, m) => sum + (m.analysis?.totalCarbs ?? 0),
    0,
  );

  const bmrDiff = profile ? Math.round(totalCalories - profile.bmr) : null;

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

          {profile !== null && bmrDiff !== null && (
            <BmrBar consumed={totalCalories} bmr={profile.bmr} />
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
