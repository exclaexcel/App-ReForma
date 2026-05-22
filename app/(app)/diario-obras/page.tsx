"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { TaskListItem } from "@/components/task-list-item";
import { Input } from "@/components/ui/input";
import { Task, TaskStatus } from "@/lib/types";
import { Search, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluido", label: "Concluído" },
];

type RoomProgress = {
  roomId: string;
  roomName: string;
  total: number;
  done: number;
};

export default function DiarioObrasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [loading, setLoading] = useState(true);

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
        .from("tasks")
        .select("*, rooms(id, name)")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data ?? []) as Task[]);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Progresso por cômodo (apenas tarefas vinculadas)
  const roomProgressMap = new Map<string, RoomProgress>();
  for (const task of tasks) {
    if (!task.rooms) continue;
    const key = task.rooms.id;
    if (!roomProgressMap.has(key)) {
      roomProgressMap.set(key, { roomId: key, roomName: task.rooms.name, total: 0, done: 0 });
    }
    const entry = roomProgressMap.get(key)!;
    entry.total++;
    if (task.status === "concluido") entry.done++;
  }
  const roomProgress = Array.from(roomProgressMap.values()).sort((a, b) =>
    a.roomName.localeCompare(b.roomName)
  );

  return (
    <div className="px-4 pt-6 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold dark:text-zinc-100 text-stone-900">Diário de Obras</h1>
        <Link
          href="/diario-obras/nova"
          className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-700 hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4 text-white" />
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Buscar tarefa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filterStatus === value
                ? "bg-orange-700 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Progresso por cômodo */}
      {!loading && roomProgress.length > 0 && (
        <div className="space-y-2 pt-1">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            Progresso por cômodo
          </h2>
          <div className="space-y-2">
            {roomProgress.map((rp) => {
              const pct = rp.total === 0 ? 0 : Math.round((rp.done / rp.total) * 100);
              return (
                <div key={rp.roomId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs dark:text-zinc-300 text-stone-700">{rp.roomName}</span>
                    <span className="text-xs dark:text-zinc-500 text-stone-500">
                      {rp.done}/{rp.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-orange-600 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
          <ClipboardList className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">
            {search || filterStatus !== "all"
              ? "Nenhuma tarefa encontrada."
              : "Nenhuma tarefa ainda."}
          </p>
          {!search && filterStatus === "all" && (
            <Link
              href="/diario-obras/nova"
              className="mt-1 text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
            >
              Adicionar primeira tarefa
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {filtered.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              href={`/diario-obras/${task.id}/editar`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
