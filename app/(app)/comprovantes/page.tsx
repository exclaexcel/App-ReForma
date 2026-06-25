"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Expense } from "@/lib/types";
import { formatCurrency, getStoragePath } from "@/lib/utils";
import { FolderOpen, FileText, Download } from "lucide-react";

function groupByMonth(expenses: Expense[]): Map<string, Expense[]> {
  const groups = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const key = expense.expense_date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(expense);
  }
  return groups;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function isPdf(url: string): boolean {
  return url.toLowerCase().includes(".pdf");
}

function ReceiptCard({ expense, signedUrl }: { expense: Expense; signedUrl: string }) {
  return (
    <a
      href={signedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col rounded-2xl overflow-hidden
                 bg-white dark:bg-zinc-800
                 border border-stone-200 dark:border-zinc-700
                 active:scale-[0.98] transition-transform"
    >
      <div className="relative h-28 w-full bg-stone-100 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
        {isPdf(expense.receipt_url!) ? (
          <div className="flex flex-col items-center gap-1">
            <FileText className="h-10 w-10 text-orange-500" />
            <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">PDF</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt={expense.description}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 right-2 rounded-full bg-black/40 p-1">
          <Download className="h-3 w-3 text-white" />
        </div>
      </div>

      <div className="p-3 space-y-0.5">
        <p className="text-sm font-bold text-orange-700 dark:text-orange-400 tabular-nums">
          {formatCurrency(expense.amount)}
        </p>
        <p className="text-xs font-medium text-stone-800 dark:text-zinc-200 truncate">
          {expense.description}
        </p>
        <p className="text-xs text-stone-400 dark:text-zinc-500">
          {new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(expense.expense_date + "T12:00:00"))}
        </p>
      </div>
    </a>
  );
}

export default function ComprovantesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [signedUrls, setSignedUrls] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!project) return;

      const { data, error } = await supabase
        .from("expenses")
        .select("*, categories(id, name, color_hex)")
        .eq("project_id", project.id)
        .not("receipt_url", "is", null)
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const fetched = (data ?? []) as Expense[];
      setExpenses(fetched);

      const withReceipts = fetched.filter((e) => e.receipt_url);
      if (withReceipts.length > 0) {
        const paths = withReceipts.map((e) => getStoragePath(e.receipt_url!));
        const { data: signedData } = await supabase.storage
          .from("receipts")
          .createSignedUrls(paths, 3600);

        if (signedData) {
          const urlMap = new Map<string, string>();
          signedData.forEach((item, idx) => {
            if (item.signedUrl) {
              urlMap.set(withReceipts[idx].receipt_url!, item.signedUrl);
            }
          });
          setSignedUrls(urlMap);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading comprovantes:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const grouped = groupByMonth(expenses);

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-5 w-5 text-orange-700 dark:text-orange-500" />
        <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">Pasta Digital</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-stone-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <FolderOpen className="h-12 w-12 text-stone-300 dark:text-zinc-600" />
          <p className="text-sm text-stone-500 dark:text-zinc-500">
            Nenhum comprovante encontrado.
          </p>
          <p className="text-xs text-stone-400 dark:text-zinc-600">
            Adicione fotos ou PDFs ao lançar uma despesa.
          </p>
          <Link href="/novo" className="mt-2 text-sm text-orange-600 hover:text-orange-500 underline font-medium">
            Ir para Novo Lançamento
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([key, group]) => (
            <section key={key}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">
                {monthLabel(key)}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {group
                  .filter((e) => signedUrls.has(e.receipt_url!))
                  .map((expense) => (
                    <ReceiptCard
                      key={expense.id}
                      expense={expense}
                      signedUrl={signedUrls.get(expense.receipt_url!)!}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
