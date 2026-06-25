# Quick Start — Desenvolvimento App ReForma

**Última atualização:** 2026-06-24  
**Versão:** v0.7 (Confiabilidade Crítica)

---

## 🚀 Setup Inicial

```bash
# 1. Clonar (se necessário)
git clone https://github.com/exclaexcel/App-ReForma.git
cd App-ReForma

# 2. Instalar dependências
npm install

# 3. Copiar .env (se não existe)
cp .env.example .env.local

# 4. Iniciar dev server
npm run dev
# → http://localhost:3001

# 5. Em outro terminal: build para validar
npm run build
```

---

## 📍 Navegação Rápida

### Arquivos Mais Usados

```
app/(app)/
├── page.tsx              → Hub rápido (home logada)
├── dashboard/page.tsx    → KPIs financeiros
├── despesas/page.tsx     → Listagem + filtros (MAIN)
├── comprovantes/page.tsx → Galeria de recibos
├── diario-obras/page.tsx → Checklist de tarefas
├── fornecedores/page.tsx → CRM de fornecedores
├── comodos/page.tsx      → Gerenciador de cômodos
└── agenda/page.tsx       → Cronograma da obra

components/
├── confirm-dialog.tsx    → Dialog de confirmação (novo)
├── expense-form.tsx      → Formulário de despesa (CORE)
├── expense-list-item.tsx → Item da listagem (badge aqui)
├── bottom-nav.tsx        → Navegação inferior
└── advanced-filters-modal.tsx → Filtros avançados

lib/
├── types.ts              → Tipos TypeScript
├── utils.ts              → Funções utilitárias (getDocStatus)
└── supabase/
    ├── client.ts         → Cliente Supabase (browser)
    └── server.ts         → Cliente Supabase (SSR)

middleware.ts            → Guarda de rotas (auth)
```

### Documentação Essencial

```
📁 auditoria/
├── AUDITORIA1.MD        → Auditoria técnica completa (2026-06-22)
├── backlog-pendencias.md → 33 itens de backlog técnico
├── backlog-ux.md        → 19 problemas de UX
├── sprint-v0.8-controle-documental.md → Plano detalhado v0.8
└── implementacao-v0.8-snippets.md     → Snippets de código prontos

SPRINT-ROADMAP.md      → Visão executiva (LEIA PRIMEIRO)
DEV-QUICK-START.md     → Este arquivo
```

---

## 🔄 Fluxo Típico de Desenvolvimento

### 1. Começar feature nova
```bash
git checkout -b feat/nome-descritivo
npm run dev  # dev server sempre rodando
```

### 2. Editar código
- Use VSCode — IntelliSense funciona
- TypeScript catch erros em real-time
- Salvar → página recarrega automaticamente

### 3. Validar antes de commitar
```bash
npm run build  # TypeScript strict + Next.js
# Sem erros? Pronto para commit
```

### 4. Commit & Push
```bash
git add -A
git commit -m "feat: descrição curta da feature"
git push origin feat/nome-descritivo
```

### 5. Criar PR
```bash
gh pr create --title "descrição" --body "detalhe"
# Vercel faz deploy automático (preview URL nos comentários da PR)
```

---

## 🛠️ Comandos Comuns

```bash
# Dev
npm run dev              # Iniciar dev server (porta 3001)
npm run build           # Build para produção (valida tipos)

# Tipo checking
npx tsc --noEmit        # Validar TypeScript sem gerar JS

# Git
git status              # Ver mudanças
git diff               # Ver diff detailed
git log --oneline -5   # Ver commits recentes

# Database (Supabase)
# → Usar Supabase Dashboard ou CLI (se instalado)
supabase db pull      # Baixar schema do banco

# Deploy (automático ao fazer push a main)
# → Vercel faz deploy automaticamente
# → Monitorar em https://vercel.com/exclaexcel/appreforma
```

---

## 🐛 Debugging

### Dev Server não funciona?
```bash
# 1. Matar processos Node antigos
pkill -f "node"

# 2. Limpar cache
rm -rf .next
npm run dev
```

### TypeScript errors?
```bash
# Validar tipos
npx tsc --noEmit

# Se estranho, limpar node_modules
rm -rf node_modules package-lock.json
npm install
```

### Supabase disconnected?
```bash
# Verificar variáveis de ambiente
cat .env.local | grep SUPABASE

# Se vazio, copiar de .env.example
```

---

## 📚 Entender Features Implementadas

### v0.7 (Confiabilidade)
- **Middleware seguro:** vê `middleware.ts` linha 34-43 (flag `authError`)
- **Logging:** vê `lib/supabase/server.ts` linha 18-25 (`catch` com throw)
- **Erro visual:** vê `app/(app)/despesas/page.tsx` linha ~224 (estado `error`)

### v0.6 (UX)
- **Confirmação:** `components/confirm-dialog.tsx` (reutilizável)
- **Toasts:** procure `toast.loading()` em `expense-form.tsx`
- **Empty states:** veja `app/(app)/despesas/page.tsx` linha ~223 (com Link)

### v0.5 (Documentação)
- **Badge status:** `components/expense-list-item.tsx` mostra status
- **Filtros:** `components/advanced-filters-modal.tsx` + `app/(app)/despesas/page.tsx`

---

## 🎯 Sprint v0.8 (Próximo)

**Ler antes de começar:**
1. `SPRINT-ROADMAP.md` (5min overview)
2. `auditoria/sprint-v0.8-controle-documental.md` (20min detalhe)
3. `auditoria/implementacao-v0.8-snippets.md` (referência enquanto codifica)

**Features:**
- #5  Paginação (2-3h)
- #9  start_date (30min)
- #11 Soft-delete (2h)
- #18 Badge (45min)
- #19 Filtro (1-1.5h)
- #21-#23 Analytics (2h)

---

## 🔗 Links Úteis

```
🌐 Produção:        https://appreforma.vercel.app
🔧 GitHub:          https://github.com/exclaexcel/App-ReForma
📊 Vercel:          https://vercel.com/exclaexcel/appreforma
🗄️  Supabase:       https://app.supabase.com (project: bhsvvpvfbszrcitjwxxl)
📞 Documentação:    → ./auditoria/ (todos os documentos aqui)
```

---

## ✅ Checklist Pré-Commit

Antes de fazer commit:

- [ ] `npm run build` passa sem erros
- [ ] `npx tsc --noEmit` passa sem errors
- [ ] Testei a feature em dev (http://localhost:3001)
- [ ] Commit message descreve o "por quê", não o "o quê"
- [ ] Arquivo `.env.local` não foi commitado
- [ ] Sem `console.log` de debug deixado

---

## 🆘 Precisa de Ajuda?

1. **Entender arquitetura?** → Ler `AUDITORIA1.MD` (seção "Tech Stack")
2. **Implementar feature?** → Ler `implementacao-v0.8-snippets.md` (codigo pronto)
3. **Bug desconhecido?** → Ler `backlog-pendencias.md` (talvez já documentado)
4. **Sobre UX?** → Ler `backlog-ux.md` (problemas conhecidos)

---

**Última revisão:** 2026-06-24  
**Criado por:** Claude Haiku 4.5
