"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md">
        <p className="text-5xl font-bold text-slate-200 mb-4">!</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
        <p className="text-slate-500 text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="bg-[#0049BD] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
