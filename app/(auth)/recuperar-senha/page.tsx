"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=/atualizar-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setError("Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-700/20 border border-orange-700/30">
            <HardHat className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Recuperar senha</h1>
            <p className="text-sm text-stone-500 dark:text-zinc-500 mt-1">
              Enviaremos um link para o seu e-mail
            </p>
          </div>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-green-900/20 border border-green-800/40 px-5 py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-stone-900 dark:text-zinc-100">E-mail enviado!</p>
                <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
                  Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="block text-center text-sm text-stone-500 dark:text-zinc-500 hover:text-orange-700 transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && (
              <div className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar link de recuperação"}
            </Button>

            <Link
              href="/login"
              className="block text-center text-sm text-stone-500 dark:text-zinc-500 hover:text-orange-700 transition-colors"
            >
              Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
