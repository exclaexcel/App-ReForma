# E2E Tests — Playwright

Suíte completa de testes end-to-end para o app ReForma, cobrindo autenticação, fluxos críticos e validações visuais.

## Arquitetura

- **Setup project**: `e2e/global.setup.ts` faz login único e salva `storageState` em `e2e/.auth/user.json`
- **Desktop project**: Chromium desktop, com `dependencies: ['setup']`
- **Mobile project**: iPhone 13, com `dependencies: ['setup']`
- **Auth spec**: roda **sem** storageState (contexto limpo) para testar login/logout

## Tags de testes

- `@smoke` — testes seguros contra produção (carregamento de rotas, navegação)
- `@critical` — testes que alteram dados (CRUD, NOT produção)
- `@full` — testes detalhados (filtros, validações complexas)

## Requisitos

- Node.js 18+
- App rodando em `http://localhost:3000` (ou variável `PLAYWRIGHT_BASE_URL`)
- Supabase project configurado com migrations

## Setup local

```bash
# 1. Copiar .env.example para .env.local
cp .env.example .env.local

# 2. Preencher variáveis:
E2E_EMAIL=seu-email-teste@exemplo.com
E2E_PASSWORD=sua-senha-teste
PLAYWRIGHT_BASE_URL=http://localhost:3000
# (opcional)
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico

# 3. Instalar dependências
npm install

# 4. Iniciar app em outro terminal
npm run dev
```

## Rodando testes

### Headless (CI mode)

```bash
npm run test:e2e
```

### UI interativa (modo visual)

```bash
npm run test:e2e:ui
```

### Debug (step-by-step)

```bash
npm run test:e2e:debug
```

### Headed (janela visível)

```bash
npm run test:e2e:headed
```

### Apenas smoke tests (seguro contra produção)

```bash
npx playwright test --grep "@smoke"
```

### Apenas testes críticos

```bash
npx playwright test --grep "@critical"
```

### Ver relatório HTML

```bash
npm run test:e2e:report
```

## Rodando contra diferentes ambientes

### Localhost

```bash
npm run test:e2e
```

### Preview/Produção (apenas @smoke)

```bash
PLAYWRIGHT_BASE_URL=https://appreforma.vercel.app npx playwright test --grep "@smoke"
```

### Com RUN_ID customizado (para rastreabilidade)

```bash
PLAYWRIGHT_RUN_ID=run-123 npm run test:e2e
```

## Estrutura dos arquivos

```
e2e/
├── global.setup.ts              # Login único, salva storageState
├── helpers/
│   ├── auth.ts                  # Helper de login/logout
│   ├── test-data.ts             # RUN_ID, prefix(), constantes
│   └── cleanup.ts               # Delete dados E2E via Supabase
├── fixtures/
│   ├── comprovante-teste.pdf    # PDF mínimo para teste
│   ├── nota-fiscal-teste.pdf    # PDF mínimo para teste
│   └── foto-evento-teste.jpg    # JPEG 1x1 para teste
├── auth.spec.ts                 # Login/logout (sem storageState)
├── smoke.spec.ts                # Carregamento de rotas (@smoke)
├── expenses.spec.ts             # CRUD de despesas (@critical)
├── documents.spec.ts            # Conciliação documental (@critical)
├── dashboard.spec.ts            # Dashboard, KPIs, alertas (@critical)
├── filters.spec.ts              # Buscas e filtros (@full)
└── f05-f04.spec.ts              # Parcelamento, agenda (@critical)

playwright.config.ts             # Configuração (setup, desktop, mobile)
.env.example                      # Variáveis de exemplo
```

## Cobertura de testes

### Auth (@critical)

✅ Login com credenciais válidas  
✅ Login com senha errada  
✅ Redirecionamento automático para home se logado  
✅ Logout retorna para /login

### Smoke (@smoke, @critical)

✅ Todas as rotas principais carregam (/, /despesas, /novo, /agenda, etc)  
✅ Sem tela branca  
✅ Sem erros críticos de renderização  
✅ Navegação funciona

### Despesas (@critical)

✅ Cadastrar despesa simples  
✅ Cadastrar por tipo (mão_obra sem NF, material com NF)  
✅ Upload de comprovante  
✅ Editar despesa  
✅ Badges documentais aparecem

### Conciliação (@critical)

✅ Despesa sem comprovante → badge pendência  
✅ Despesa com comprovante → badge OK  
✅ Alerta no dashboard quando há pendências

### Dashboard (@critical)

✅ Cards KPI aparecem  
✅ Números visíveis  
✅ Alerta documental funciona  
✅ Link "Ver todas" navega

### Filtros (@full)

✅ Busca por texto  
✅ Filtro por tipo  
✅ Filtro por categoria  
✅ Filtro avançado  
✅ Limpar filtros

### Parcelamento (@critical)

✅ Criar despesa 6x  
✅ Editar sincroniza todas as parcelas  
✅ Divisão correta de valores

### Agenda (@critical)

✅ Criar evento com fornecedor/cômodo/despesa  
✅ Anexar foto  
✅ Mudar status  
✅ Deletar evento

## CI/CD

Testes rodam automaticamente em:

1. **Pull Requests**: rodam `@smoke` contra Preview Deployment da Vercel
2. **Push para main**: rodam `@smoke` + `@critical` contra localhost (ou ambiente configurado)

Veja `.github/workflows/e2e-tests.yml` para detalhes.

## Dados de teste

- Todos os dados criados nos testes usam prefixo `E2E-${RUN_ID}-` (ex: `E2E-1719234567890-Despesa Material`)
- Facilita limpeza manual ou automática via `e2e/helpers/cleanup.ts`
- `SUPABASE_SERVICE_ROLE_KEY` é necessário para cleanup automático (opcional)

## Troubleshooting

### "connect ECONNREFUSED"

App não está rodando. Execute `npm run dev` em outro terminal.

### "Timeout waiting for redirect"

Login falhou. Verifique `E2E_EMAIL` e `E2E_PASSWORD` em `.env.local`.

### "Element not found"

O seletor mudou na UI. Verifique o arquivo `.spec.ts` correspondente e atualize o locator.

### Screenshots/traces não aparecem

Rodando em CI. Artefatos estão em `playwright-report/` e `test-results/`.

### Testes falhando contra produção

Rodando testes `@critical` contra produção, que altera dados. Use apenas `@smoke`.

## Limitações atuais

1. **Sem data-testid em massa** — seletores usam `id`, `role`, `placeholder`, texto visível
2. **Verificar remoção de foto** — impossível validar via Playwright (acesso ao Storage externo)
3. **Cleanup automático** — depende de `SUPABASE_SERVICE_ROLE_KEY`; se não disponível, cleanup é manual
4. **Mobile** — viewport testado, mas sem toque real (click() emula toque)

## Próximos testes recomendados

- [ ] Testes de parcelamento com cleanup
- [ ] Testes de agenda com foto e cleanup
- [ ] Testes de performance (Core Web Vitals)
- [ ] Testes de acessibilidade (a11y)
- [ ] Testes de responsividade (mais breakpoints)
- [ ] Testes de erro de rede (offline mode)

## Debugging

```bash
# Abrir debugger Playwright
npm run test:e2e:debug

# Abrir um spec em modo debug
npx playwright test e2e/auth.spec.ts --debug

# Gravar tudo (video + trace)
npx playwright test --record-video=on

# Ver traces (requer trace ativado)
npx playwright show-trace trace.zip
```

## Variáveis de ambiente

| Variável                    | Padrão                | Descrição                     |
| --------------------------- | --------------------- | ----------------------------- |
| `E2E_EMAIL`                 | test@example.com      | Email para login nos testes   |
| `E2E_PASSWORD`              | password              | Senha para login nos testes   |
| `PLAYWRIGHT_BASE_URL`       | http://localhost:3000 | URL base para rodar testes    |
| `PLAYWRIGHT_RUN_ID`         | timestamp             | ID único para dados E2E       |
| `SUPABASE_SERVICE_ROLE_KEY` | (não definido)        | Chave para cleanup automático |

## Referências

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Configuration](https://playwright.dev/docs/test-configuration)
