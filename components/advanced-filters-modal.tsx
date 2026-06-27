"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { ExpenseType, EXPENSE_TYPE_LABELS } from "@/lib/types";

type AdvancedFiltersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
    expenseType?: ExpenseType;
    isPaid?: boolean | null;
    semComprovante?: boolean;
  };
  onFiltersChange: (filters: AdvancedFiltersModalProps["filters"]) => void;
  onExport?: () => void;
};

export function AdvancedFiltersModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onExport,
}: AdvancedFiltersModalProps) {
  const [local, setLocal] = useState(filters);

  const handleApply = () => {
    onFiltersChange(local);
    onClose();
  };

  const handleReset = () => {
    setLocal({});
    onFiltersChange({});
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        className="fixed inset-0 bg-black/50 z-40 cursor-default"
        onClick={onClose}
        aria-label="Fechar filtros"
        type="button"
      />
      {/* Modal */}
      <div className="fixed bottom-24 left-0 right-0 z-50 rounded-t-2xl bg-stone-900 dark:bg-zinc-900 border-t border-stone-200 dark:border-zinc-800 max-w-md mx-auto p-6 space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-100">Filtros Avançados</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Data Range */}
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="dateFrom" className="text-xs text-stone-600 dark:text-zinc-400">
                  De
                </label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={local.dateFrom ?? ""}
                  onChange={(e) => setLocal({ ...local, dateFrom: e.target.value || undefined })}
                  max={today}
                />
              </div>
              <div>
                <label htmlFor="dateTo" className="text-xs text-stone-600 dark:text-zinc-400">
                  Até
                </label>
                <Input
                  id="dateTo"
                  type="date"
                  value={local.dateTo ?? ""}
                  onChange={(e) => setLocal({ ...local, dateTo: e.target.value || undefined })}
                  max={today}
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="amountMin" className="text-xs text-stone-600 dark:text-zinc-400">
                  Mínimo
                </label>
                <Input
                  id="amountMin"
                  type="number"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={local.amountMin ?? ""}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      amountMin: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="amountMax" className="text-xs text-stone-600 dark:text-zinc-400">
                  Máximo
                </label>
                <Input
                  id="amountMax"
                  type="number"
                  inputMode="decimal"
                  placeholder="999.999,99"
                  value={local.amountMax ?? ""}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      amountMax: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Expense Type */}
          <div className="space-y-2">
            <Label>Tipo de Despesa</Label>
            <select
              value={local.expenseType ?? ""}
              onChange={(e) =>
                setLocal({ ...local, expenseType: (e.target.value as ExpenseType) || undefined })
              }
              className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(EXPENSE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div className="space-y-3">
            <Label>Status de Pagamento</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="paid"
                  checked={local.isPaid === true}
                  onCheckedChange={(checked) =>
                    setLocal({
                      ...local,
                      isPaid: checked ? true : local.isPaid === false ? null : false,
                    })
                  }
                />
                <label htmlFor="paid" className="text-sm cursor-pointer">
                  Pagos
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pending"
                  checked={local.isPaid === false}
                  onCheckedChange={(checked) =>
                    setLocal({
                      ...local,
                      isPaid: checked ? false : local.isPaid === true ? null : undefined,
                    })
                  }
                />
                <label htmlFor="pending" className="text-sm cursor-pointer">
                  A Pagar
                </label>
              </div>
            </div>
          </div>

          {/* No Receipt */}
          <div className="space-y-2">
            <Label>Documentação</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="semComprovante"
                checked={!!local.semComprovante}
                onCheckedChange={(checked) =>
                  setLocal({ ...local, semComprovante: checked ? true : undefined })
                }
              />
              <label htmlFor="semComprovante" className="text-sm cursor-pointer">
                Pagos sem comprovante
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-stone-700">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Limpar
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Aplicar Filtros
          </Button>
        </div>
        {onExport && (
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="w-full text-xs text-amber-400 hover:text-amber-300 underline text-center py-2"
          >
            ↓ Exportar resultado atual como CSV
          </button>
        )}
      </div>
    </>
  );
}
