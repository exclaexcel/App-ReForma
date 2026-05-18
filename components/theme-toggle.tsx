"use client";

import { Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const newDark = !isDark;
    setIsDark(newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
      document.cookie = "reforma-theme=dark; path=/; max-age=31536000; SameSite=Lax";
    } else {
      document.documentElement.classList.remove("dark");
      document.cookie = "reforma-theme=light; path=/; max-age=31536000; SameSite=Lax";
    }

    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="flex h-9 w-9 items-center justify-center rounded-xl
                 bg-stone-100 dark:bg-zinc-800
                 border border-stone-200 dark:border-zinc-700
                 text-stone-600 dark:text-zinc-400
                 hover:bg-stone-200 dark:hover:bg-zinc-700
                 transition-colors"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
