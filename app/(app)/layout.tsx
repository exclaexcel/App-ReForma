import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  let user = null;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900">
      <main className={user ? "pb-24" : ""}>{children}</main>
      {user && <BottomNav />}
    </div>
  );
}
