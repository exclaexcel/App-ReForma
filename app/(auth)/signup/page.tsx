"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signupError || !data.user) {
      setError(signupError?.message ?? "Erro ao criar conta.");
      setLoading(false);
      return;
    }

    const parsedBudget = parseFloat(budget.replace(",", ".")) || 0;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: data.user.id,
        name: projectName || "Minha Reforma",
        total_budget: parsedBudget,
      })
      .select()
      .single();

    if (projectError) {
      setError("Conta criada, mas erro ao criar projeto.");
      setLoading(false);
      return;
    }

    await supabase.from("categories").insert(
      DEFAULT_CATEGORIES.map((cat) => ({ ...cat, project_id: project.id }))
    );

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-zinc-900 flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-700/20 border border-orange-700/30">
            <HardHat className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-100">Criar conta</h1>
            <p className="text-sm text-zinc-500 mt-1">Configure sua primeira reforma</p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Ana Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="p-4 rounded-2xl border border-zinc-700 bg-zinc-800/50 space-y-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Sua primeira obra
            </p>
            <div className="space-y-2">
              <Label htmlFor="projectName">Nome da obra</Label>
              <Input
                id="projectName"
                type="text"
                placeholder="Ex: Reforma Apartamento 2026"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento total (R$)</Label>
              <Input
                id="budget"
                type="text"
                inputMode="decimal"
                placeholder="Ex: 45000,00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar conta e começar"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
