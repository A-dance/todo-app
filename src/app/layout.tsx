import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TODO App",
  description: "Supabase 認証付き TODO アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
