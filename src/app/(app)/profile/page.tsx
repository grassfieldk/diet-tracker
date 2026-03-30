"use client";

import {
  Box,
  Button,
  Divider,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { calculateBmr } from "@/lib/bmr";
import type { Sex, UserProfile } from "@/types";

interface FormValues {
  heightCm: number | string;
  weightKg: number | string;
  age: number | string;
  sex: Sex;
}

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [bmr, setBmr] = useState<number | null>(null);
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");

  const form = useForm<FormValues>({
    initialValues: {
      heightCm: "",
      weightKg: "",
      age: "",
      sex: "male",
    },
    validate: {
      heightCm: (v) =>
        v === "" || Number(v) < 100 || Number(v) > 250
          ? "100〜250 cm で入力してください"
          : null,
      weightKg: (v) =>
        v === "" || Number(v) < 30 || Number(v) > 300
          ? "30〜300 kg で入力してください"
          : null,
      age: (v) =>
        v === "" || Number(v) < 10 || Number(v) > 120
          ? "10〜120 歳で入力してください"
          : null,
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: 初回のみ取得
  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data: UserProfile | null) => {
        if (!data) return;
        form.setValues({
          heightCm: data.heightCm ?? "",
          weightKg: data.weightKg ?? "",
          age: data.age ?? "",
          sex: data.sex ?? "male",
        });
        if (data.bmr) setBmr(data.bmr);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (values: FormValues) => {
    const h = Number(values.heightCm);
    const w = Number(values.weightKg);
    const a = Number(values.age);
    const computed = calculateBmr(h, w, a, values.sex);
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: h,
          weightKg: w,
          age: a,
          sex: values.sex,
          bmr: computed,
        }),
      });
      setBmr(computed);
      notifications.show({
        message: "プロフィールを保存しました",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "保存に失敗しました",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const previewBmr =
    form.values.heightCm !== "" &&
    form.values.weightKg !== "" &&
    form.values.age !== ""
      ? calculateBmr(
          Number(form.values.heightCm),
          Number(form.values.weightKg),
          Number(form.values.age),
          form.values.sex,
        )
      : null;

  return (
    <Stack gap="md">
      <Box hiddenFrom="sm">
        <Group justify="flex-end" align="center">
          <Switch
            checked={colorScheme === "dark"}
            onChange={() =>
              setColorScheme(colorScheme === "light" ? "dark" : "light")
            }
            size="md"
            color={colorScheme === "dark" ? "gray.8" : "yellow"}
            onLabel={<IconSun size={14} />}
            offLabel={<IconMoon size={14} />}
            aria-label="カラースキーム切替"
          />
        </Group>
      </Box>
      <Paper withBorder p="md" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Text fw={600} size="sm">
              基本情報
            </Text>

            <SegmentedControl
              data={[
                { label: "男性", value: "male" },
                { label: "女性", value: "female" },
              ]}
              value={form.values.sex}
              onChange={(v) => form.setFieldValue("sex", v as Sex)}
              fullWidth
            />

            <NumberInput
              label="年齢"
              suffix=" 歳"
              min={10}
              max={120}
              {...form.getInputProps("age")}
            />

            <NumberInput
              label="身長"
              suffix=" cm"
              min={100}
              max={250}
              decimalScale={1}
              step={0.1}
              {...form.getInputProps("heightCm")}
            />

            <NumberInput
              label="体重（基準値）"
              suffix=" kg"
              min={30}
              max={300}
              decimalScale={1}
              step={0.1}
              {...form.getInputProps("weightKg")}
            />

            <Divider />

            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                基礎代謝（ハリス-ベネディクト式）
              </Text>
              {previewBmr !== null ? (
                <Text fw={700} size="xl">
                  {previewBmr.toLocaleString()} kcal/日
                </Text>
              ) : bmr !== null ? (
                <Text fw={700} size="xl">
                  {bmr.toLocaleString()} kcal/日
                </Text>
              ) : (
                <Text c="dimmed" size="sm">
                  上記を入力すると自動計算されます
                </Text>
              )}
            </Stack>

            <Group justify="flex-end">
              <Button type="submit" loading={saving}>
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      <Button
        component="a"
        href="/auth/logout"
        variant="subtle"
        color="red"
        leftSection={<IconLogout size={16} />}
        fullWidth
      >
        ログアウト
      </Button>
    </Stack>
  );
}
