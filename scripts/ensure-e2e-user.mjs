/**
 * Create or reset the CI E2E user (Admin API).
 * Reads .env.local — never prints keys or the password.
 *
 * Usage: node scripts/ensure-e2e-user.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const email = process.env.E2E_EMAIL || "e2e.reforma.ci@teste.com.br";
const password =
  process.env.E2E_PASSWORD ||
  `RfE2e!${randomBytes(12).toString("base64url")}`;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listed, error: listErr } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});
if (listErr) {
  console.error("listUsers failed", listErr.message);
  process.exit(1);
}

const existing = listed.users.find((u) => u.email === email);

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("updateUser failed", error.message);
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, action: "password_reset", email, user_id: existing.id }));
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("createUser failed", error.message);
    process.exit(1);
  }
  console.log(
    JSON.stringify({ ok: true, action: "created", email, user_id: data.user?.id })
  );
}

// Ensure a project exists for smoke routes
const { data: usersAgain } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
const user = usersAgain.users.find((u) => u.email === email);
if (!user) {
  console.error("user missing after create/reset");
  process.exit(1);
}

const { data: projects, error: projErr } = await admin
  .from("projects")
  .select("id")
  .eq("user_id", user.id)
  .limit(1);
if (projErr) {
  console.error("projects select failed", projErr.message);
  process.exit(1);
}

if (!projects?.length) {
  const { error: insErr } = await admin.from("projects").insert({
    user_id: user.id,
    name: "Obra E2E CI",
    total_budget: 10000,
  });
  if (insErr) {
    console.error("project insert failed", insErr.message);
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, project: "created" }));
} else {
  console.log(JSON.stringify({ ok: true, project: "exists" }));
}

// Write password only to a local ignored file for gh secret set
import { writeFileSync } from "node:fs";
writeFileSync(
  resolve(process.cwd(), ".env.e2e.local"),
  `E2E_EMAIL=${email}\nE2E_PASSWORD=${password}\n`,
  { encoding: "utf8", mode: 0o600 }
);
console.log(JSON.stringify({ ok: true, wrote: ".env.e2e.local (gitignored)" }));
