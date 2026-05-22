import { Supplier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HardHat, Star } from "lucide-react";
import Link from "next/link";

type SupplierListItemProps = {
  supplier: Supplier;
  href?: string;
};

export function SupplierListItem({ supplier, href }: SupplierListItemProps) {
  const sharedClass =
    "w-full flex items-center gap-3 py-3 text-left rounded-xl px-2 transition-all duration-200 active:scale-95 border-b dark:border-zinc-800/40 border-stone-200/40 dark:hover:bg-zinc-800/50 hover:bg-stone-100/30 dark:active:bg-zinc-800 active:bg-stone-100";

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-700/10 border border-orange-700/20">
        <HardHat className="h-4 w-4 text-orange-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium dark:text-zinc-100 text-stone-900 truncate">
          {supplier.name}
        </p>
        <p className="text-xs dark:text-zinc-500 text-stone-500 truncate">
          {supplier.specialty ?? "Especialidade não informada"}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {supplier.rating != null ? (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < supplier.rating! ? "fill-orange-400 text-orange-400" : "text-zinc-600"
                )}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs dark:text-zinc-600 text-stone-400">Sem avaliação</span>
        )}
        {supplier.whatsapp && (
          <span className="text-xs dark:text-zinc-500 text-stone-500 truncate max-w-[100px]">
            {supplier.whatsapp}
          </span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClass}>
        {content}
      </Link>
    );
  }

  return <div className={sharedClass}>{content}</div>;
}
