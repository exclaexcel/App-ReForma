# ReForma — Controle de Reforma

Aplicativo de gestão financeira e documental para reformas residenciais. Centraliza despesas, comprovantes e progresso da obra em um único lugar.

## Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Database**: Supabase (PostgreSQL + RLS)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth (email/password)
- **Deployment**: Vercel

## Requisitos

- Node.js 20+
- npm ou yarn

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

Obtenha essas valores em:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Settings → API → Copy `URL` e `anon public key`

## Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Abrir no navegador
# http://localhost:3000
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar build em produção
npm start

# Lint com ESLint
npm run lint

# Formatar código com Prettier
npm run format

# Gerar tipos TypeScript do Supabase
npm run types:gen
```

## Estrutura do Projeto

```
app_reforma/
├── app/              # Next.js App Router
│   ├── (app)/        # Protected routes (require auth)
│   ├── (auth)/       # Public auth routes
│   └── api/          # API routes
├── components/       # React components
│   └── ui/          # shadcn/ui primitives
├── lib/             # Utilities & config
│   ├── supabase/    # Supabase clients
│   ├── queries/     # Data fetching
│   └── types.ts     # Domain types
├── supabase/        # Database
│   └── migrations/  # SQL migrations
└── public/          # Static assets
```

## Autenticação

O app usa Supabase Auth com email/password:

1. Novo usuário: Signup em `/signup` (cria primeiro projeto automaticamente)
2. Login: Acesse `/login`
3. Recuperação: `/recuperar-senha`
4. Middleware protege todas as rotas (veja `middleware.ts`)

## Deploy em Vercel

O app está configurado para deploy automático em [Vercel](https://vercel.com):

1. Faça push para `main`
2. Vercel detecta automaticamente
3. Aguarde deployment (2-3 minutos)
4. Preview URL aparece na interface do Vercel

### Variáveis em Produção

No Vercel Dashboard:

1. Vá em Settings → Environment Variables
2. Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Desenvolvimento

### Convenções de Código

- TypeScript strict mode ativado
- Prettier para formatação (execute `npm run format`)
- ESLint com regras Next.js + acessibilidade
- Pre-commit hooks validam lint (husky + lint-staged)

### Contribuindo

1. Crie branch: `git checkout -b feature/sua-feature`
2. Commit com mensagens descritivas
3. Push e abra PR contra `main`
4. Aguarde review e aprovação

## Roadmap

Veja [SPRINT-ROADMAP.md](./SPRINT-ROADMAP.md) para features planejadas.

## Troubleshooting

**"Variáveis de ambiente não encontradas"**

- Verifique `.env.local` está na raiz
- Reinicie o servidor de desenvolvimento

**"Erro de conexão com Supabase"**

- Verifique URLs e chaves em `.env.local`
- Confirme projeto Supabase está ativo
- Teste conectividade: `curl https://[project].supabase.co`

**"RLS policy denied"**

- Dados privados por usuário via RLS
- Verifique autenticação está ativa
- Consulte [lib/supabase/server.ts](./lib/supabase/server.ts)

## License

Proprietary — ReForma
