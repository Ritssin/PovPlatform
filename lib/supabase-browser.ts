import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client — used for Realtime subscriptions only.
// Not used for database access (Prisma handles that server-side).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
