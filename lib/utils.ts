import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Expense, type DocStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getStoragePath(receiptUrl: string): string {
  const marker = "/object/public/receipts/";
  const idx = receiptUrl.indexOf(marker);
  if (idx !== -1) return receiptUrl.slice(idx + marker.length);
  return receiptUrl;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function getDocStatus(expense: Expense): DocStatus {
  const { expense_type, is_paid, receipt_url, invoice_url, invoice_value, amount } =
    expense;

  if (expense_type === "mao_obra") {
    if (is_paid && !receipt_url) return "pendente";
    return "completo";
  }

  if (expense_type === "material" || expense_type === "loja") {
    if (!invoice_url) return "pendente";
    if (is_paid && !receipt_url) return "pendente";
    if (invoice_value && Math.abs(invoice_value - amount) > 0.01)
      return "divergencia";
    return "completo";
  }

  if (expense_type === "servico") {
    if (is_paid && !receipt_url) return "pendente";
    if (!invoice_url) return "pendente";
    return "completo";
  }

  return "sem_regra";
}
