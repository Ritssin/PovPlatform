import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sophos PoV Platform",
  description: "Proof of Value management platform for Sophos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-page text-fg">
        {/* Inline theme init — runs before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();` }} />
        {children}
      </body>
    </html>
  );
}
