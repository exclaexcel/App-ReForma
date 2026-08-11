"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const COLOR_OPTIONS = ["#C84B31", "#5C3A21", "#D97757", "#92400e", "#B45309", "#78716c"];

type CategoryManagerProps = {
  projectId: string;
};

export function CategoryManager({ projectId }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState(COLOR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, project_id, name, color_hex")
      .eq("project_id", projectId)
      .order("name");

    if (error) {
      toast.error("Erro ao carregar categorias.");
      setCategories([]);
    } else {
      setCategories((data ?? []) as Category[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({
      project_id: projectId,
      name: trimmed,
      color_hex: colorHex,
    });

    if (error) {
      toast.error("Não foi possível criar a categoria.");
    } else {
      toast.success("Categoria criada.");
      setName("");
      await load();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const supabase = createClient();

    const { count } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("category_id", toDelete.id)
      .neq("status", "cancelado");

    if ((count ?? 0) > 0) {
      toast.error("Há despesas usando esta categoria. Reatribua antes de excluir.");
      setDeleting(false);
      setToDelete(null);
      return;
    }

    const { error } = await supabase.from("categories").delete().eq("id", toDelete.id);
    if (error) {
      toast.error("Erro ao excluir categoria.");
    } else {
      toast.success("Categoria excluída.");
      await load();
    }
    setDeleting(false);
    setToDelete(null);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
      <div>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Categorias</h2>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
          Organize despesas por frente da obra.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-zinc-500 py-2">Nenhuma categoria ainda.</p>
      ) : (
        <ul className="divide-y divide-stone-100 dark:divide-zinc-700/80">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-3 py-2.5">
              <span
                className="h-3.5 w-3.5 rounded-full shrink-0 border border-black/10"
                style={{ backgroundColor: cat.color_hex }}
                aria-hidden
              />
              <span className="flex-1 text-sm text-stone-800 dark:text-zinc-200 truncate">
                {cat.name}
              </span>
              <button
                type="button"
                onClick={() => setToDelete(cat)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                aria-label={`Excluir ${cat.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleAdd}
        className="space-y-3 pt-2 border-t border-stone-100 dark:border-zinc-700"
      >
        <div className="space-y-2">
          <Label htmlFor="category-name">Nova categoria</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Elétrica"
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColorHex(c)}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${
                  colorHex === c
                    ? "border-stone-900 dark:border-zinc-100 scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>
        <Button type="submit" disabled={saving || !name.trim()} className="w-full gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Adicionar categoria
        </Button>
      </form>

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir categoria?"
        description={
          toDelete
            ? `A categoria “${toDelete.name}” será removida. Despesas vinculadas bloqueiam a exclusão.`
            : ""
        }
        actionLabel="Excluir"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
