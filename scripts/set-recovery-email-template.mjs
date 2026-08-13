/**
 * One-shot admin: set recovery email template.
 * Usage: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/set-recovery-email-template.mjs
 * Never commit the token.
 */
const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF || "bhsvvpvfbszrcitjwxxl";

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const html = `<h2>Redefina sua senha</h2>
<p>Recebemos uma solicitação para redefinir sua senha. Abra o link abaixo e toque no botão na tela para escolher uma nova.</p>
<p><a href="{{ .SiteURL }}/recuperar-senha/confirmar?token_hash={{ .TokenHash }}&type=recovery">Redefinir senha</a></p>
<p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>`;

const body = {
  site_url: "https://appreforma.vercel.app",
  uri_allow_list:
    "https://appreforma.vercel.app/**,http://localhost:3000/**",
  mailer_subjects_recovery: "Redefina sua senha — ReForma",
  mailer_templates_recovery_content: html,
};

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }
);

const text = await res.text();
if (!res.ok) {
  console.error("PATCH failed", res.status, text.slice(0, 500));
  process.exit(1);
}

let json;
try {
  json = JSON.parse(text);
} catch {
  console.log("PATCH ok", res.status);
  process.exit(0);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      site_url: json.site_url,
      uri_allow_list: json.uri_allow_list,
      mailer_subjects_recovery: json.mailer_subjects_recovery,
      recovery_template_has_token_hash: String(
        json.mailer_templates_recovery_content || ""
      ).includes("token_hash"),
      recovery_template_has_confirmar: String(
        json.mailer_templates_recovery_content || ""
      ).includes("/recuperar-senha/confirmar"),
    },
    null,
    2
  )
);
