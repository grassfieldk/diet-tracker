import { Center, Text, Title } from "@mantine/core";

export default function LoginPage() {
  return (
    <Center h="100dvh">
      <div>
        <Title order={2} mb="md" ta="center">
          ログイン
        </Title>
        <Text c="dimmed">準備中</Text>
      </div>
    </Center>
  );
}
