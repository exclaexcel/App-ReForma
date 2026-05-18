import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-900">
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
