import { redirect } from "next/navigation";

/** Hub canônico é `/`. Mantido por compatibilidade de URLs/bookmarks. */
export default function DashboardRedirectPage() {
  redirect("/");
}
