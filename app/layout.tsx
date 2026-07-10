import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.wanghuanlab.com"),
  title: "欢的实验室｜Wanghuan Lab",
  description: "欢的实验室——个人作品、数字产品与智能体实验的导航入口。",
  icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
  openGraph: {
    title: "欢的实验室｜Wanghuan Lab",
    description: "一些想法，正在这里发生。探索数字产品、智能体与持续生长的实验。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "欢的实验室｜Wanghuan Lab" }],
  },
  twitter: { card: "summary_large_image", title: "欢的实验室｜Wanghuan Lab", description: "一些想法，正在这里发生。", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
