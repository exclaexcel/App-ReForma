"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AtualizarSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setHasSession(!!session);
      setCheckingSession(false);
      if (!session) {
        setError(
          "Sessão de recuperação ausente ou expirada. Peça um novo e-mail em Esqueci minha senha."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError(
        "Sessão de recuperação ausente ou expirada. Peça um novo e-mail em Esqueci minha senha."
      );
      setHasSession(false);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      const msg = updateError.message?.toLowerCase() ?? "";
      if (msg.includes("session") || msg.includes("jwt") || updateError.status === 401) {
        setError(
          "Sessão de recuperação ausente ou expirada. Peça um novo e-mail em Esqueci minha senha."
        );
        setHasSession(false);
      } else if (
        msg.includes("same") ||
        msg.includes("different") ||
        msg.includes("should be different")
      ) {
        setError("Essa já é a senha atual. Escolha outra para continuar.");
      } else {
        setError("Não foi possível atualizar a senha. Tente de novo ou peça um novo e-mail.");
      }
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-700/20 border border-orange-700/30">
            <HardHat className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Nova senha</h1>
            <p className="text-sm text-stone-500 dark:text-zinc-500 mt-1">
              Escolha uma senha segura para sua conta
            </p>
          </div>
        </div>

        {checkingSession ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-700" />
          </div>
        ) : !hasSession ? (
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-400">
                {error}
              </div>
            )}
            <Link
              href="/recuperar-senha"
              className="flex w-full items-center justify-center rounded-xl bg-orange-700 hover:bg-orange-800 px-4 py-3 text-sm font-semibold text-white"
            >
              Pedir novo e-mail
            </Link>
            <Link
              href="/login"
              className="block text-center text-sm text-stone-500 dark:text-zinc-500 hover:text-orange-700"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
