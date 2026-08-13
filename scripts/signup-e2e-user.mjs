/**
 * Create E2E CI user via public signUp + confirm email in DB separately.
 * Usage: node scripts/signup-e2e-user.mjs
 * Does not print the password.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) throw new Error("Missing .env.local");
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

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
  process.exit(1);
}

const email = "e2e.reforma.ci@teste.com.br";
const password = `RfE2e!${randomBytes(12).toString("base64url")}`;

const supabase = createClient(url, anon, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.signUp({ email, password });
if (error) {
  console.error(JSON.stringify({ ok: false, step: "signup", message: error.message }));
  process.exit(1);
}

writeFileSync(
  resolve(process.cwd(), ".env.e2e.local"),
  `E2E_EMAIL=${email}\nE2E_PASSWORD=${password}\n`,
  { encoding: "utf8", mode: 0o600 }
);

console.log(
  JSON.stringify({
    ok: true,
    email,
    user_id: data.user?.id ?? null,
    needs_email_confirm: !data.session,
    wrote: ".env.e2e.local",
  })
);
