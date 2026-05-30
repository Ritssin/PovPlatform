"use client";

import Link from "next/link";

export default function NewPoVButton() {
  return (
    <Link
      href="/pov/new"
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5v14"/>
      </svg>
      New PoV
    </Link>
  );
}
