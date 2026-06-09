"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { label: "Business Context", sub: "Details & readiness", segment: "context" },
  { label: "Success Criteria", sub: "Objectives & criteria", segment: "criteria" },
  { label: "Execute",          sub: "Track & export",       segment: "execute" },
];

interface Props {
  povId: string;
  customerName: string;
  score: number;
}

export default function PoVStepNav({ povId, customerName, score }: Props) {
  const pathname = usePathname();
  const currentSegment = pathname.split("/").pop() ?? "";
  const currentStep    = STEPS.findIndex((s) => s.segment === currentSegment);

  return (
    <div className="bg-[#0B1F3A] text-white -mx-4 px-4 py-0 flex items-stretch justify-between border-t border-white/10 min-h-[48px]">
      {/* Back + customer name breadcrumb */}
      <div className="flex items-center gap-2 py-2 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-blue-300 hover:text-white transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <span className="text-white/20 text-xs">/</span>
        <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span className="text-sm font-semibold text-white truncate max-w-[160px]">{customerName}</span>
      </div>

      {/* Step tabs */}
      <div className="flex items-stretch gap-0">
        {STEPS.map((step, i) => {
          const active = step.segment === currentSegment;
          const done   = i < currentStep;
          return (
            <Link
              key={step.segment}
              href={`/pov/${povId}/${step.segment}`}
              className={`flex items-center gap-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                active
                  ? "border-blue-400 text-white bg-white/10"
                  : "border-transparent text-blue-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                active ? "bg-blue-500" : done ? "bg-emerald-500" : "bg-white/20"
              }`}>
                {done ? "✓" : i + 1}
              </span>
              <div className="hidden sm:block text-left">
                <div className="font-semibold">{step.label}</div>
                <div className="opacity-50 font-normal text-[10px]">{step.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Score badge */}
      <div className="flex items-center py-2 shrink-0">
        <div className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${
          score >= 70
            ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
            : "bg-amber-500/20 border-amber-400/40 text-amber-200"
        }`}>
          {score}/90
        </div>
      </div>
    </div>
  );
}
