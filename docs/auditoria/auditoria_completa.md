Auditoria de Produto — ReForma v0.9
Análise feita com leitura direta do código, migrations, tipos, componentes e backlog. Sem elogio por educação.

1. O que está efetivamente publicado e funcionando
   Funcionalidade Status real
   Auth (signup, login, recuperação de senha) ✅ Funciona
   Onboarding do primeiro projeto ✅ Funciona
   Dashboard com 4 KPIs financeiros ✅ Funciona
   Cadastro, edição e listagem de despesas ✅ Funciona
   Filtros avançados + paginação ✅ Funciona
   Soft-delete (cancelar despesa) ✅ Funciona
   Upload de comprovantes e notas fiscais ✅ Funciona
   Pasta digital (galeria com URLs assinadas) ✅ Funciona (com problema crítico — ver abaixo)
   Badge "Sem comprovante" ✅ Funciona
   Alertas de conciliação documental no dashboard ✅ Funciona
   Cadastro de fornecedores ✅ Funciona
   Diário de obras (tarefas com status) ✅ Funciona
   Agenda (CRUD de eventos) ✅ Funciona (com ressalva)
   Gráficos (waterfall, bar, area) ✅ Funciona
   Cômodos ✅ Funciona
   Export CSV de despesas ✅ Funciona (parcial)
   RLS / isolamento de dados por usuário ✅ Funciona
   Dark mode ✅ Funciona
2. O que está parcialmente implementado
   Agenda — edição de eventos: ScheduleEventForm existe, mas o ponto de entrada para editar um evento já criado é de difícil acesso no fluxo real.

Export CSV: Faltam as colunas expense_type, invoice_number e invoice_value, adicionadas nas últimas migrations mas não incluídas no export.

Fornecedores — budget_url: Campo existe no banco e nos tipos. Não há UI para abrir o link do orçamento. O dado entra mas nunca sai.

Fornecedores — WhatsApp: Aceita qualquer string. Sem máscara, sem validação de formato.

Tarefas — reordenação: Campo sequence_order existe no banco. Nunca é populado, nunca é usado. Drag-to-reorder não foi implementado.

Tipos gerados (database.types.ts): Desatualizados. Não incluem a coluna status de expenses. schedule_events tem divergência entre os tipos gerados e os manuais (event_date vs start_date/end_date). Os clientes Supabase não usam o genérico Database, então type-safety real no momento da query é zero.

Dashboard: Falta o KPI mais óbvio — "Saldo disponível" (orçado menos comprometido). O usuário não sabe quanto ainda pode gastar sem fazer conta na cabeça.

Gráficos: Três gráficos genéricos sem drill-down por cômodo ou fornecedor. O gráfico de área mostra gasto semanal, que tem pouco valor gerencial numa obra.

3. O que ainda não existe
   Orçamento por categoria ou por cômodo (só há orçamento total da obra)
   Relatório de prestação de contas (PDF ou exportação formal)
   Notificações ou lembretes — a agenda não avisa nada
   Vinculação entre agenda e financeiro — ScheduleEvent não tem expense_id, category_id, nem room_id. São ilhas separadas
   Dashboard por cômodo — impossível ver quanto foi gasto por ambiente
   Fotos de progresso no diário de obras
   Compartilhamento de projeto com outro usuário
   PWA (sem manifest.json, sem service worker — não é instalável)
   000_initial_schema.sql — o repositório não consegue recriar o banco do zero
   Testes automatizados — zero
4. Proposta de valor real
   O ReForma é uma ferramenta de controle financeiro e documental para reformas residenciais pequenas. O valor está em três coisas concretas:

Centralizar comprovantes e notas num lugar acessível pelo celular (elimina a foto perdida no WhatsApp)
Dar visibilidade financeira imediata: orçado, comprometido, pago, a pagar
Alertar quando uma despesa paga não tem comprovante — isso é genuinamente útil e nenhuma planilha faz automaticamente
O problema que o app resolve é real. A proposta não é vazia.

5. O aplicativo resolve um problema de verdade?
   Sim, mas parcialmente.

Quem faz reforma perde controle de quanto gastou, perde comprovantes, não sabe quanto ainda pode gastar, e não consegue prestar contas ao final. Hoje as pessoas usam uma mistura de papel, WhatsApp e Excel.

O app endereça a parte financeira e documental. Mas o problema completo de uma obra inclui também coordenação com fornecedores, controle de progresso físico, e comunicação com o proprietário. Essas partes não estão cobertas de forma útil.

6. O aplicativo é útil para usuários reais?
   Sim, com uma ressalva importante.

Útil para: pessoa física gerenciando reforma do próprio apartamento, sem experiência em gestão de obras.

Não útil para: engenheiros, arquitetos, construtoras — que precisam de medições, contratos formais, e cronograma físico-financeiro.

A ressalva: o app depende de disciplina radical do usuário. Se ele não registrar a despesa no momento que acontece, o app perde valor imediatamente. Não há nenhum mecanismo — notificação, lembrete, fricção — que incentive o registro.

7. Cenários de uso reais
   Reforma de apartamento para venda — proprietário quer saber o custo total para calcular retorno
   Reforma de apartamento alugado — inquilino precisa comprovar gastos ao dono
   Reforma com financiamento bancário — banco exige comprovação de gastos com notas
   Reforma compartilhada por casal — dois adultos querem visibilidade do gasto (o app não suporta dois usuários no mesmo projeto)
   Pequeno empreiteiro querendo mostrar transparência ao cliente (o app não suporta compartilhamento)
8. Onde o app gera mais valor
9. Pasta digital de comprovantes — genuinamente útil. Centraliza tudo. Acesso rápido na hora de contestar uma cobrança ou comprovar um gasto para o banco.

10. Alertas de conciliação no dashboard — "você pagou mas não tem nota fiscal" é uma informação que nenhuma planilha entrega automaticamente. Esse é o diferencial real.

11. Visão financeira rápida — abrir o app e ver em 3 segundos o resumo da obra. Isso é bom e funciona.

12. Onde ainda parece um MVP
    Agenda desconectada do financeiro. Você agenda a entrega de um material mas o evento não tem relação com a despesa, o fornecedor, ou o cômodo. É um bloco de notas com data.

Diário de obras sem fotos. Registrar tarefas sem evidência visual é metade do valor. "Piso do banheiro concluído" sem foto é só texto.

Gráficos rasos. Três gráficos genéricos sem nenhum drill-down. Você não consegue responder: "quanto gastei no banheiro?" ou "qual fornecedor me custou mais?".

Fornecedores sem utilidade operacional. Você cadastra o fornecedor, mas não consegue abrir o orçamento (campo existe, UI não), nem o WhatsApp é validado para chamar.

Sem notificações. Uma agenda que não avisa é um calendário morto. O usuário vai esquecer da entrega de material e culpar o app.

Sem PWA. O app é mobile-first mas não é instalável. Em 2026 isso é atrito demais para uso diário numa obra.

10. Notas por dimensão
    Funcionalidade: 6/10
    O core (despesas, comprovantes, dashboard) funciona. As funcionalidades periféricas (agenda, fornecedores, gráficos) estão pela metade ou são ornamentais.

UX: 6.5/10
Design consistente, dark mode bem executado, mobile-first com atenção a safe area e dynamic viewport — isso é positivo. Negativo: bottom nav cobre só 5 destinos e deixa Comprovantes, Agenda, Gráficos e Cômodos escondidos. Sem loading.tsx em server pages, a transição é uma tela em branco. Sem confirmação antes de sair de formulário. Sem validação inline — todos os erros são form-level.

Mobile: 7/10
Captura de câmera, teclado numérico, touch feedback, safe-area inset — tudo certo. Perde pontos por não ser PWA instalável e por maximumScale: 1 que bloqueia zoom de acessibilidade (usuário com visão reduzida não consegue dar zoom).

Segurança: 6/10
RLS correto e cobre todas as tabelas. Auth com double-check no middleware e no layout. Mas: tipos desatualizados desativam type-safety no compilador, arquivos antigos não são deletados do Storage quando substituídos (acúmulo silencioso), signed URLs expiram em 1 hora (usuário que abre a pasta digital no dia seguinte vê erro 403), e "Ex: Reforma Ap Dany" como placeholder no código expõe um nome pessoal no bundle de produção.

Confiabilidade: 4/10
Zero testes automatizados. Schema não é reproduzível a partir do repositório (migrations iniciais são stubs vazios). database.types.ts diverge do banco real. error.digest === "864801373" em global-error.tsx é um número mágico que vai quebrar silenciosamente numa atualização do Next.js. As signed URLs de 1h vão frustrar usuários que tentam acessar documentos horas depois.

Documentação: 3/10
Existe um auditoria/backlog-pendencias.md com 33 itens abertos — isso é bom para quem desenvolveu. Não há README funcional, nenhuma documentação de arquitetura, nenhum guia para novo desenvolvedor entrar no projeto, e nenhum CLAUDE.md no repositório.

Produto Geral: 5.5/10
Existe uma ideia boa e um problema real. A execução do core está OK, não excelente. As funcionalidades periféricas estão pela metade. Não há loop de retenção, notificações, ou PWA. O produto não tem o que faça o usuário voltar todos os dias — ele volta só quando lembra de registrar uma despesa.

Veredicto Final
"Eu colocaria este aplicativo na mão de usuários reais? NÃO — ainda não."

Por quê não:

1. As signed URLs de 1 hora vão causar 403 na Pasta Digital. Todo usuário que fizer upload de um comprovante e tentar abrir no dia seguinte vai ver erro. Para um usuário leigo isso parece que o arquivo sumiu. Isso é um bug crítico de produção que vai gerar abandono imediato.

2. Sem PWA, a fricção de uso diário é alta demais. Numa obra você está sujo, com pressa, e com o celular numa das mãos. Abrir o browser, navegar até a URL, e fazer login toda vez não é realista para uso diário. Isso não é detalhe — é o que vai determinar se o app é usado ou abandonado depois de 3 dias.

3. A Agenda sem notificação não tem valor. O usuário vai agendar a entrega de material, o app vai guardar a informação, e no dia da entrega ninguém vai lembrar. O usuário vai dizer que o app "não funciona".

4. Os Fornecedores têm campos inacessíveis. budget_url sem UI, WhatsApp sem validação. Um usuário que tentar abrir o orçamento do fornecedor não vai conseguir. Esse é um bug perceptível na primeira semana de uso.

Quando colocaria: Após resolver esses 5 itens, na ordem:

Signed URLs de 7+ dias (ou armazenamento público com RLS de storage)
manifest.json + service worker básico (PWA instalável)
KPI "Saldo disponível" no dashboard
UI para budget_url do fornecedor
Corrigir export CSV com colunas novas
Isso é 1 sprint focado. Depois disso, sim — vale colocar na mão de 5 a 10 usuários reais para teste.

Análise da página de Despesas
O que existe hoje (de cima para baixo)

Linha 1: "Despesas" (h1) | [Download CSV] [Filtros ⚙]
Linha 2: [🔍 Buscar despesa...............] [↺ limpar]
Linha 3: [Todas] [Mão de Obra] [Materiais] [Acabamentos] [Móveis] →scroll
──────────────────────────────────────────────────
Lista de itens com paginação
──────────────────────────────────────────────────
Bottom nav: [🏠] [💰] [＋] [📋] [👷]

1. Quais CTAs ou elementos devem ser removidos?
   Remover do header: o ícone de Download CSV.

Ele está na linha mais nobre da tela — ao lado do título — e é uma ação usada raramente (talvez 1x por mês, no máximo). Ocupa espaço visual permanente para uma função episódica. Mova-o para dentro do modal de Filtros Avançados como ação secundária ("Exportar resultado atual").

Remover: o título h1 "Despesas" como linha independente.

O bottom nav já indica a página. O título consome uma linha inteira que poderia começar mostrando dados. Num app mobile onde cada pixel vertical conta, um h1 decorativo sem função de navegação é ruído.

Não remover: o RotateCcw (limpar filtros). Aparece só quando há filtro ativo — é preciso e não polui.

2. O filtro inteligente por categorias deve permanecer?
   Sim. É o elemento mais útil da barra de controles.

É o único acesso rápido a filtro de categoria sem abrir o modal. Ele está correto: pills coloridas com color_hex da categoria, scroll horizontal invisível, toggle ao clicar no mesmo item. A interação é imediata e não exige abrir nenhuma camada extra.

O que merece revisão: quando nenhuma categoria está selecionada, "Todas categorias" ocupa o mesmo espaço visual que uma categoria real, mas não transmite informação. Substituir por nenhuma pill selecionada (deselect implícito) seria mais limpo — mas é um detalhe menor.

3. O excesso de elementos reduz a clareza?
   Sim, mas o problema não é quantidade — é hierarquia.

A tela tem 3 linhas de controle antes do primeiro item de dado:

Linha 1: título + ações
Linha 2: busca
Linha 3: pills
Em mobile, o usuário já consumiu ~140px antes de ver qualquer despesa. O problema maior é que a linha 1 mistura identidade da página (título) com ação rara (CSV) e ação frequente (filtros) — três prioridades diferentes numa única linha sem distinção clara.

Dentro de cada item da lista, o ExpenseListItem mostra: ícone, descrição, categoria + fornecedor, valor, data, status de pagamento, badge de documentação. São 7 informações por item. É a densidade certa para uma lista de controle — não reduzir.

4. Quais informações são realmente importantes para o usuário?
   Numa obra, o usuário abre Despesas por três razões distintas:

a) Verificar se uma despesa existe → precisa de busca rápida por descrição

b) Ver quanto está a pagar → precisa de filtro is_paid = false e o total

c) Checar pendências documentais → precisa do filtro "sem comprovante" e o badge no item

As informações críticas em cada item são: descrição, valor, status pago/a pagar, badge documental. Categoria e fornecedor são secundários — úteis para contexto, mas não são o que o usuário procura primeiro.

A data é a informação mais subutilizada visualmente: está pequena, ao lado do status. Numa lista ordenada por data, ela deveria ter mais peso — especialmente para identificar despesas antigas sem comprovante.

5. Como transformar essa página
   Decisões:

Fundir título + busca numa única linha (busca como header principal)
Pills de categoria ficam logo abaixo da busca
Adicionar mini-sumário entre os pills e a lista
Mover CSV para o modal de Filtros Avançados
Badge no ícone de filtros quando há filtro ativo
Wireframe textual — nova versão

┌─────────────────────────────────────────┐
│ │
│ [🔍 Buscar despesa............] [⚙ 2] │ ← "2" = badge de filtros ativos
│ │
│ [Todas] [Mão de Obra ●] [Materiais]→ │ ← pills, scroll horizontal
│ │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ 14 despesas · R$ 22.400,00 │ ← mini-sumário do filtro atual
│ ⏱ 3 a pagar · R$ 4.800,00 │ ← linha de urgência
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ │
│ ◉ Piso do banheiro R$ 1.200 │
│ Acabamentos · 15/06 ✓ Pago │
│ [Docs OK] │
│ ───────────────────────────────────── │
│ ◉ Mão de obra gesseiro R$ 2.800 │
│ Mão de Obra · 18/06 ⏱ A Pagar │
│ [⚠ Sem comprovante] │
│ ───────────────────────────────────── │
│ ◉ Porcelanato sala R$ 4.100 │
│ Materiais · 20/06 ✓ Pago │
│ [Nota divergente] │
│ ───────────────────────────────────── │
│ │
│ Carregar mais (8 restantes) │
│ │
├─────────────────────────────────────────┤
│ 🏠 💰 ┌───┐ 📋 👷 │
│ │ + │ │ ← FAB já cobre "lançamento"
│ └───┘ │
└─────────────────────────────────────────┘
Modal de Filtros Avançados (sem mudança estrutural, adicionar no rodapé):

┌────────────────────────────┐
│ Filtros Avançados ✕ │
│ ───────────────────── │
│ Período: [De] [Até] │
│ Valor: [Min] [Máx] │
│ Tipo: [select] │
│ Status: □ Pagos □ A Pagar│
│ Docs: □ Sem comprovante │
│ ───────────────────── │
│ [Limpar] [Aplicar] │
│ ───────────────────── │
│ ↓ Exportar CSV filtrado │ ← nova posição do CSV
└────────────────────────────┘
Resumo das mudanças
O que Ação Por quê
Título h1 "Despesas" Remover Bottom nav já indica a tela; a busca vira o header principal
Ícone Download CSV do header Mover para o modal Ação rara não merece espaço permanente
Badge no ícone de filtros Adicionar Sinaliza filtro ativo sem precisar do RotateCcw separado
Mini-sumário (total + a pagar) Adicionar Análise rápida sem sair da tela — esse é o valor que os gráficos tentavam entregar
Pills de categoria Manter É o filtro mais rápido e não tem substituto na tela
RotateCcw Manter condicional Funciona, não polui
Lista e paginação Manter Correta como está
A mudança mais impactante é o mini-sumário: com ele, a página vira análise rápida sem nenhuma navegação adicional. Isso preenche o buraco deixado pela remoção dos gráficos.

Minha percepção é que o dashboard está visualmente bagunçado.

Objetivo:

Transformar o dashboard em um painel executivo.

Considere que o propósito principal do ReForma é:

- controlar gastos de reforma
- controlar comprovantes
- controlar notas fiscais
- acompanhar evolução da obra

Quero que você avalie:

1. Quais cards devem permanecer?
2. Quais cards devem ser removidos?
3. Quais informações são redundantes?
4. Quais métricas faltam?
5. Qual seria a ordem ideal das seções?
6. O que deveria aparecer logo na primeira dobra da tela?
7. Como reorganizar tudo para parecer um produto profissional?

Monte um layout completo em formato textual.

Exemplo:

[ KPI 1 ]
[ KPI 2 ]
[ KPI 3 ]

---

[ ALERTAS ]

---

[ EVOLUÇÃO FINANCEIRA ]

---

[ DOCUMENTAÇÃO ]

etc.

Importante:

O dashboard deve ajudar o usuário a tomar decisões em menos de 30 segundos.

Não quero mais informações.
Quero informações melhores.
Vou ler o código do dashboard e os componentes relacionados antes de qualquer opinião.

Read c:\Users\daany\.vscode\Projeto\Repos\app_reforma\app\(app)\dashboard\page.tsx
Read c:\Users\daany\.vscode\Projeto\Repos\app_reforma\components\kpi-card.tsx
Read c:\Users\daany\.vscode\Projeto\Repos\app_reforma\components\countdown-banner.tsx
Read c:\Users\daany\.vscode\Projeto\Repos\app_reforma\lib\utils.ts
Tenho tudo. Análise completa a seguir — sem eufemismos.

Diagnóstico do dashboard atual
O que existe hoje (ordem real na tela)

"Resumo Financeiro"
[Nome do projeto]

[CountdownBanner: "Faltam X dias"]

[Obra iniciada em DD/MM · X dias]

[Total Orçado] [Total Comprometido]
[Efetiv. Pago] [A Pagar (Agendado)]

[⚠ X despesas com doc. incompleta]
[⚠ X despesas pagas sem comprovante]
[⚠ X despesas com divergência de valor]

Últimas Despesas Ver todas
[item] [item] [item] [item] [item]

[Pasta Digital] [Editar Obra]
[Fornecedores] [Diário de Obras]

1. Quais cards devem permanecer?
   Manter: A Pagar — é o número que gera ação imediata. O usuário precisa saber o que ainda vai sair do bolso.

Manter com mudança: Total Comprometido — mas rebaixado de KPI principal para linha de contexto. Não é uma decisão, é uma referência.

Manter como novo card: Saldo Disponível (total_budget - totalCommitted) — esse é o número que o dashboard deveria gritar e hoje não mostra. É a resposta para a pergunta real: "ainda posso gastar mais?"

2. Quais cards devem ser removidos?
   Remover "Total Orçado" como KPI card. O orçamento é um valor de referência, não uma métrica de acompanhamento. Ele deve aparecer como subtexto de "Saldo Disponível" — "de R$ 86.000 orçados" — não como card de igual peso.

Remover "Efetivamente Pago" como KPI card. É uma métrica de histórico, não de decisão. O usuário não abre o dashboard para saber quanto já pagou — ele abre para saber o que falta e se está dentro do orçamento. "Efetivamente Pago" pode aparecer como linha secundária, não como card de mesmo peso visual que "A Pagar".

3. Quais informações são redundantes?
   CountdownBanner + linha de start_date são dois elementos de tempo separados. Dois banners para dizer a mesma coisa (tempo da obra) fragmenta a leitura. São um único contexto: a obra começou em X, termina em Y, faltam Z dias.

"Total Orçado" + "Total Comprometido" + "Efetivamente Pago" + "A Pagar" — quatro KPIs onde a relação matemática entre eles é Comprometido = Pago + A Pagar e Saldo = Orçado - Comprometido. Você está mostrando todas as variáveis de uma equação quando bastaria mostrar o resultado.

A grade de atalhos 2x2 no rodapé (Pasta Digital, Editar Obra, Fornecedores, Diário) duplica a navegação. Bottom nav já tem Fornecedores e Diário. "Editar Obra" é uma ação de configuração que não pertence ao dashboard. São links de navegação disfarçados de conteúdo.

4. Quais métricas faltam?
   Saldo Disponível — ausente. É a métrica mais importante do app. Todos os dados para calculá-la existem: total_budget - totalCommitted. Simplesmente não está sendo mostrada.

Percentual do orçamento consumido — ausente. (totalCommitted / total_budget) \* 100. Uma barra de progresso visual transmite isso em menos de 1 segundo. Nenhum número sozinho faz isso.

Total de pendências documentais como número único — hoje são 3 banners separados. Um usuário com 2 alertas vê dois banners de cores diferentes ocupando espaço equivalente a 6 linhas. Um número único consolidado ("5 itens precisam de atenção") com detalhamento abaixo é mais legível.

5. Qual é a ordem ideal das seções?
   A ordem deve seguir a sequência de decisão do usuário:

Contexto (nome + prazo) — onde estou e quando termina
Situação financeira (saldo + barra de progresso) — estou dentro do orçamento?
Urgência (alertas de documentação) — tem algo quebrado que precisa de ação agora?
Histórico recente (últimas 3 despesas) — o que aconteceu mais recentemente? 6. O que deveria aparecer na primeira dobra?
Em um celular médio (iPhone 14, ~844px de altura, ~80px de bottom nav, ~60px de status bar), a primeira dobra tem aproximadamente 700px de conteúdo visível.

Na primeira dobra deve caber exatamente:

Nome do projeto + prazo (1 linha, ~48px)
Hero: Saldo Disponível + barra de progresso (~120px)
Dois KPIs secundários: Comprometido + A Pagar (~88px)
Alertas, se existirem (~56px por alerta, máximo 2 visíveis)
O usuário deve responder as 3 perguntas críticas sem rolar a tela:

Ainda posso gastar? → Saldo
Quanto falta pagar? → A Pagar
Tem problema? → Alertas 7. Layout completo — painel executivo

┌─────────────────────────────────────────┐
│ │
│ Reforma Ap. Centro ⚙ │ ← nome + link para editar projeto
│ Iniciada 03/mar · Prazo 28/ago │ ← timeline em 1 linha (condicional)
│ ▓▓▓▓▓▓▓▓░░░░░░░ 63% · 45 dias │ ← barra de prazo (se tiver end_date)
│ │
├─────────────────────────────────────────┤
│ │
│ SALDO DISPONÍVEL │ ← label pequeno, uppercase
│ R$ 32.000,00 │ ← fonte grande (~2rem), destaque máximo
│ ████████████░░░░░░░░ 63% do orçamento │ ← barra de progresso financeiro
│ de R$ 86.000 orçados │ ← subtexto com orçamento total
│ │
├─────────────────────────────────────────┤
│ │
│ R$ 54.000,00 │ R$ 22.000,00 │ ← 2 colunas, fonte menor
│ Comprometido │ A Pagar │
│ │ ⏱ 4 despesas │ ← contagem de despesas a pagar
│ │
├─────────────────────────────────────────┤
│ │
│ ⚠ 5 itens precisam de atenção │ ← bloco único de alertas (se > 0)
│ · 2 pagos sem comprovante → │ ← link direto para filtro
│ · 2 com documentação incompleta → │
│ · 1 nota com divergência de valor → │
│ │
├─────────────────────────────────────────┤
│ │
│ Últimas despesas Ver + │
│ ───────────────────────────────────── │
│ Piso banheiro R$ 1.200 ✓ Pago │
│ Mão de obra R$ 2.800 ⏱ Apagar│
│ Porcelanato sala R$ 4.100 ✓ Pago │
│ │
├─────────────────────────────────────────┤
│ 🏠 💰 ┌───┐ 📋 👷 │
│ │ + │ │
│ └───┘ │
└─────────────────────────────────────────┘
Decisões de design explicadas
Saldo Disponível como hero. É a única métrica que responde a pergunta mais importante de quem gerencia uma obra: "ainda posso gastar mais?" Um número em fonte grande, acima de tudo, sem competição visual.

Barra de progresso financeiro. totalCommitted / total_budget. Vai de verde para âmbar para vermelho conforme se aproxima de 100%. Visual imediato, zero esforço cognitivo.

Comprometido e A Pagar em 2 colunas sem card. Não precisam de cards com bordas e sombras. São números de suporte, não de destaque. Uma linha com dois valores em colunas é suficiente e ocupa metade do espaço.

Alertas unificados com links diretos. Em vez de 3 banners coloridos separados, um único bloco com itens listados. Cada item é um link que leva direto à lista de despesas já filtrada (ex: /despesas?filtro=sem_comprovante). O usuário lê, toca, resolve.

Últimas 3 despesas, não 5. O dashboard não é uma lista — é um resumo. 3 itens dão contexto de "o que foi lançado recentemente" sem competir com a página de Despesas.

Grade de atalhos 2x2: removida. "Fornecedores" e "Diário" estão no bottom nav. "Editar Obra" é configuração, não dashboard. O único link que tinha valor real era "Pasta Digital" — e ele pode aparecer como um link simples dentro do bloco de alertas documentais, não como um grid autônomo.

"Editar Obra" movido para ícone ⚙ no header. Ação de configuração pertence ao header, não ao conteúdo.

O que muda no código
Elemento Ação
project.total_budget KPI card Remover card, manter como subtexto
totalCommitted KPI card Rebaixar para linha de 2 colunas sem card
totalPaid KPI card Remover — dado secundário
toPay KPI card Rebaixar para linha de 2 colunas sem card
saldoDisponivel Criar — total_budget - totalCommitted, hero da tela
Barra de progresso Criar — (totalCommitted / total_budget) \* 100
CountdownBanner + start_date Unificar em 1 linha de timeline
3 banners de alerta Unificar em 1 bloco com lista de itens
recentExpenses.slice(0, 5) Mudar para .slice(0, 3)
Grade de atalhos 2x2 Remover
Link ⚙ para /projeto/editar Adicionar no header
Todas as métricas existem nos dados já carregados. Não há nova query necessária. É pura reorganização de layout e adição de dois cálculos simples.
