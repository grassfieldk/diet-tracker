import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { IconScale } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";

export default async function LoginPage() {
  const session = await auth0.getSession();
  if (session) {
    redirect("/");
  }

  return (
    <Center h="100dvh">
      <Stack align="center" gap="xl">
        <Stack align="center" gap="xs">
          <IconScale size={48} />
          <Title order={2}>Diet Tracker</Title>
          <Text c="dimmed" size="sm">
            食事・体重を記録して健康管理
          </Text>
        </Stack>
        <Button component="a" href="/auth/login" size="md" w={240}>
          ログイン / サインアップ
        </Button>
      </Stack>
    </Center>
  );
}
