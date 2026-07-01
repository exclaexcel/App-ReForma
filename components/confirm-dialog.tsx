"use client";

import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  actionLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 dark:bg-black/60"
        onClick={onCancel}
        aria-label="Fechar diálogo"
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl">
          <div className="px-6 py-4 border-b border-stone-200 dark:border-zinc-800">
            <h2 id="dialog-title" className="text-lg font-bold text-stone-900 dark:text-zinc-100">
              {title}
            </h2>
            <p className="text-sm text-stone-600 dark:text-zinc-400 mt-1">{description}</p>
          </div>
          <div className="px-6 py-4 flex gap-3 justify-end">
            <Button onClick={onCancel} disabled={isLoading} variant="outline" className="text-sm">
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`text-sm ${isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
            >
              {isLoading ? "Deletando..." : actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
