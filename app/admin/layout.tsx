import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/ui/AppShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return <AppShell user={session.user}>{children}</AppShell>;
}
