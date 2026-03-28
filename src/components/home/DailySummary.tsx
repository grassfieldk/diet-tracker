"use client";

import { DonutChart } from "@mantine/charts";
import { Anchor, Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import type { ChatMessage, UserProfile } from "@/types";

interface DailySummaryProps {
  messages: ChatMessage[];
  profile: UserProfile | null;
  onSetupClick: () => void;
}

const PFC_COLORS = {
  protein: "blue.6",
  fat: "orange.5",
  carbs: "green.6",
} as const;

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

  const pfcData = [
    {
      name: "タンパク質",
      value: Math.round(totalProtein * 10) / 10,
      color: PFC_COLORS.protein,
    },
    {
      name: "脂質",
      value: Math.round(totalFat * 10) / 10,
      color: PFC_COLORS.fat,
    },
    {
      name: "炭水化物",
      value: Math.round(totalCarbs * 10) / 10,
      color: PFC_COLORS.carbs,
    },
  ];

  const bmrDiff = profile ? Math.round(totalCalories - profile.bmr) : null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Paper p="md" withBorder radius="md">
      <Group align="flex-start" justify="space-between" wrap="nowrap" gap="md">
        <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
          <Text size="xs" c="dimmed">
            本日の摂取カロリー
          </Text>
          <Group align="baseline" gap={4}>
            <Title order={2}>{totalCalories.toLocaleString()}</Title>
            <Text size="sm" c="dimmed">
              kcal
            </Text>
          </Group>

          {profile !== null && bmrDiff !== null && (
            <Text size="xs" c={bmrDiff > 0 ? "orange.7" : "blue.6"}>
              基礎代謝 {profile.bmr.toLocaleString()} kcal との差:{" "}
              {bmrDiff > 0 ? "+" : ""}
              {bmrDiff.toLocaleString()} kcal
            </Text>
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

          <Group gap={8} mt={4}>
            {pfcData.map((d) => (
              <Group key={d.name} gap={2}>
                <Badge
                  size="xs"
                  color={d.color}
                  variant="dot"
                  style={{ paddingLeft: 0 }}
                >
                  {d.name}
                </Badge>
                <Text size="xs">{d.value}g</Text>
              </Group>
            ))}
          </Group>
        </Stack>

        {mounted && totalCalories > 0 && (
          <DonutChart
            data={pfcData}
            size={88}
            thickness={16}
            withTooltip
            tooltipDataSource="segment"
            chartLabel={`${totalCalories}`}
            valueFormatter={(v) => `${v}g`}
          />
        )}
      </Group>
    </Paper>
  );
}
