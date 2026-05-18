import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900">
      <main className={user ? "pb-24" : ""}>{children}</main>
      {user && <BottomNav />}
    </div>
  );
}
