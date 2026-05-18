"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isMissingConfig =
    error.message?.includes("URL and API key") ||
    error.message?.includes("SUPABASE");

  return (
    <div className="min-h-dvh bg-zinc-900 flex items-center justify-center px-6">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-900/20 border border-red-800/30">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
        </div>

        {isMissingConfig ? (
          <>
            <div>
              <h1 className="text-lg font-bold text-zinc-100">Supabase não configurado</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Adicione as env vars no Vercel e faça Redeploy.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-left space-y-1 text-xs text-zinc-400 font-mono">
              <p>NEXT_PUBLIC_SUPABASE_URL</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-lg font-bold text-zinc-100">Erro inesperado</h1>
              <p className="text-sm text-zinc-400 mt-1">{error.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 h-11 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-800 transition-colors text-sm"
              >
                Tentar novamente
              </button>
              <Link
                href="/"
                className="flex-1 h-11 rounded-xl border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors text-sm flex items-center justify-center"
              >
                Início
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
