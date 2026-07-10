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
  const { expense_type, is_paid, receipt_url, invoice_url, invoice_value, amount } = expense;

  if (expense_type === "mao_obra") {
    if (is_paid && !receipt_url) return "sem_comprovante";
    return "completo";
  }

  if (expense_type === "material" || expense_type === "loja") {
    if (!invoice_url) return "pendente";
    if (is_paid && !receipt_url) return "sem_comprovante";
    if (invoice_value && Math.abs(invoice_value - amount) > 0.01) return "divergencia";
    return "completo";
  }

  if (expense_type === "servico") {
    if (is_paid && !receipt_url) return "sem_comprovante";
    if (!invoice_url) return "pendente";
    return "completo";
  }

  return "sem_regra";
}

export function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split("T")[0];
}

export function splitAmountCentavos(totalReais: number, n: number): number[] {
  if (n <= 0) throw new Error("n must be >= 1");
  const totalCents = Math.round(totalReais * 100);
  const baseCents = Math.floor(totalCents / n);
  const remainder = totalCents - baseCents * n;
  return Array.from({ length: n }, (_, i) => (baseCents + (i < remainder ? 1 : 0)) / 100);
}

export function getLocalDateString(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
