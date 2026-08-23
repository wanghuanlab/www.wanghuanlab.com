import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "./lib/i18n";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://wanghuanlab.com"),
  title: "欢的实验室｜Wanghuan Lab",
  description: "欢的实验室——个人作品、数字产品与智能体实验的导航入口。",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "欢的实验室｜Wanghuan Lab",
    description: "一些想法，正在这里发生。探索数字产品、智能体与持续生长的实验。",
    type: "website",
    locale: "zh_CN",
    url: "https://wanghuanlab.com",
    siteName: "欢的实验室",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "欢的实验室｜Wanghuan Lab" }],
  },
  twitter: { card: "summary_large_image", title: "欢的实验室｜Wanghuan Lab", description: "一些想法，正在这里发生。", images: ["/og.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?60f449bf70e10c6fb7876876564f6291";
                var s = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(hm, s);
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
