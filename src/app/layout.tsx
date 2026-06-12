import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "学校信息系统备案管理平台",
  description: "学校信息系统备案查询与管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-white">{children}</body>
    </html>
  );
}
