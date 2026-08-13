"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { HardHat, Loader2 } from "lucide-react";
import Link from "next/link";
import type { EmailOtpType } from "@supabase/supabase-js";

function ConfirmarRecuperacaoForm() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type") ?? "recovery";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!tokenHash) {
      setError("Link incompleto. Peça um novo e-mail em Esqueci minha senha.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeParam as EmailOtpType,
    });

    if (verifyError || !data.session) {
      setError(
        "Este link já foi usado ou expirou. Peça um novo em Esqueci minha senha e abra o e-mail mais recente."
      );
      setLoading(false);
      return;
    }

    // Full navigation so auth cookies from verifyOtp are sent on the next page.
    window.location.assign("/atualizar-senha");
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-700/10 dark:bg-orange-700/20 border border-orange-700/20 dark:border-orange-700/30">
          <HardHat className="h-8 w-8 text-orange-700 dark:text-orange-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Redefinir senha</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500 mt-1">
            Toque no botão abaixo para continuar. Assim o link do e-mail não é gasto
            automaticamente.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {!tokenHash ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            Link incompleto. Peça um novo e-mail de recuperação.
          </div>
          <Link
            href="/recuperar-senha"
            className="block text-center text-sm text-orange-700 dark:text-orange-500 font-medium hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
      ) : (
        <Button
          type="button"
          className="w-full h-12 text-base"
          disabled={loading}
          onClick={handleConfirm}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuar para nova senha"}
        </Button>
      )}

      <Link
        href="/login"
        className="block text-center text-sm text-stone-500 dark:text-zinc-500 hover:text-orange-700 transition-colors"
      >
        Voltar para o login
      </Link>
    </div>
  );
}

export default function ConfirmarRecuperacaoPage() {
  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900 flex flex-col items-center justify-center px-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-orange-700" />
          </div>
        }
      >
        <ConfirmarRecuperacaoForm />
      </Suspense>
    </div>
  );
}
