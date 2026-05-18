import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateFirstProject } from "@/components/create-first-project";
import { ThemeToggle } from "@/components/theme-toggle";
import { CountdownBanner } from "@/components/countdown-banner";
import { PlusCircle, BarChart2, ClipboardList, LayoutGrid } from "lucide-react";
import Link from "next/link";

function getDaysRemaining(endDateStr: string | null): number | null {
  if (!endDateStr) return null;
  const end = new Date(endDateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

type HubCardProps = {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
};

function HubCard({ href, icon: Icon, label, description }: HubCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-start gap-3 rounded-2xl
                 bg-white dark:bg-zinc-800
                 border border-stone-200 dark:border-zinc-700
                 p-4 active:bg-stone-50 dark:active:bg-zinc-700
                 transition-colors"
    >
      <Icon className="h-5 w-5 text-orange-700 dark:text-orange-500" />
      <div>
        <p className="text-sm font-semibold text-stone-800 dark:text-zinc-200 leading-snug">{label}</p>
        <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const userName = user.user_metadata?.full_name?.split(" ")[0] ?? "Usuário";

  if (!project) {
    return <CreateFirstProject userId={user.id} />;
  }

  const daysLeft = getDaysRemaining(project.end_date);

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-stone-500 dark:text-zinc-500 uppercase tracking-wide font-medium">
            Painel de Controle
          </p>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mt-0.5">
            Olá, {userName}!
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500 mt-0.5">
            O que vamos fazer hoje?
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Project name */}
      <p className="text-xs text-stone-400 dark:text-zinc-500 truncate -mt-2">
        {project.name}
      </p>

      {/* Countdown */}
      {daysLeft !== null && <CountdownBanner days={daysLeft} />}

      {/* Primary CTA */}
      <Link
        href="/novo"
        className="flex items-center justify-center gap-3 w-full rounded-2xl
                   bg-terracota hover:bg-terracota-dark active:bg-terracota-dark
                   text-white py-5 text-lg font-bold
                   shadow-lg shadow-terracota/25
                   transition-colors"
      >
        <PlusCircle className="h-6 w-6" />
        Lançar Nova Despesa
      </Link>

      {/* Secondary grid */}
      <div className="grid grid-cols-2 gap-3">
        <HubCard
          href="/dashboard"
          icon={BarChart2}
          label="Resumo Financeiro"
          description="KPIs e últimas despesas"
        />
        <HubCard
          href="/despesas"
          icon={ClipboardList}
          label="Histórico de Gastos"
          description="Todas as despesas"
        />
        <HubCard
          href="/comodos"
          icon={LayoutGrid}
          label="Gerenciar Cômodos"
          description="Ambientes da obra"
        />
        <HubCard
          href="/graficos"
          icon={BarChart2}
          label="Gráficos"
          description="Análise visual"
        />
      </div>
    </div>
  );
}
