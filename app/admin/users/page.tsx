import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import UsersClient from "./UsersClient";
import bcrypt from "bcryptjs";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  async function createUser(formData: FormData) {
    "use server";
    const email    = formData.get("email") as string;
    const name     = formData.get("name") as string;
    const password = formData.get("password") as string;
    const role     = (formData.get("role") as Role) ?? Role.SE;

    if (!email || !name || !password || password.length < 8) return;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return;

    const hashed = await bcrypt.hash(password, 12);
    await db.user.create({
      data: { email, name, password: hashed, role },
    });

    redirect("/admin/users");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">Create and manage platform users.</p>
      </div>

      {/* Create user form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Add New User</h2>
        <form action={createUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Jane Smith"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="jane@sophos.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password (min 8 chars)</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
            <select
              name="role"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SE">SE</option>
              <option value="SME">SME</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="bg-[#0049BD] hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Create user
            </button>
          </div>
        </form>
      </div>

      {/* User list */}
      <UsersClient users={users} />
    </div>
  );
}
