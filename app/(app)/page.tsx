import { createClient } from "@/lib/supabase/server";
import { getLatestProject } from "@/lib/queries/getProject";
import { CreateFirstProject } from "@/components/create-first-project";
import { CountdownBanner } from "@/components/countdown-banner";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlusCircle, BarChart2, Receipt, LayoutGrid, HardHat as HatIcon } from "lucide-react";
import Link from "next/link";

function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-stone-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-700/10 border border-orange-700/20 shadow-sm shadow-orange-900/10">
              <HatIcon className="h-8 w-8 text-orange-700 dark:text-orange-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            App Reforma
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400 leading-relaxed">
            Controle financeiro completo para a sua reforma. Acompanhe despesas, comprovantes e o prazo da obra, tudo num só lugar.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-800 active:scale-95 transition-all duration-200 shadow-sm shadow-orange-900/20"
          >
            Criar minha conta
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl border border-stone-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-semibold text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700 active:scale-95 transition-all duration-200 shadow-sm shadow-black/10"
          >
            Já tenho uma conta
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;

  const project = await getLatestProject(supabase, user.id);

  const userName = user.user_metadata?.full_name?.split(" ")[0] ?? "Usuário";

  if (!project) {
    return <CreateFirstProject userId={user.id} />;
  }

  const daysUntilEnd = project.end_date
    ? Math.ceil(
        (new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-stone-500 dark:text-zinc-500 uppercase tracking-wider">Obra em andamento</p>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">
            Olá, {userName}!
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400 mt-0.5">
            O que vamos fazer hoje?
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      {daysUntilEnd !== null && (
        <CountdownBanner days={daysUntilEnd} />
      )}

      <div className="space-y-2">
        <Link
          href="/novo"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-orange-700 hover:bg-orange-800 px-4 py-4 text-sm font-semibold text-white active:scale-95 transition-all duration-200 shadow-sm shadow-orange-900/20"
        >
          <PlusCircle className="h-5 w-5" />
          Lançar Nova Despesa
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-4 text-center hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <BarChart2 className="h-5 w-5 text-orange-700 dark:text-orange-500" />
          <span className="text-xs font-medium text-stone-900 dark:text-zinc-100">Resumo Financeiro</span>
        </Link>
        <Link
          href="/despesas"
          className="flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-4 text-center hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <Receipt className="h-5 w-5 text-orange-700 dark:text-orange-500" />
          <span className="text-xs font-medium text-stone-900 dark:text-zinc-100">Histórico</span>
        </Link>
        <Link
          href="/comodos"
          className="flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-4 text-center hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <LayoutGrid className="h-5 w-5 text-orange-700 dark:text-orange-500" />
          <span className="text-xs font-medium text-stone-900 dark:text-zinc-100">Cômodos</span>
        </Link>
      </div>
    </div>
  );
}
