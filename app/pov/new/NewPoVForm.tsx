"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User { id: string; name: string | null; role: string; }

interface Props {
  defaultSalesEngineer: string;
  users: User[];
}

export default function NewPoVForm({ defaultSalesEngineer, users }: Props) {
  const router = useRouter();
  const [customerName,   setCustomerName]   = useState("");
  const [ownerType,      setOwnerType]      = useState<"SE" | "SME">("SE");
  const [salesEngineer,  setSalesEngineer]  = useState(defaultSalesEngineer);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pov", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: customerName.trim(), ownerType, salesEngineer }),
      });
      if (!res.ok) throw new Error("Failed to create PoV");
      const pov = await res.json();
      router.push(`/pov/${pov.id}/context`);
    } catch {
      setError("Could not create the PoV. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">New Proof of Value</h1>
            <p className="text-xs text-slate-500">Start a new evaluation engagement</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Customer Name *
            </label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Sophos Contact
            </label>
            {users.length > 0 ? (
              <select
                value={salesEngineer}
                onChange={e => setSalesEngineer(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select SE / SME…</option>
                {users.map(u => (
                  <option key={u.id} value={u.name ?? ""}>{u.name} ({u.role})</option>
                ))}
              </select>
            ) : (
              <input
                value={salesEngineer}
                onChange={e => setSalesEngineer(e.target.value)}
                placeholder="Your name"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Owner Type
            </label>
            <select
              value={ownerType}
              onChange={e => setOwnerType(e.target.value as "SE" | "SME")}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="SE">Sophos SE</option>
              <option value="SME">Sophos SME</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-slate-300 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!customerName.trim() || loading}
              className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40"
            >
              {loading ? "Creating…" : "Create PoV"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
