"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Alternar tema"
      className="flex h-9 w-9 items-center justify-center rounded-xl
                 text-stone-500 dark:text-zinc-400
                 hover:bg-stone-100 dark:hover:bg-zinc-800
                 transition-colors"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
