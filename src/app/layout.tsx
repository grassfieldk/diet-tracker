import { MantineProvider, mantineHtmlProps } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diet Tracker",
  description: "食事・体重を記録して健康管理をサポートするアプリ",
};

const COLOR_SCHEME_SCRIPT = `try{
var s=localStorage.getItem('mantine-color-scheme-value');
var c=s==='light'||s==='dark'||s==='auto'?s:'light';
var r=c!=='auto'?c:window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
document.documentElement.setAttribute('data-mantine-color-scheme',r);
}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" {...mantineHtmlProps}>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Mantine カラースキーム初期化スクリプト */}
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }} />
      </head>
      <body>
        <MantineProvider>
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
