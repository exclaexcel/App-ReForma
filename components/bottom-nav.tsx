"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Calendar, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/despesas", icon: ClipboardList, label: "Despesas" },
  { href: "/novo", icon: null, label: "Novo" },
  { href: "/agenda", icon: Calendar, label: "Agenda" },
  { href: "/fornecedores", icon: Users, label: "Fornecedores" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-stone-50/95 dark:bg-zinc-900/95 border-t border-stone-200 dark:border-zinc-800 backdrop-blur-sm z-50">
      <div className="flex items-center justify-around px-2 pb-safe pt-2">
        {navItems.map((item) => {
          if (item.icon === null) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-700 shadow-lg shadow-orange-900/50 active:bg-orange-800 transition-all duration-200 active:scale-95">
                  <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200",
                isActive
                  ? "text-orange-500"
                  : "text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
