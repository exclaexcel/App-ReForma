"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Installment,
  INSTALLMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type InstallmentRowProps = {
  installment: Installment;
  onUpdate?: () => void;
};

export function InstallmentRow({ installment, onUpdate }: InstallmentRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(installment.status);
  const [paymentMethod, setPaymentMethod] = useState(installment.payment_method);

  const isOverdue = installment.status === "pending" && new Date(installment.due_date) < new Date();

  async function handleStatusChange(newStatus: typeof status) {
    setIsUpdating(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("installments")
        .update({
          status: newStatus,
          paid_at: newStatus === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", installment.id);

      if (error) throw error;

      setStatus(newStatus);
      toast.success(
        newStatus === "paid" ? "Parcela marcada como paga" : "Parcela marcada como pendente"
      );
      onUpdate?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar parcela.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handlePaymentMethodChange(newMethod: PaymentMethod) {
    setIsUpdating(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("installments")
        .update({ payment_method: newMethod })
        .eq("id", installment.id);

      if (error) throw error;

      setPaymentMethod(newMethod);
      toast.success("Forma de pagamento atualizada");
      onUpdate?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar forma de pagamento.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3",
        status === "paid"
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50"
          : isOverdue
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50"
            : "bg-stone-100 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700"
      )}
    >
      {/* Header: número, valor, data */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold dark:text-zinc-100 text-stone-900">
            Parcela {installment.installment_number} de {installment.total_installments}
          </p>
          <p className="text-xs dark:text-zinc-500 text-stone-500">
            {formatDate(installment.due_date)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold dark:text-zinc-100 text-stone-900 tabular-nums">
            {formatCurrency(installment.amount)}
          </p>
          <div className="flex items-center gap-1 text-xs font-medium mt-1">
            <span
              className={cn(
                "flex items-center gap-0.5",
                status === "paid"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isOverdue
                    ? "text-red-600 dark:text-red-400"
                    : "text-orange-600 dark:text-orange-400"
              )}
            >
              {status === "paid" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : isOverdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {isOverdue ? "Atrasado" : INSTALLMENT_STATUS_LABELS[status]}
            </span>
          </div>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="space-y-2">
        <p className="text-xs font-medium dark:text-zinc-400 text-stone-600">Forma de Pagamento</p>
        <Select
          value={paymentMethod}
          onValueChange={handlePaymentMethodChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Status toggle buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant={status === "paid" ? "default" : "outline"}
          onClick={() => handleStatusChange("paid")}
          disabled={isUpdating}
          className="flex-1"
        >
          {isUpdating && status === "paid" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Marcar Pago"
          )}
        </Button>
        <Button
          size="sm"
          variant={status !== "paid" ? "default" : "outline"}
          onClick={() => handleStatusChange("pending")}
          disabled={isUpdating}
          className="flex-1"
        >
          {isUpdating && status !== "paid" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Marcar Pendente"
          )}
        </Button>
      </div>
    </div>
  );
}
