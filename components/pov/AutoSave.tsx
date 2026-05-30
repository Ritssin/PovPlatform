"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(povId: string) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const pendingRef = useRef<Record<string, unknown>>({});

  const flush = useCallback(async () => {
    const payload = { ...pendingRef.current };
    if (Object.keys(payload).length === 0) return;
    pendingRef.current = {};
    setStatus("saving");
    try {
      const res = await fetch(`/api/pov/${povId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }, [povId]);

  const debouncedFlush = useDebouncedCallback(flush, 600);

  const save = useCallback(
    (changes: Record<string, unknown>) => {
      pendingRef.current = { ...pendingRef.current, ...changes };
      debouncedFlush();
    },
    [debouncedFlush]
  );

  const saveImmediate = useCallback(
    async (changes: Record<string, unknown>) => {
      pendingRef.current = { ...pendingRef.current, ...changes };
      debouncedFlush.cancel();
      await flush();
    },
    [flush, debouncedFlush]
  );

  return { save, saveImmediate, status };
}

export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      {status === "saving" && (
        <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-slate-400">Saving…</span></>
      )}
      {status === "saved" && (
        <><span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-emerald-600">Saved</span></>
      )}
      {status === "error" && (
        <><span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-red-600">Save error</span></>
      )}
    </div>
  );
}
