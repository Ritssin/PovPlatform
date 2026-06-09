"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { handleSignOut } from "@/lib/actions";
import ThemeToggle from "./ThemeToggle";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null; role: Role };
  children: React.ReactNode;
}

export default function AppShell({ user, children }: Props) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* Top nav */}
      <header className="bg-[#0B1F3A] text-white sticky top-0 z-40 shadow-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-13">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0049BD] rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight">Sophos Proof of Value</span>
          </div>

          <nav className="flex items-center gap-0.5">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === "/dashboard" ? "bg-white/10 text-white" : "text-blue-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Dashboard
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/library"
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname.startsWith("/admin/library") ? "bg-white/10 text-white" : "text-blue-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Library
                </Link>
                <Link
                  href="/admin/users"
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname.startsWith("/admin/users") ? "bg-white/10 text-white" : "text-blue-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Users
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/pov/new"
              className="hidden sm:flex items-center gap-1.5 bg-[#0049BD] hover:bg-[#003DA0] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New PoV
            </Link>
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-white">{user.name}</p>
              <p className="text-xs text-blue-300/70">{user.role}</p>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-xs text-blue-300/70 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
