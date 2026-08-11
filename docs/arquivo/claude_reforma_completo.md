# Instruções para o Projeto ReForma

## O que é o ReForma

App para **acompanhar reformas e obras do começo ao fim**. Tipo um gerenciador completo de obra!

**Funcionalidades principais:**

- Registra **etapas e eventos** da obra
- Controla **quanto você gastou e quanto falta gastar**
- Parcelamentos de pagamentos (dividir em quantas parcelas quiser)
- Guarda **comprovantes em PDF** que você faz upload (no Supabase Storage)
- **Dashboard** mostra o progresso geral e quanto investiu
- Acompanha **agenda da obra, documentos, fotos**

**Fase atual:** Dany tá usando pra organizar suas próprias obras, mas quer expandir pra **vender depois**!

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Radix UI + shadcn
- **Backend/Banco**: Supabase (Postgres + Auth + Storage) — aqui guarda os PDFs
- **Testes**: Playwright (E2E) — testa se tudo funciona mesmo
- **Deploy**: Vercel (em produção agora)
- **Gráficos**: Recharts (mostra visualmente os dados)

## Onde a gente tá agora

- 🔧 Corrigindo bugs
- ✅ Escrevendo testes (pra garantir que funciona)
- 🎨 Melhorando visual e deixar fácil de usar
- 📋 Ajustes finais pra colocar no ar

## O que Dany mais faz aqui

- **Tudo junto**: corrige erro + escreve teste + ajusta layout
- Tem commits regulares (ela acompanha pelo git)
- Foco em **deixar pronto e bem testado** pra depois vender

## Como ajudar em cada situação

### Quando pede "Cria componente de X"

- Crio usando Radix + Tailwind (shadcn style)
- Deixo acessível (WCAG)
- Integro com Supabase se precisar de dados

### Quando pede "Arruma esse erro"

- Debugo olhando o erro
- Pergunto contexto se não entender
- Ofereço a solução mais simples primeiro

### Quando pede "Cria teste pra isso"

- Uso Playwright
- Testo o fluxo do usuário (não código internamente)
- Incluo casos de erro também

### Quando pede "Integra com banco"

- Uso as queries do Supabase
- Adiciono tratamento de erro
- Aviso se precisar de migração no banco

## Auditorias do ReForma

Quando Dany pede **"auditoria"**, ela quer que eu verifique TUDO:

- **Deploy e build**: está funcionando? Tem erros?
- **Código**: está bem estruturado? Tem duplicação? Tá limpo?
- **Segurança**: credenciais protegidas? Autenticação ok? (importante pra vender!)
- **Lógica**: bugs, inconsistências, fluxos errados?
- **Design e UX**: cores estranhas? Acessibilidade ok? Fácil de usar?
- **TypeScript**: tipagem correta? Tem any escondido?
- **Banco (Supabase)**: RLS configurado? Índices ok?
- **Testes (Playwright)**: cobrindo bem? Faltando testes?
- **Performance**: app rápido? Não tá lento?
- **Documentação**: tá fácil pra novo usuário entender?

E entrego um **relatório estruturado** com:

- Problema identificado
- Por que é problema
- Como consertar
- Prioridade (crítico, alto, moderado, baixo)
- Exemplos quando ajuda

**Importante:** como Dany quer vender isso depois, preciso ficar atento a:

- Código limpo (alguém vai dar manutenção)
- Funcionalidades estáveis (usuário não pode perder dados)
- Segurança (usuário confia com dados da obra dele)
- Interface fácil (novo usuário aprende rápido)

## Regras importantes aqui

- **Comprovantes em PDF** são guardados no Supabase Storage pra consulta depois
- **Sempre confirme** antes de mexer em autenticação ou banco de dados
- **Testes são importantes** — não deixa passar sem testar
- Código comentado (Dany vai entender depois)
- Sem gambiarra — solução que funciona e é limpa

## Tom de resposta

- Objetivo e claro
- Sem termos técnicos desnecessários
- Instruções prontas pra copiar e colar
- Indicar exatamente: arquivo, trecho, novo código, como testar
- Fazer perguntas quando precisar esclarecer
- Responder em tom amigável e simples

## Dúvidas? Pergunte!

Se não entender o contexto, melhor perguntar do que errar.
