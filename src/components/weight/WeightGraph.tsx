"use client";

import { LineChart } from "@mantine/charts";
import {
  Box,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Text,
} from "@mantine/core";
import { useState } from "react";
import type { WeightRecord } from "@/types";

interface WeightGraphProps {
  records: WeightRecord[];
  onRangeChange: (days: number) => void;
  loading?: boolean;
}

const RANGES = [
  { label: "7日", value: "7" },
  { label: "30日", value: "30" },
  { label: "90日", value: "90" },
];

export function WeightGraph({
  records,
  onRangeChange,
  loading = false,
}: WeightGraphProps) {
  const [range, setRange] = useState("30");

  const handleChange = (val: string) => {
    setRange(val);
    onRangeChange(Number(val));
  };

  const data = records.map((r) => ({
    date: (() => {
      const d = r.recordedAt;
      return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    })(),
    weight: r.weight,
  }));

  const weights = records.map((r) => r.weight);
  const minW = weights.length ? Math.floor(Math.min(...weights) - 1) : 0;
  const maxW = weights.length ? Math.ceil(Math.max(...weights) + 1) : 100;

  return (
    <Paper p="md" withBorder radius="md">
      <Group justify="space-between" mb="sm">
        <Text fw={600} size="sm">
          体重推移
        </Text>
        <SegmentedControl
          data={RANGES}
          value={range}
          onChange={handleChange}
          size="xs"
        />
      </Group>

      {loading ? (
        <Box py="xl">
          <Loader size="sm" display="block" mx="auto" />
        </Box>
      ) : data.length === 0 ? (
        <Box py="xl">
          <Text ta="center" c="dimmed" size="sm">
            記録がありません
          </Text>
        </Box>
      ) : (
        <LineChart
          h={220}
          data={data}
          dataKey="date"
          series={[{ name: "weight", color: "blue.6", label: "体重" }]}
          unit=" kg"
          yAxisProps={{ domain: [minW, maxW] }}
          curveType="monotone"
          withDots={data.length <= 31}
          tickLine="none"
        />
      )}
    </Paper>
  );
}
