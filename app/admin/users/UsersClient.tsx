"use client";

import { useState } from "react";
import { Role } from "@prisma/client";

type User = {
  id:        string;
  name:      string | null;
  email:     string;
  role:      Role;
  createdAt: Date;
};

const ROLE_LABELS: Record<Role, string> = {
  SE:      "SE",
  SME:     "SME",
  MANAGER: "Manager",
  ADMIN:   "Admin",
};

const ROLE_COLORS: Record<Role, string> = {
  SE:      "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
  SME:     "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300",
  MANAGER: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
  ADMIN:   "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300",
};

export default function UsersClient({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role>(Role.SE);

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setLoading(id);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers(u => u.filter(x => x.id !== id));
    setLoading(null);
  }

  async function handleRoleChange(id: string) {
    setLoading(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role: editRole }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers(u => u.map(x => x.id === id ? { ...x, role: updated.role } : x));
    }
    setEditId(null);
    setLoading(null);
  }

  if (users.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center text-fg-muted text-sm">
        No users yet. Create the first user above.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card-alt">
            <th className="text-left px-4 py-3 text-xs font-semibold text-fg-muted uppercase tracking-wide">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-fg-muted uppercase tracking-wide">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-fg-muted uppercase tracking-wide">Role</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-fg-muted uppercase tracking-wide">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-card-alt transition-colors">
              <td className="px-4 py-3 font-medium text-fg">{user.name ?? "—"}</td>
              <td className="px-4 py-3 text-fg-dim">{user.email}</td>
              <td className="px-4 py-3">
                {editId === user.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={editRole}
                      onChange={e => setEditRole(e.target.value as Role)}
                      className="text-xs border border-border rounded px-2 py-1 bg-card text-fg"
                    >
                      {Object.values(Role).map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRoleChange(user.id)}
                      disabled={loading === user.id}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditId(null)} className="text-xs text-fg-muted hover:text-fg">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditId(user.id); setEditRole(user.role); }}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]} hover:opacity-75 transition-opacity`}
                  >
                    {ROLE_LABELS[user.role]}
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-fg-muted text-xs">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={loading === user.id}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
                >
                  {loading === user.id ? "..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
