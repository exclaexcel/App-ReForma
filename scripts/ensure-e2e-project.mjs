/**
 * After signup: sign in and ensure the E2E user has a project.
 * Usage: node scripts/ensure-e2e-project.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(resolve(process.cwd(), ".env.local"));
loadEnv(resolve(process.cwd(), ".env.e2e.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

if (!url || !anon || !email || !password) {
  console.error("Missing env for E2E project bootstrap");
  process.exit(1);
}

const supabase = createClient(url, anon, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (authErr) {
  console.error(JSON.stringify({ ok: false, step: "login", message: authErr.message }));
  process.exit(1);
}

const uid = auth.user.id;
const { data: projects, error: pErr } = await supabase
  .from("projects")
  .select("id")
  .eq("user_id", uid)
  .limit(1);
if (pErr) {
  console.error(JSON.stringify({ ok: false, step: "select", message: pErr.message }));
  process.exit(1);
}

if (!projects?.length) {
  const { error: iErr } = await supabase.from("projects").insert({
    user_id: uid,
    name: "Obra E2E CI",
    total_budget: 10000,
  });
  if (iErr) {
    console.error(JSON.stringify({ ok: false, step: "insert", message: iErr.message }));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, project: "created", email }));
} else {
  console.log(JSON.stringify({ ok: true, project: "exists", email }));
}
