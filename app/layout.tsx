import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReForma — Gestão de Obra",
  description: "Controle financeiro rigoroso da sua reforma",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#C84B31",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("reforma-theme")?.value ?? "dark";
  const isDark = theme !== "light";

  return (
    <html lang="pt-BR" className={isDark ? "dark" : ""} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
