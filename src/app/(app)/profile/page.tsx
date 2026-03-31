"use client";

import {
  Box,
  Button,
  Divider,
  Group,
  Input,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCalculator,
  IconLogout,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import {
  ACTIVITY_LEVELS,
  ageFromBirthDate,
  calculateBmr,
  calculateTdee,
} from "@/lib/bmr";
import type { ActivityLevel, CalTarget, Sex, UserProfile } from "@/types";

interface FormValues {
  heightCm: number | string;
  birthYear: number | string;
  birthMonth: number | string;
  birthDay: number | string;
  sex: Sex;
  activityLevel: ActivityLevel;
  bmr: number | string;
  tdee: number | string;
  calTarget: CalTarget;
}

function toBirthDate(
  year: number | string,
  month: number | string,
  day: number | string,
): Date | null {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  )
    return null;
  return date;
}

// タブ切り替え時の再フェッチを防ぐモジュールレベルキャッシュ
let cachedLatestWeight: number | null | undefined;

export default function ProfilePage() {
  const { profile: contextProfile, profileFetched, setProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [latestWeight, setLatestWeight] = useState<number | null>(
    cachedLatestWeight ?? null,
  );
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");

  const form = useForm<FormValues>({
    initialValues: {
      heightCm: "",
      birthYear: "",
      birthMonth: "",
      birthDay: "",
      sex: "male",
      activityLevel: "sedentary",
      bmr: "",
      tdee: "",
      calTarget: "bmr",
    },
    validate: {
      heightCm: (v) =>
        v === "" || Number(v) < 100 || Number(v) > 250
          ? "100〜250 cm で入力してください"
          : null,
      birthYear: (v) =>
        v !== "" && (Number(v) < 1900 || Number(v) > new Date().getFullYear())
          ? "有効な年を入力してください"
          : null,
      birthMonth: (v) =>
        v !== "" && (Number(v) < 1 || Number(v) > 12)
          ? "1〜12 で入力してください"
          : null,
      birthDay: (v, values) => {
        if (v === "") return null;
        if (Number(v) < 1 || Number(v) > 31) return "1〜31 で入力してください";
        const date = toBirthDate(values.birthYear, values.birthMonth, v);
        if (!date) return "有効な日付ではありません";
        return null;
      },
      bmr: (v) =>
        v !== "" && (Number(v) < 500 || Number(v) > 5000)
          ? "500〜5000 の範囲で入力してください"
          : null,
      tdee: (v) =>
        v !== "" && (Number(v) < 500 || Number(v) > 10000)
          ? "500〜10000 の範囲で入力してください"
          : null,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 初回のみ取得
  useEffect(() => {
    if (profileFetched) {
      const data = contextProfile;
      if (data) {
        const bd = data.birthDate ? new Date(data.birthDate) : null;
        form.setValues({
          heightCm: data.heightCm ?? "",
          birthYear: bd ? bd.getFullYear() : "",
          birthMonth: bd ? bd.getMonth() + 1 : "",
          birthDay: bd ? bd.getDate() : "",
          sex: data.sex ?? "male",
          activityLevel: (data.activityLevel as ActivityLevel) ?? "sedentary",
          bmr: data.bmr ?? "",
          tdee: data.tdee ?? "",
          calTarget: (data.calTarget as CalTarget) ?? "bmr",
        });
      }
    } else {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data: UserProfile | null) => {
          setProfile(data);
          if (!data) return;
          const bd = data.birthDate ? new Date(data.birthDate) : null;
          form.setValues({
            heightCm: data.heightCm ?? "",
            birthYear: bd ? bd.getFullYear() : "",
            birthMonth: bd ? bd.getMonth() + 1 : "",
            birthDay: bd ? bd.getDate() : "",
            sex: data.sex ?? "male",
            activityLevel: (data.activityLevel as ActivityLevel) ?? "sedentary",
            bmr: data.bmr ?? "",
            tdee: data.tdee ?? "",
            calTarget: (data.calTarget as CalTarget) ?? "bmr",
          });
        })
        .catch(() => {});
    }

    if (cachedLatestWeight === undefined) {
      fetch("/api/weights?days=3650")
        .then((r) => r.json())
        .then((data: { weight: number; recordedAt: string }[]) => {
          const w = data.length > 0 ? data[data.length - 1].weight : null;
          cachedLatestWeight = w;
          setLatestWeight(w);
        })
        .catch(() => {});
    }
  }, []);

  const birthDate = toBirthDate(
    form.values.birthYear,
    form.values.birthMonth,
    form.values.birthDay,
  );

  const handleCalculate = () => {
    const h = Number(form.values.heightCm);
    if (!h || !birthDate || !latestWeight) return;
    const age = ageFromBirthDate(birthDate);
    const computedBmr = calculateBmr(h, latestWeight, age, form.values.sex);
    const computedTdee = calculateTdee(computedBmr, form.values.activityLevel);
    form.setValues({ ...form.values, bmr: computedBmr, tdee: computedTdee });
  };

  const handleSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const bd = toBirthDate(
        values.birthYear,
        values.birthMonth,
        values.birthDay,
      );
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: values.heightCm !== "" ? Number(values.heightCm) : null,
          birthDate: bd ? bd.toISOString() : null,
          sex: values.sex,
          activityLevel: values.activityLevel,
          bmr: values.bmr !== "" ? Number(values.bmr) : null,
          tdee: values.tdee !== "" ? Number(values.tdee) : null,
          calTarget: values.calTarget,
        }),
      });
      // Contextを更新（ホーム画面に即時反映）
      setProfile({
        heightCm: values.heightCm !== "" ? Number(values.heightCm) : 0,
        weightKg: latestWeight ?? 0,
        age: 0,
        birthDate: bd ? bd.toISOString() : undefined,
        sex: values.sex,
        activityLevel: values.activityLevel,
        bmr: values.bmr !== "" ? Number(values.bmr) : 0,
        tdee: values.tdee !== "" ? Number(values.tdee) : undefined,
        calTarget: values.calTarget,
      });
      notifications.show({
        message: "プロフィールを保存しました",
        color: "green",
      });
    } catch {
      notifications.show({ message: "保存に失敗しました", color: "red" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md">
      <Box hiddenFrom="sm">
        <Group justify="flex-end" align="center">
          {mounted && (
            <Switch
              checked={colorScheme === "dark"}
              onChange={() =>
                setColorScheme(colorScheme === "light" ? "dark" : "light")
              }
              size="md"
              color={colorScheme === "dark" ? "gray.6" : "yellow"}
              onLabel={<IconSun size={14} />}
              offLabel={<IconMoon size={14} />}
              aria-label="カラースキーム切替"
            />
          )}
        </Group>
      </Box>

      <Paper withBorder p="md" radius="md">
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <Stack gap="md">
            <Text fw={600} size="sm">
              基本情報
            </Text>

            {/* 性別・誕生日 横並び（1:2） */}
            <Group gap="md" align="flex-start" wrap="nowrap">
              <Stack gap={6} style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  性別
                </Text>
                <SegmentedControl
                  data={[
                    { label: "男", value: "male" },
                    { label: "女", value: "female" },
                  ]}
                  value={form.values.sex}
                  onChange={(v) => form.setFieldValue("sex", v as Sex)}
                  fullWidth
                />
              </Stack>
              <Input.Wrapper
                label="誕生日"
                style={{ flex: 2 }}
                error={
                  form.errors.birthYear ??
                  form.errors.birthMonth ??
                  form.errors.birthDay
                }
              >
                <Group gap={4} mt={4} align="center" wrap="nowrap">
                  <NumberInput
                    placeholder="YYYY"
                    hideControls
                    min={1900}
                    max={new Date().getFullYear()}
                    style={{ width: 76 }}
                    styles={{ input: { textAlign: "center" } }}
                    aria-label="年"
                    {...form.getInputProps("birthYear")}
                    error={!!form.errors.birthYear}
                  />
                  <Text c="dimmed" size="sm">
                    /
                  </Text>
                  <NumberInput
                    placeholder="MM"
                    hideControls
                    min={1}
                    max={12}
                    style={{ width: 54 }}
                    styles={{ input: { textAlign: "center" } }}
                    aria-label="月"
                    {...form.getInputProps("birthMonth")}
                    error={!!form.errors.birthMonth}
                  />
                  <Text c="dimmed" size="sm">
                    /
                  </Text>
                  <NumberInput
                    placeholder="DD"
                    hideControls
                    min={1}
                    max={31}
                    style={{ width: 54 }}
                    styles={{ input: { textAlign: "center" } }}
                    aria-label="日"
                    {...form.getInputProps("birthDay")}
                    error={!!form.errors.birthDay}
                  />
                </Group>
              </Input.Wrapper>
            </Group>

            {/* 身長・体重 横並び（体重は最新値・変更不可） */}
            <SimpleGrid cols={2} spacing="md">
              <NumberInput
                label="身長"
                suffix=" cm"
                min={100}
                max={250}
                decimalScale={1}
                step={0.1}
                styles={{ input: { textAlign: "center" } }}
                {...form.getInputProps("heightCm")}
              />
              <NumberInput
                label="体重（最新）"
                suffix=" kg"
                decimalScale={1}
                value={latestWeight ?? ""}
                styles={{ input: { textAlign: "center" } }}
                disabled
              />
            </SimpleGrid>

            <Select
              label="活動レベル"
              data={ACTIVITY_LEVELS.map((l) => ({
                value: l.value,
                label: l.label,
              }))}
              {...form.getInputProps("activityLevel")}
            />

            <Divider />

            {/* 代謝量 */}
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={500}>
                  代謝量
                </Text>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconCalculator size={14} />}
                  onClick={handleCalculate}
                  disabled={
                    !latestWeight || form.values.heightCm === "" || !birthDate
                  }
                >
                  代謝量計算
                </Button>
              </Group>

              <SimpleGrid cols={2} spacing="md">
                <NumberInput
                  label="基礎代謝量（BMR）"
                  suffix=" kcal/日"
                  min={500}
                  max={5000}
                  styles={{ input: { textAlign: "center" } }}
                  {...form.getInputProps("bmr")}
                />
                <NumberInput
                  label="活動代謝量（TDEE）"
                  suffix=" kcal/日"
                  min={500}
                  max={10000}
                  styles={{ input: { textAlign: "center" } }}
                  {...form.getInputProps("tdee")}
                />
              </SimpleGrid>

              <Input.Wrapper label="カロリー目標の基準">
                <SegmentedControl
                  mt={4}
                  fullWidth
                  data={[
                    { label: "基礎代謝（BMR）", value: "bmr" },
                    { label: "活動代謝（TDEE）", value: "tdee" },
                  ]}
                  value={form.values.calTarget}
                  onChange={(v) =>
                    form.setFieldValue("calTarget", v as CalTarget)
                  }
                />
              </Input.Wrapper>
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
