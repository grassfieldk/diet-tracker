"use client";

import {
  Button,
  Modal,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { calculateBmr } from "@/lib/bmr";
import type { Sex, UserProfile } from "@/types";

interface BmrSetupModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

interface BmrFormValues {
  heightCm: number | string;
  weightKg: number | string;
  age: number | string;
  sex: Sex;
}

export function BmrSetupModal({ opened, onClose, onSave }: BmrSetupModalProps) {
  const form = useForm<BmrFormValues>({
    initialValues: {
      heightCm: 170,
      weightKg: 65,
      age: 30,
      sex: "male",
    },
    validate: {
      heightCm: (v) =>
        Number(v) < 100 || Number(v) > 250
          ? "100〜250 cm で入力してください"
          : null,
      weightKg: (v) =>
        Number(v) < 30 || Number(v) > 300
          ? "30〜300 kg で入力してください"
          : null,
      age: (v) =>
        Number(v) < 10 || Number(v) > 120
          ? "10〜120 歳で入力してください"
          : null,
    },
  });

  const handleSubmit = (values: BmrFormValues) => {
    const h = Number(values.heightCm);
    const w = Number(values.weightKg);
    const a = Number(values.age);
    const bmr = calculateBmr(h, w, a, values.sex);
    onSave({ heightCm: h, weightKg: w, age: a, sex: values.sex, bmr });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="基礎代謝（BMR）の設定"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <SegmentedControl
            data={[
              { label: "男性", value: "male" },
              { label: "女性", value: "female" },
            ]}
            value={form.values.sex}
            onChange={(value) => form.setFieldValue("sex", value as Sex)}
          />
          <NumberInput
            label="身長"
            suffix=" cm"
            min={100}
            max={250}
            {...form.getInputProps("heightCm")}
          />
          <NumberInput
            label="体重"
            suffix=" kg"
            min={30}
            max={300}
            decimalScale={1}
            step={0.1}
            {...form.getInputProps("weightKg")}
          />
          <NumberInput
            label="年齢"
            suffix=" 歳"
            min={10}
            max={120}
            {...form.getInputProps("age")}
          />
          <Text size="xs" c="dimmed">
            ハリス-ベネディクト式で計算します
          </Text>
          <Button type="submit">保存</Button>
        </Stack>
      </form>
    </Modal>
  );
}
