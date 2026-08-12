import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Expense, type DocStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Digits-only WhatsApp number for wa.me (BR: prepend 55 when missing). */
export function toWhatsAppLink(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Safe Storage object name (basename only; no accents/spaces/#/?). */
export function sanitizeFileName(raw: string): string {
  const base = raw.replace(/\\/g, "/").split("/").pop() ?? "file";
  const normalized = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleaned = normalized.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_");
  const trimmed = cleaned.replace(/^[._-]+|[._-]+$/g, "").slice(0, 120);
  return trimmed || "file";
}

export function getStoragePath(receiptUrl: string): string {
  const withoutQuery = receiptUrl.split("?")[0] ?? receiptUrl;
  const markers = [
    "/object/public/receipts/",
    "/object/sign/receipts/",
    "/object/authenticated/receipts/",
  ];
  for (const marker of markers) {
    const idx = withoutQuery.indexOf(marker);
    if (idx !== -1) return withoutQuery.slice(idx + marker.length);
  }
  return withoutQuery;
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

/** YYYY-MM-DD no fuso local, com dia limitado ao último do mês. */
export function dateWithDayOfMonth(year: number, monthIndex: number, day: number): string {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(Math.max(1, day), lastDay);
  return getLocalDateString(new Date(year, monthIndex, safeDay));
}

/**
 * 1º vencimento da fatura do cartão: sempre no mês seguinte à compra
 * (ex.: compra 15/08, dia 25 → 25/09). Parcelas seguintes repetem o dia.
 */
export function nextCardDueDate(fromDateStr: string, dueDay: number): string {
  const from = new Date(fromDateStr + "T00:00:00");
  return dateWithDayOfMonth(from.getFullYear(), from.getMonth() + 1, dueDay);
}

/** Parcela N (0-based) no dia fixo da fatura. */
export function cardInstallmentDueDate(
  expenseDate: string,
  dueDay: number,
  installmentIndex: number
): string {
  const first = nextCardDueDate(expenseDate, dueDay);
  const d = new Date(first + "T00:00:00");
  return dateWithDayOfMonth(d.getFullYear(), d.getMonth() + installmentIndex, dueDay);
}

/**
 * Cartão de crédito + dia configurado → vencimento da fatura.
 * Demais métodos → data da compra + N meses (comportamento atual).
 */
export function computeInstallmentDueDate(
  expenseDate: string,
  installmentIndex: number,
  paymentMethod: string,
  cardDueDay: number | null | undefined
): string {
  if (
    paymentMethod === "cartao_credito" &&
    typeof cardDueDay === "number" &&
    cardDueDay >= 1 &&
    cardDueDay <= 28
  ) {
    return cardInstallmentDueDate(expenseDate, cardDueDay, installmentIndex);
  }
  return addMonths(expenseDate, installmentIndex);
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

/** Primeiro e último dia do mês (YYYY-MM-DD), no fuso local. */
export function getMonthBounds(date: Date = new Date()): { from: string; to: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  return {
    from: getLocalDateString(new Date(y, m, 1)),
    to: getLocalDateString(new Date(y, m + 1, 0)),
  };
}

export function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Remove sufixo legado "(n/m)" do título — a parcela real vai no badge. */
export function stripInstallmentSuffix(description: string): string {
  return description.replace(/\s*\(\d+\s*\/\s*\d+\)\s*$/, "").trimEnd();
}
