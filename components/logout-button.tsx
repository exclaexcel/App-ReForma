"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Sair"
      className="flex h-9 w-9 items-center justify-center rounded-xl
                 bg-stone-100 dark:bg-zinc-800
                 border border-stone-200 dark:border-zinc-700
                 text-stone-600 dark:text-zinc-400
                 hover:bg-stone-200 dark:hover:bg-zinc-700
                 transition-colors"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
