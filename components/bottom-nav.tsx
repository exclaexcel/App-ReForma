"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Calendar,
  Users,
  Plus,
  BarChart3,
  MoreHorizontal,
  FolderOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Início", ariaLabel: "Início" },
  { href: "/despesas", icon: ClipboardList, label: "Despesas", ariaLabel: "Despesas" },
  { href: "/novo", icon: null, label: "Novo", ariaLabel: "Novo" },
  { href: "/agenda", icon: Calendar, label: "Agenda", ariaLabel: "Agenda" },
  { href: "/graficos", icon: BarChart3, label: "Gráficos", ariaLabel: "Gráficos" },
];

const moreItems = [
  { href: "/fornecedores", icon: Users, label: "Fornecedores" },
  { href: "/comprovantes", icon: FolderOpen, label: "Comprovantes" },
];

function isMoreRoute(pathname: string) {
  return moreItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

const navLinkClass =
  "flex flex-1 min-w-0 flex-col items-center gap-1 px-1 py-1 rounded-xl transition-all duration-200";
const navIdleClass =
  "text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300";

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = isMoreRoute(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Fechar menu Mais"
          className="fixed inset-x-0 top-0 bottom-24 z-[60] bg-zinc-900/50"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="more-nav-title"
          className="fixed bottom-24 left-1/2 z-[70] w-full max-w-[430px] -translate-x-1/2 rounded-t-2xl border-t border-stone-200 bg-white p-4 pb-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="more-nav-title"
              className="text-sm font-semibold text-stone-900 dark:text-zinc-100"
            >
              Mais
            </h2>
            <button
              type="button"
              className="rounded-xl p-2 text-stone-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
              aria-label="Fechar"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2">
            {moreItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-95",
                    isActive
                      ? "border-orange-700/30 bg-orange-700/10 text-orange-700 dark:text-orange-500"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0 text-orange-700 dark:text-orange-500" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-stone-50/95 dark:bg-zinc-900/95 border-t border-stone-200 dark:border-zinc-800 backdrop-blur-sm z-[80]">
        <div className="flex items-center px-1 pb-safe pt-2">
          {navItems.map((item) => {
            if (item.icon === null) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  className="flex flex-1 min-w-0 flex-col items-center justify-center -mt-6"
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
                aria-label={item.ariaLabel}
                aria-current={isActive ? "page" : undefined}
                className={cn(navLinkClass, isActive ? "text-orange-500" : navIdleClass)}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="text-xs font-medium leading-tight whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            aria-label="Mais"
            aria-expanded={open}
            aria-current={moreActive ? "page" : undefined}
            onClick={() => setOpen((value) => !value)}
            className={cn(navLinkClass, moreActive || open ? "text-orange-500" : navIdleClass)}
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span className="text-xs font-medium leading-tight whitespace-nowrap">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
