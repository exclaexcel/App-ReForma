Super Prompt de Execução para o Cursor 
Abra o  (Ctrl+I ou Cmd+I) no Cursor e cole o comando estruturado abaixo para criar o módulo de previsão e calendário.  

Atue como um Desenvolvedor Full Stack Sênior. Vamos implementar o novo módulo de Agenda e Previsão Semanal (Cronograma da Obra) integrado à nossa stack Next.js 14 (App Router), TypeScript e Tailwind CSS.  
Requisitos do que fazer:
1. Nova Rota de Agenda (app/(app)/agenda/page.tsx):
Crie uma página dedicada que busque os eventos da tabela schedule_events do Supabase.
Garanta que a barra inferior de abas (Bottom Nav) continue perfeitamente visível e funcional nesta nova tela.  
2. Visão de Previsão por Semanas (UI):
Desenhe uma interface dividida em seções cronológicas claras: "Esta Semana", "Próxima Semana" e "Nas Próximas 3 Semanas".
Exiba cada evento como um card minimalista e elegante utilizando ícones da biblioteca lucide-react com base no tipo:
Truck para Entrega de Materiais.
Hammer ou HardHat para Prestação de Serviços/Mão de Obra.
DollarSign para Previsão de Pagamentos.
CalendarDays para Visitas Técnicas ou Medições.  
3. Formulário de Novo Evento:
Crie um modal ou formulário simples para agendar novos eventos com os campos: Título, Tipo de Evento, Data e Observações.
4. Estilização "Reforma Chique":
O design deve ser perfeitamente adaptável ao Light e Dark Mode utilizando nossa paleta estruturada.
No Modo Claro, utilize o fundo bege/off-white elegante (bg-stone-50) com cards destacados em branco puro (bg-white).
No Modo Escuro, utilize estritamente o cinza quente suave (bg-zinc-900) para o fundo e bg-zinc-800 para os cards, sendo terminantemente proibido o uso de preto absoluto.
Destaques de ação e botões principais devem utilizar obrigatoriamente a nossa cor Terracota (orange-700) , e elementos de apoio secundários em tons de Chocolate/Marrom (amber-900).  


Atue como um Desenvolvedor Full Stack Sênior. Precisamos evoluir a arquitetura do nosso banco de dados no Supabase para suportar novas funcionalidades estratégicas de gestão de obras. Por favor, gere o código SQL para atualizar as nossas tabelas existentes e criar a nova estrutura. Siga exatamente os requisitos abaixo:   

Atualização da tabela projects:
▪ Adicione as colunas start_date (DATE) e end_date (DATE) para permitir o cálculo de contagem regressiva da obra.   
Nova tabela rooms (Cômodos):
▪ Crie a tabela rooms com os campos: id (UUID), project_id (relacionado à tabela projects), e name (TEXT - ex: Cozinha, Suíte).   
Atualização da tabela expenses:
▪ Adicione a coluna room_id (UUID, referenciando a tabela rooms). ▪ Adicione a coluna phase (TEXT) que deve aceitar a categorização entre "Estrutura" ou "Mobiliário & Decor". Apresente o script SQL pronto para ser executado no SQL Editor do Supabase, com os comandos ALTER TABLE e CREATE TABLE necessários.   
(Lembrete de Arquiteta: Pegue o código gerado por este prompt e rode manualmente no SQL Editor dentro do site do Supabase ).  


Atue como um Desenvolvedor Full Stack Sênior. Notei que não temos uma página de "Boas-vindas" (Landing Page) antes do usuário fazer login. 
Atualmente, o painel principal fica em app/(app)/page.tsx. Precisamos criar a página de entrada principal na raiz do projeto. 
Por favor, crie/atualize o arquivo app/page.tsx com uma Landing Page moderna e elegante seguindo as regras abaixo:  

Estrutura e Estética "Reforma Chique":
▪ O design deve seguir nossa identidade visual chique minimalista. ▪ Use um fundo elegante (suportando light e dark mode com nossa paleta zinc). ▪ Adicione um ícone grande e acolhedor da biblioteca lucide-react no topo (como o HardHat ou Hammer).   

Conteúdo (Copywriting):
▪ Título Principal: "O controle absoluto da sua obra na palma da sua mão". ▪ Subtítulo: "Abandone as planilhas. Registre despesas na hora, acompanhe seu orçamento e não tenha surpresas no final da reforma."   

Botões de Ação (CTAs):
▪ Crie dois botões grandes e arredondados. ▪ Botão 1 (Destaque principal): "Criar minha conta" - usando nossa cor de destaque Terracota (orange-700 ou similar), direcionando para a rota de cadastro. ▪ Botão 2 (Secundário): "Já tenho uma conta" - com estilo outline (fundo transparente e borda), direcionando para a rota de login. Certifique-se de que a página seja perfeitamente responsiva e focada no mobile (mobile-first).   


Prompt A: Botões de Acesso (Login/Logoff)

Atue como um Desenvolvedor Full Stack Sênior. Notei que precisamos adicionar e refinar os botões de controle de acesso (Login e Logoff) para completar o fluxo do usuário no nosso aplicativo, mantendo o padrão visual e a arquitetura com o Supabase Auth. 
O que fazer:  
Botão de Sair (Logoff) no Painel de Controle:
▪ Na tela logada (nosso Hub Rápido em app/(app)/page.tsx), vá até o Header/Cabeçalho (onde está a saudação "Olá, [Nome]" e o botão de tema Light/Dark). ▪ Adicione um botão de "Sair" (Logoff) de forma discreta, mas acessível (ex: no canto superior direito). 
Use o ícone LogOut da lucide-react.
▪ Estilize-o como um botão ghost (sem fundo preenchido) para não brigar com as ações principais, apenas o ícone ou texto com as nossas cores de texto (text-zinc-500 / text-zinc-400). ▪ Configure a ação para chamar o método signOut() do Supabase e redirecionar o usuário para a página de Boas-Vindas (/).   
Botões de Login/Cadastro na Landing Page:
▪ Confirme se a página não-logada (app/page.tsx, nossa tela de Boas-Vindas) possui os dois botões grandes de ação (CTAs) que direcionam o usuário para se autenticar. ▪ Botão Principal: "Criar minha conta" (Fundo Terracota bg-orange-700, texto branco, direcionando para /signup ou aba de cadastro). ▪ Botão Secundário: "Já tenho uma conta" (Estilo outline elegante com texto em marrom/chocolate, direcionando para /login ou aba de login). Garanta que as rotas de autenticação (as páginas reais de login/signup) estejam funcionando integradas ao cliente do Supabase e que redirecionem de volta para o Painel de Controle (/) em caso de sucesso.   

Prompt B: Fluxo de Recuperação de Senha

Atue como um Desenvolvedor Full Stack Sênior. Vamos implementar o fluxo completo de "Recuperação de Senha" (Forgot Password) utilizando o Supabase Auth. 
O que fazer:  
Atualizar a Tela de Login:
▪ Na tela de login atual (ex: app/(auth)/login/page.tsx), adicione um link discreto e elegante escrito "Esqueci minha senha". ▪ A cor desse link pode usar nossa paleta secundária text-zinc-500 com hover no tom de Terracota orange-700. ▪ Esse link deve direcionar para a nova rota /recuperar-senha.   
Nova Tela: Solicitar Recuperação (app/(auth)/recuperar-senha/page.tsx):
▪ Crie uma página com um formulário simples contendo o campo de "E-mail" e um botão "Enviar link de recuperação". ▪ O botão de ação principal deve ter o fundo Terracota (bg-orange-700). ▪ Integre com a função do Supabase client para enviar o email de reset (supabase.auth.resetPasswordForEmail). ▪ Adicione uma rota de retorno redirecionando (redirectTo) para a futura página de atualizar senha. ▪ Inclua mensagens visuais de sucesso ou erro e um botão "Voltar para o login".   
Nova Tela: Atualizar Senha (app/(auth)/atualizar-senha/page.tsx):
▪ Crie a página que o usuário acessará ao clicar no link recebido por e-mail. ▪ O formulário deve ter os campos "Nova Senha" e "Confirmar Nova Senha", e o botão "Salvar Nova Senha". ▪ Integre com a função de atualização de usuário do Supabase (supabase.auth.updateUser({ password: newPassword })). ▪ Após o sucesso, redirecione o usuário de volta para o Painel de Controle (/). Estilo: Mantenha a estética "Reforma Chique" com fundos elegantes (suportando light e dark mode via stone-50 e zinc-900).   
(Lembrete de Arquiteta: Não esqueça de ir em URL Configuration no Supabase e colocar o link oficial da Vercel para o e-mail de reset não quebrar ).  


Atue como um Desenvolvedor Full Stack Sênior. Vamos implementar um "Hub Rápido" (Tela de Acesso Intermediária) pós-login para melhorar a Experiência do Usuário (UX). Objetivo: O usuário não deve cair direto no Dashboard cheio de gráficos após logar. Ele deve cair em uma tela limpa e amigável que dê bom dia e ofereça botões de ação rápidos. 
Diretrizes para o Hub Rápido:  

Roteamento Inteligente:
▪ Transforme a rota principal logada (atual Dashboard em app/(app)/page.tsx) neste novo Hub Rápido. ▪ Mova o código do Dashboard atual (os KPI cards e gráficos) para uma nova rota separada, como app/(app)/dashboard/page.tsx (ou resumo).   
Estrutura Visual da Tela:
▪ Mensagem de Boas-vindas: Exiba uma saudação calorosa buscando o nome do usuário logado (ex: "Olá, Dany! O que vamos fazer hoje na obra?"). ▪ Grid de Botões Gigantes: Crie botões bem grandes, amigáveis para toque no celular (touch-friendly), organizados em um grid responsivo.   
Os Botões de Ação:
▪ Botão 1 (Destaque Máximo): "Lançar Nova Despesa". Este deve ser o maior e mais chamativo. 
Fundo na cor Terracota (orange-700 ou similar), com um ícone grande de PlusCircle. Direciona para a rota de nova despesa. ▪ Botões Secundários: Devem usar um estilo elegante de card (bg-white no modo claro, bg-zinc-800 no escuro) com detalhes em marrom/chocolate. ▫ "Resumo Financeiro" (Ícone LayoutDashboard, direcionando para a nova rota do dashboard). ▫ "Histórico de Gastos" (Ícone ReceiptText, direcionando para a lista de despesas). ▫ "Gerenciar Cômodos" (Ícone DoorOpen ou LayoutGrid, direcionando para /comodos). Certifique-se de que a barra de abas inferior (Bottom Nav) continue visível e funcionando perfeitamente em todas essas rotas, mantendo a navegação global fluida.   

Atue como um Desenvolvedor Full Stack Sênior. O nosso banco de dados já está recebendo start_date e end_date e o frontend já está funcional. 
Agora precisamos implementar três melhorias visuais e estratégicas.
Por favor, atualize os seguintes itens:  
Modo Claro (Light Mode) "Reforma Chique":
▪ O projeto já utiliza Tailwind e shadcn/ui. Garanta que o botão de alternar tema (Light/Dark) esteja visível e funcional no header ou na barra inferior. ▪ Ajuste as variáveis de cor para o Light Mode: o fundo não deve ser branco puro, mas sim um tom de bege/off-white elegante (ex: bg-stone-50 ou bg-orange-50). 
Os cards devem se destacar suavemente (ex: bg-white).
▪ Mantenha os acentos em Terracota (orange-700 ou similar) e detalhes em Chocolate, garantindo um alto contraste e acessibilidade.   

Contagem Regressiva da Obra:
▪ Na página inicial/Dashboard (app/(app)/page.tsx), crie um novo componente visual (um banner elegante ou card em destaque no topo) que leia as propriedades start_date e end_date do projeto atual. ▪ Calcule a diferença de dias a partir de hoje (new Date()). ▪ Exiba uma mensagem amigável, como "Faltam X dias para a conclusão da obra" ou "Obra em andamento: Dia X de Y", com um ícone de calendário ou relógio da biblioteca lucide-react. ▪ Trate o estado caso a data de início/fim ainda não tenha sido preenchida.   

Refinamento da Página de Inicialização (Home):
▪ Melhore o layout da Home: a contagem regressiva deve ser a primeira coisa visível logo abaixo do Header/Nome do Usuário. ▪ Caso o usuário ainda não tenha nenhuma despesa cadastrada, exiba um "Empty State" (Estado Vazio) acolhedor no lugar da lista de "Últimas Despesas", convidando-o a clicar no botão central "+" para fazer o primeiro lançamento. Por favor, faça as edições nos arquivos necessários (como page.tsx, tailwind.config.ts ou globals.css, e componentes relacionados).   

Prompt A: Upload e Arquivo Digital Base

Atue como um Desenvolvedor Full Stack Sênior. Precisamos expandir o aplicativo criando uma "Pasta Digital" (Arquivo de Comprovantes) para centralizar todas as fotos de recibos e notas fiscais (PDFs) anexados às despesas. 
O que fazer:  
Atualização no Upload (Formulário de Despesa):
▪ No arquivo components/expense-form.tsx (ou similar), altere o input de comprovante para oferecer duas opções claras ao usuário:
▫ Botão 1: "Tirar Foto" (mantendo o accept="image/" e capture="environment" para a câmera nativa). ▫ Botão 2: "Anexar Arquivo" (aceitando imagens da galeria e PDFs: accept="image/, application/pdf"). ▪ Garanta que o upload de PDFs seja suportado e salvo corretamente no Supabase Storage.   

Nova Página de Arquivo Digital (app/(app)/comprovantes/page.tsx):
▪ Crie uma nova rota (Server Component) que busque todas as despesas do Supabase onde a coluna receipt_url (ou equivalente) não seja nula. ▪ A página deve exibir um "Mural" (Grid responsivo) com os documentos. 
▪ Cada item do grid deve ser um Card elegante contendo:
▫ Uma miniatura do arquivo (se for imagem, exiba um preview; se for PDF, exiba um ícone de documento). 
▫ O valor da despesa, a data e a descrição.
▫ Um botão para "Abrir/Baixar" o documento em tela cheia. ▪ Se não houver nenhum documento no banco, exiba um Empty State amigável: "Nenhum comprovante salvo ainda".   

Acesso Rápido na Home:
▪ No nosso Painel de Controle (app/(app)/page.tsx), adicione um novo botão no grid de ações secundárias chamado "Pasta Digital" ou "Comprovantes" (ícone FolderOpen ou FileText da lucide-react), direcionando para a nova rota /comprovantes. Estilo: Mantenha a estética "Reforma Chique" com suporte perfeito ao Light/Dark Mode (fundos stone-50/zinc-900).   

Prompt B: Inteligência Cronológica da Pasta Digital

Atue como um Desenvolvedor Full Stack Sênior. Vamos implementar a "Pasta Digital" (arquivo de comprovantes) com um foco forte na organização por datas e acesso rápido. 
O que fazer:  
Acesso Rápido no Painel de Controle:
▪ No arquivo app/(app)/page.tsx (nosso Hub), garanta que o botão "Pasta Digital" (com o ícone FolderOpen ou FileText da lucide-react) esteja em destaque no grid de ações secundárias, apontando para /comprovantes.   
Inteligência da Pasta Digital (app/(app)/comprovantes/page.tsx):
▪ Busque as despesas no Supabase onde receipt_url não seja nula. ▪ Regra de Ordenação: Ordene os resultados pela data da despesa (expense_date) de forma decrescente (os mais recentes primeiro). ▪ Agrupamento Visual (UI): Organize o "Mural" agrupando os comprovantes visualmente por Mês/Ano (ex: um pequeno cabeçalho "Novembro 2023" e, abaixo dele, o grid com os cards daquele mês).   

Design dos Cards do Arquivo:
▪ Cada card deve mostrar a miniatura do arquivo ou ícone de PDF, o valor, a descrição e a data exata do lançamento bem visível. 
▪ Inclua a ação de abrir/baixar o documento.
▪ Mantenha suporte total ao nosso Light/Dark Mode (fundos stone-50/zinc-900).   

(Lembrete de Arquiteta: Vá na aba "Storage" do Supabase e crie um Bucket público chamado "receipts" para salvar os arquivos ).  

Dicas de Ouro para a Execução
Crie um arquivo .cursorrules: No Cursor, você pode criar um arquivo com esse nome na raiz do seu projeto. Coloque lá as regras inegociáveis do seu PRD, como a estética "Reforma Chique" , a proibição de gráficos de pizza , e a regra de nunca usar preto absoluto no Dark Mode. Assim, o Claude vai ler essas diretrizes automaticamente em toda interação, economizando o seu tempo de ficar repetindo o contexto.  

Atenção ao RLS no Supabase: Como a visão de longo prazo é transformar o aplicativo em um SaaS multi-tenant comercializável, ative as políticas de Row Level Security (RLS) diretamente nas tabelas do Supabase. É essa configuração de segurança que garante que um usuário jamais consiga acessar as notas fiscais, fotos ou a contagem regressiva da obra de outro.  

Estratégia de Hospedagem: O escopo atual utiliza a Vercel para o frontend. É um caminho excelente e super rápido. Porém, caso o aplicativo cresça e ganhe muitos usuários, configurar o projeto no seu próprio servidor VPS pode oferecer muito mais previsibilidade e controle de custos do que depender exclusivamente dos planos da Vercel e do Supabase gerenciado.  

O "Plano B" dos Dados: O objetivo central do aplicativo é abandonar o uso das planilhas de Excel no canteiro de obras. No entanto, para fins de análise de dados avançada, peça para o seu "pedreiro digital" incluir um botão discreto de "Exportar Histórico (.csv ou .xlsx)" na tela de Despesas. Assim, você mantém a facilidade do mobile na hora da compra, mas não perde o poder de cruzar os dados de forma mais complexa no futuro, se necessário.  



1. Agenda de Fornecedores (O "Páginas Amarelas" da Obra)
O Problema: Durante a obra, você conversa com a marmoraria, o eletricista, a loja de tintas, a marcenaria... e os orçamentos e contatos ficam todos perdidos no meio de conversas do WhatsApp.

A Solução: Uma tabela simples de Fornecedores. Nome, WhatsApp, especialidade e uma nota de avaliação. Quando alguém perguntar "quem fez o seu projeto de iluminação?", a resposta estará a um clique. Isso pode até ser atrelado ao registro de despesas!

2. Leitura Inteligente de Notas Fiscais (A Magia dos Dados)
O Problema: Digitar o valor de cada parafuso no meio da loja de materiais pode tirar a agilidade da rotina.

A Solução: Trazer um pouco de "magia" para o aplicativo integrando uma API de OCR (Reconhecimento Ótico de Caracteres). Você tira a foto do cupom fiscal e o app lê automaticamente o CNPJ da loja e o valor total, preenchendo o formulário de nova despesa sozinho. É a automação de processos levada ao nível máximo.

3. Checklist de Execução (O Diário de Obras)

O Problema: O financeiro e as fases ("Estrutura" e "Mobiliário & Decor") estão perfeitamente mapeados, mas e o avanço físico da obra?  

A Solução: Criar um módulo visual de "Tarefas" conectado àquela tabela de cômodos (rooms) que estruturamos. Na "Cozinha", por exemplo, você teria os checks: Quebra-quebra, Hidráulica, Porcelanato, Marcenaria. Dar um "check" nessas caixinhas traz um alívio psicológico gigantesco durante o estresse da reforma.  

4. Galeria de "Antes e Depois" (O Moodboard Chique)
O Problema: Com a correria, a gente esquece como o ambiente era no início e foca apenas no que falta fazer.

A Solução: Uma galeria de fotos focada no avanço visual. Aproveitando o Supabase Storage que já usamos para os recibos, podemos ter uma aba onde você salva as referências do Pinterest ao lado das fotos reais do seu apartamento evoluindo. Reforça 100% a estética "Reforma Chique" do projeto.  





