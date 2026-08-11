import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";

/**
 * Auth gate for app shell.
 * Guests may render `/` (LandingPage in page.tsx). Middleware still
 * redirects unauthenticated users away from other (app) routes.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    user = null;
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900">
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
