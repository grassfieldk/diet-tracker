import { ScrollArea, Stack } from "@mantine/core";
import type { ReactNode } from "react";

interface PageLayoutProps {
  /** 上部固定エリア */
  top: ReactNode;
  /** 中央スクロールエリア */
  children: ReactNode;
  /** 下部固定エリア */
  bottom: ReactNode;
}

/**
 * 上部固定 / 中央スクロール / 下部固定 の共通レイアウト
 */
export function PageLayout({ top, children, bottom }: PageLayoutProps) {
  return (
    <Stack gap="md" style={{ height: "100%" }}>
      {top}
      <ScrollArea style={{ flex: 1, minHeight: 0 }} scrollbars="y">
        {children}
      </ScrollArea>
      {bottom}
    </Stack>
  );
}
