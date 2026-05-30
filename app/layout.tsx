import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sophos PoV Platform",
  description: "Proof of Value management platform for Sophos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
