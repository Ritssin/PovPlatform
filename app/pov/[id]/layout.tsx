import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import AppShell from "@/components/ui/AppShell";
import PoVStepNav from "@/components/pov/StepNav";

export default async function PoVLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const pov = await db.poV.findUnique({
    where: { id: params.id },
    select: {
      id: true, customerName: true, ownerId: true,
      readinessScore: true, status: true, percentValidated: true,
      criteriaTotal: true, criteriaValidated: true,
    },
  });

  if (!pov) notFound();

  const canAccess =
    pov.ownerId === session.user.id ||
    session.user.role === "MANAGER" ||
    session.user.role === "ADMIN";
  if (!canAccess) redirect("/dashboard");

  return (
    <AppShell user={session.user}>
      <PoVStepNav povId={params.id} customerName={pov.customerName} score={pov.readinessScore} />
      <div className="mt-6">{children}</div>
    </AppShell>
  );
}
