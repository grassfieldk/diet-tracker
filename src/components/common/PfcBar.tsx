"use client";

import { Box, Tooltip } from "@mantine/core";

interface PfcBarProps {
  protein: number;
  fat: number;
  carbs: number;
}

export function PfcBar({ protein, fat, carbs }: PfcBarProps) {
  const total = protein + fat + carbs;
  if (total === 0) return null;
  const pPct = Math.round((protein / total) * 100);
  const fPct = Math.round((fat / total) * 100);
  const cPct = 100 - pPct - fPct;

  const segments = [
    {
      label: "P",
      pct: pPct,
      color: "var(--mantine-color-blue-6)",
      value: protein,
    },
    {
      label: "F",
      pct: fPct,
      color: "var(--mantine-color-orange-5)",
      value: fat,
    },
    {
      label: "C",
      pct: cPct,
      color: "var(--mantine-color-green-6)",
      value: carbs,
    },
  ];

  return (
    <Box
      style={{
        display: "flex",
        width: "100%",
        height: 16,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {segments.map(({ label, pct, color, value }) =>
        pct > 0 ? (
          <Tooltip
            key={label}
            label={`${label}: ${value}g (${pct}%)`}
            position="bottom"
          >
            <Box
              style={{
                width: `${pct}%`,
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#fff",
                fontWeight: 600,
                overflow: "hidden",
                whiteSpace: "nowrap",
                cursor: "default",
              }}
            >
              {pct >= 12 ? `${label} ${pct}%` : pct >= 6 ? `${pct}%` : ""}
            </Box>
          </Tooltip>
        ) : null,
      )}
    </Box>
  );
}
