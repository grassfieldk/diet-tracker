"use client";

import {
  AppShell,
  AppShellFooter,
  AppShellMain,
  AppShellNavbar,
  AppShellSection,
  Button,
  Group,
  Modal,
  NavLink,
  Stack,
  Text,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconClipboardList,
  IconHome,
  IconLogout,
  IconMoon,
  IconScale,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileProvider } from "@/contexts/ProfileContext";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: IconHome },
  { href: "/history", label: "履歴", icon: IconClipboardList },
  { href: "/weight", label: "体重管理", icon: IconScale },
];

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <UnstyledButton
      onClick={() => setColorScheme(colorScheme === "light" ? "dark" : "light")}
      aria-label="カラースキーム切替"
      style={{ width: 20, height: 20 }}
    >
      {mounted &&
        (colorScheme === "light" ? (
          <IconMoon size={20} />
        ) : (
          <IconSun size={20} />
        ))}
    </UnstyledButton>
  );
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 47.9375em)");
  const [, { close }] = useDisclosure();
  const [logoutOpened, { open: openLogout, close: closeLogout }] =
    useDisclosure(false);

  const LogoutModal = (
    <Modal
      opened={logoutOpened}
      onClose={closeLogout}
      title="ログアウト"
      centered
      size="xs"
    >
      <Text size="sm" mb="lg">
        ログアウトしますか？
      </Text>
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={closeLogout}>
          キャンセル
        </Button>
        <Button color="red" component="a" href="/auth/logout">
          ログアウト
        </Button>
      </Group>
    </Modal>
  );

  if (isMobile) {
    return (
      <>
        <AppShell footer={{ height: 60 }} padding="md">
          <AppShellMain
            style={{
              height: "100dvh",
              minHeight: 0,
              boxSizing: "border-box",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {children}
          </AppShellMain>
          <AppShellFooter>
            <Group h="100%" justify="space-around" px="md">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <UnstyledButton
                  key={href}
                  component={Link}
                  href={href}
                  style={{ flex: 1 }}
                >
                  <Stack gap={2} align="center">
                    <Icon
                      size={22}
                      color={
                        pathname === href
                          ? "var(--mantine-color-blue-6)"
                          : "var(--mantine-color-dimmed)"
                      }
                    />
                    <Text
                      size="xs"
                      c={pathname === href ? "blue" : "dimmed"}
                      fw={pathname === href ? 600 : 400}
                    >
                      {label}
                    </Text>
                  </Stack>
                </UnstyledButton>
              ))}
              <UnstyledButton
                component={Link}
                href="/profile"
                style={{ flex: 1 }}
              >
                <Stack gap={2} align="center">
                  <IconUser
                    size={22}
                    color={
                      pathname === "/profile"
                        ? "var(--mantine-color-blue-6)"
                        : "var(--mantine-color-dimmed)"
                    }
                  />
                  <Text
                    size="xs"
                    c={pathname === "/profile" ? "blue" : "dimmed"}
                    fw={pathname === "/profile" ? 600 : 400}
                  >
                    マイページ
                  </Text>
                </Stack>
              </UnstyledButton>
            </Group>
          </AppShellFooter>
        </AppShell>
        {LogoutModal}
      </>
    );
  }

  return (
    <>
      <AppShell
        navbar={{ width: 220, breakpoint: "sm" }}
        padding="md"
        withBorder
      >
        <AppShellNavbar p="md">
          <AppShellSection>
            <Text fw={700} size="lg" mb="lg" c="blue">
              Diet Tracker
            </Text>
            <Stack gap={4}>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <NavLink
                  key={href}
                  component={Link}
                  href={href}
                  label={label}
                  leftSection={<Icon size={18} />}
                  active={pathname === href}
                  onClick={close}
                />
              ))}
            </Stack>
          </AppShellSection>
          <AppShellSection grow />
          <AppShellSection>
            <Stack gap={4}>
              <NavLink
                component={Link}
                href="/profile"
                label="マイページ"
                leftSection={<IconUser size={18} />}
                active={pathname === "/profile"}
                onClick={close}
              />
              <Group justify="space-between">
                <NavLink
                  onClick={openLogout}
                  label="ログアウト"
                  leftSection={<IconLogout size={18} />}
                />
                <ColorSchemeToggle />
              </Group>
            </Stack>
          </AppShellSection>
        </AppShellNavbar>
        <AppShellMain
          style={{
            height: "100dvh",
            minHeight: 0,
            boxSizing: "border-box",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {children}
        </AppShellMain>
      </AppShell>
      {LogoutModal}
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </ProfileProvider>
  );
}
