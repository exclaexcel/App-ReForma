"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SupplierListItem } from "@/components/supplier-list-item";
import { Input } from "@/components/ui/input";
import { Supplier } from "@/lib/types";
import { Search, HardHat, Plus } from "lucide-react";
import Link from "next/link";

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        .from("suppliers")
        .select("*")
        .eq("project_id", project.id)
        .order("name");

      if (error) throw error;
      setSuppliers((data ?? []) as Supplier[]);
      setError(null);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      const message = error instanceof Error ? error.message : "Erro ao carregar fornecedores. Verifique sua conexão.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.specialty ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold dark:text-zinc-100 text-stone-900">Fornecedores</h1>
        <Link
          href="/fornecedores/novo"
          aria-label="Novo fornecedor"
          className="flex items-center justify-center h-11 w-11 rounded-full bg-orange-700 hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Buscar fornecedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <HardHat className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">
            {search ? "Nenhum fornecedor encontrado." : "Nenhum fornecedor cadastrado ainda."}
          </p>
          {!search && (
            <Link
              href="/fornecedores/novo"
              className="mt-1 text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
            >
              Cadastrar primeiro fornecedor
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {filtered.map((supplier) => (
            <SupplierListItem
              key={supplier.id}
              supplier={supplier}
              href={`/fornecedores/${supplier.id}/editar`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
