"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Task, TaskStatus, TASK_STATUS_LABELS } from "@/lib/types";
import { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TASK_STATUSES: TaskStatus[] = ["pendente", "em_andamento", "concluido"];

type TaskFormProps = {
  projectId: string;
  rooms?: Room[];
  initialTask?: Task;
};

export function TaskForm({ projectId, rooms = [], initialTask }: TaskFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [roomId, setRoomId] = useState(initialTask?.room_id ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "pendente");
  const [notes, setNotes] = useState(initialTask?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const payload = {
        title: title.trim(),
        room_id: roomId || null,
        status,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && initialTask) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", initialTask.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("tasks")
          .insert({ project_id: projectId, ...payload });
        if (insertError) throw insertError;
      }

      router.push("/diario-obras");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar tarefa.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initialTask) return;
    if (!window.confirm("Excluir esta tarefa? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", initialTask.id);
      if (deleteError) throw deleteError;
      router.push("/diario-obras");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir tarefa.";
      setError(message);
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900 pb-8">
      <div className="sticky top-0 bg-stone-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-zinc-800 z-10 px-4 py-4 flex items-center gap-3">
        <Link
          href="/diario-obras"
          className="dark:text-zinc-400 dark:hover:text-zinc-100 text-stone-500 hover:text-stone-900 transition-colors duration-150"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold dark:text-zinc-100 text-stone-900 flex-1">
          {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
        </h1>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-400 disabled:opacity-50 p-1 transition-colors duration-150"
          >
            {deleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Tarefa</Label>
          <Input
            id="title"
            type="text"
            placeholder="Ex: Instalar tomadas do quarto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus={!isEditing}
            required
            className="text-2xl font-bold h-14"
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="grid grid-cols-3 gap-2">
            {TASK_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-xl border py-2.5 px-2 text-xs font-medium transition-all duration-200 active:scale-95",
                  status === s
                    ? s === "concluido"
                      ? "border-emerald-600 bg-emerald-700/20 text-emerald-400"
                      : s === "em_andamento"
                      ? "border-orange-600 bg-orange-700/20 text-orange-400"
                      : "border-zinc-500 bg-zinc-700/20 text-zinc-300"
                    : "border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 hover:border-stone-400 dark:hover:border-zinc-600"
                )}
              >
                {TASK_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {rooms.length > 0 && (
          <div className="space-y-2">
            <Label>Cômodo</Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cômodo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem cômodo</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <textarea
            id="notes"
            placeholder="Ex: Aguardando entrega do material elétrico"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-0 resize-none"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-300/60 dark:border-red-800/60 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isEditing ? (
            "Salvar Alterações"
          ) : (
            "Salvar Tarefa"
          )}
        </Button>
      </form>
    </div>
  );
}
