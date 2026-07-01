# E2E Tests — F-05 & F-04

Testes end-to-end usando Playwright para validar os fluxos de parcelamento e agenda com vínculos financeiros.

## Requisitos

- Node.js 18+
- App rodando em `http://localhost:3000`
- Supabase project configurado (migrations aplicadas)

## Instalação

```bash
npm install
```

## Rodando os testes

### Modo normal (headless)

```bash
npm run test:e2e
```

### Modo UI (visual)

```bash
npm run test:e2e:ui
```

### Modo debug (interativo)

```bash
npm run test:e2e:debug
```

## Cobertura de testes

### F-05: Parcelamento de Despesas

✅ **criar despesa parcelada (6x)**

- Preenche formulário com 6 parcelas
- Valida preview "6x de R$ 100"
- Verifica sucesso

✅ **editar despesa parcelada sincroniza todas as parcelas**

- Cria despesa com 3 parcelas
- Edita a primeira parcela
- Valida que TODAS as 3 parcelas são atualizadas na lista

✅ **validar parcelas geradas com divisão correta**

- Cria R$ 100 em 3x
- Valida preview "3x de R$ 33,33 + última R$ 33,34"
- Verifica que 3 linhas aparecem na lista

### F-04: Agenda com Vínculos Financeiros

✅ **criar evento com fornecedor/cômodo/despesa**

- Preenche título
- Seleciona fornecedor
- Seleciona cômodo
- Valida sucesso

✅ **anexar foto no evento**

- Verifica que botão "Adicionar foto" existe e é clicável

✅ **deletar evento e validar que foto é removida**

- Encontra evento na lista
- Clica em deletar
- Confirma exclusão
- Valida sucesso

✅ **status badge muda de cor ao alterar**

- Edita evento existente
- Altera status (Pendente → Confirmado)
- Valida cor alterada

### Dashboard

✅ **abrir dashboard sem erro**

- Carrega page inicial
- Valida ausência de erros
- Verifica elementos principais

✅ **dashboard carrega dados corretamente com parcelas**

- Valida que despesas aparecem
- Verifica console sem erros

## Estrutura

```
e2e/
├── README.md (este arquivo)
└── f05-f04.spec.ts (testes)

playwright.config.ts (configuração)
```

## Troubleshooting

### "connect ECONNREFUSED"

App não está rodando em `http://localhost:3000`. Execute `npm run dev` em outro terminal.

### Testes falhando de autenticação

Verifique se você está logado no app. Se necessário, adicione fixture de login em `f05-f04.spec.ts`.

### Screenshots/traces falhando

Rodando testes em modo UI (`npm run test:e2e:ui`). Use debugger para step-by-step.

## CI/CD

Testes rodam automaticamente no GitHub Actions em cada push.

```yaml
# .github/workflows/e2e-tests.yml
- run: npm run test:e2e
```

## Notas

- Testes usam `baseURL: "http://localhost:3000"`
- Screenshots salvas em `test-results/` se falharem
- HTML report gerado em `playwright-report/`
- Banco de dados precisa ser reset entre suites para garantir isolamento
