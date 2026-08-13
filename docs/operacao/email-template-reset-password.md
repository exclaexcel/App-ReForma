# E-mail de redefinição — configuração do **projeto** (não do usuário)

**Quem:** só quem administra o ReForma (dona do projeto).  
**Quem não:** quem usa o app (login, despesas, etc.) — essa pessoa **nunca** entra no Supabase.

O e-mail sai do serviço de login do projeto. O texto do e-mail é igual à “URL do site”: ajuste **uma vez** na montagem do produto. Depois, o fluxo do usuário é só:

1. App → Esqueci minha senha
2. Abre o e-mail → toca o link
3. No app, toca **Continuar para nova senha**
4. Define a senha

## Onde (uma vez)

Authentication → Email Templates → **Reset password**  
Projeto: appreforma

**Assunto:** Redefina sua senha — ReForma

**Corpo:**

```html
<h2>Redefina sua senha</h2>
<p>
  Recebemos uma solicitação para redefinir sua senha. Abra o link abaixo e toque no botão na tela
  para escolher uma nova.
</p>
<p>
  <a href="{{ .SiteURL }}/recuperar-senha/confirmar?token_hash={{ .TokenHash }}&type=recovery"
    >Redefinir senha</a
  >
</p>
<p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
```

**URL do site** (mesmo painel, URL Configuration): `https://appreforma.vercel.app` — sem `**`.

## Por que o modelo muda

O link padrão do Supabase é consumido no primeiro “clique” (às vezes o próprio Gmail). Com `token_hash` + tela com botão, só o toque humano no app gasta o código.
