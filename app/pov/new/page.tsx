import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import NewPoVForm from "./NewPoVForm";

export default async function NewPoVPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "";

  // Fetch users for SE dropdown
  const users = await db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  return <NewPoVForm defaultSalesEngineer={userName} users={users} />;
}
