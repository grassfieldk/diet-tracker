import { MantineProvider, mantineHtmlProps } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "./serwist";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diet Tracker",
  description: "食事・体重を記録して健康管理をサポートするアプリ",
  applicationName: "Diet Tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Diet Tracker",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#228be6",
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
        <SerwistProvider swUrl="/serwist/sw.js">
          <MantineProvider>
            <Notifications />
            {children}
          </MantineProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
