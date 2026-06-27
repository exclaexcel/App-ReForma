"use client";

import { HardHat, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isMissingConfig =
    error.message?.includes("URL and API key") || error.message?.includes("SUPABASE");

  return (
    <html lang="pt-BR">
      <body className="bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 min-h-dvh flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-700/20 border border-orange-300/50 dark:border-orange-700/30">
              {isMissingConfig ? (
                <HardHat className="h-8 w-8 text-orange-600 dark:text-orange-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-500" />
              )}
            </div>
          </div>

          {isMissingConfig ? (
            <>
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                  Configuração necessária
                </h1>
                <p className="text-sm text-stone-600 dark:text-zinc-400 mt-2">
                  As variáveis do Supabase não estão configuradas no Vercel.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 text-left space-y-3">
                <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wide">
                  Como resolver
                </p>
                <ol className="text-sm text-stone-700 dark:text-zinc-300 space-y-2 list-decimal list-inside">
                  <li>Abra o painel do Vercel</li>
                  <li>Vá em Settings → Environment Variables</li>
                  <li>
                    Adicione{" "}
                    <code className="text-orange-600 dark:text-orange-400 text-xs bg-stone-100 dark:bg-zinc-900 px-1 rounded">
                      NEXT_PUBLIC_SUPABASE_URL
                    </code>{" "}
                    e{" "}
                    <code className="text-orange-600 dark:text-orange-400 text-xs bg-stone-100 dark:bg-zinc-900 px-1 rounded">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </code>
                  </li>
                  <li>Clique em Redeploy</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                  Algo deu errado
                </h1>
                <p className="text-sm text-stone-600 dark:text-zinc-400 mt-2">
                  {error.message || "Erro inesperado no servidor."}
                </p>
              </div>
              <button
                onClick={reset}
                className="w-full h-11 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-800 transition-colors"
              >
                Tentar novamente
              </button>
            </>
          )}
        </div>
      </body>
    </html>
  );
}
