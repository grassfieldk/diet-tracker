import { Center, Text, Title } from "@mantine/core";

export default function Home() {
  return (
    <Center h="100dvh">
      <Title order={2}>
        <Text component="span" c="blue" inherit>
          Diet Tracker
        </Text>{" "}
        へようこそ
      </Title>
    </Center>
  );
}
