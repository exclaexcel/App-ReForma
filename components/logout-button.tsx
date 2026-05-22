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
                 text-stone-500 dark:text-zinc-400
                 hover:text-stone-700 dark:hover:text-zinc-300
                 transition-colors"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
