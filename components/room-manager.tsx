"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Room } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, DoorOpen, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

type RoomManagerProps = {
  projectId: string;
  initialRooms: Room[];
};

export function RoomManager({ projectId, initialRooms }: RoomManagerProps) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);
    const toastId = toast.loading("Adicionando...");

    const { data, error: insertError } = await supabase
      .from("rooms")
      .insert({ project_id: projectId, name: newName.trim() })
      .select()
      .maybeSingle();

    if (insertError || !data) {
      setError("Erro ao adicionar cômodo.");
      toast.error("Erro ao adicionar cômodo.", { id: toastId });
    } else {
      setRooms((prev) => [...prev, data as Room].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      toast.success("Cômodo adicionado", { id: toastId });
    }
    setAdding(false);
  }

  async function handleDelete(roomId: string) {
    setDeletingId(roomId);
    const toastId = toast.loading("Deletando...");
    const { error: deleteError } = await supabase.from("rooms").delete().eq("id", roomId);
    if (deleteError) {
      setError("Erro ao remover cômodo.");
      toast.error("Erro ao remover cômodo.", { id: toastId });
    } else {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      toast.success("Cômodo excluído", { id: toastId });
    }
    setDeletingId(null);
    setShowDeleteDialog(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Ex: Cozinha, Suíte, Sala..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={adding}
          className="flex-1"
        />
        <Button type="submit" disabled={adding || !newName.trim()} className="shrink-0">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <DoorOpen className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">Nenhum cômodo cadastrado ainda.</p>
          <p className="text-xs text-zinc-600">Adicione cômodos para categorizar suas despesas.</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {rooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-stone-800 dark:text-zinc-200">{room.name}</span>
              <button
                onClick={() => {
                  setRoomToDelete(room.id);
                  setShowDeleteDialog(true);
                }}
                disabled={deletingId === room.id}
                aria-label="Excluir cômodo"
                className="p-3 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-40"
              >
                {deletingId === room.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir cômodo?"
        description="Esta ação não pode ser desfeita."
        actionLabel="Excluir"
        onConfirm={() => roomToDelete && handleDelete(roomToDelete)}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={deletingId !== null}
      />
    </div>
  );
}
