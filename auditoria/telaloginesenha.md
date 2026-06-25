Atue como um Desenvolvedor Full Stack Sênior.
Notei que precisamos adicionar e refinar os botões de controle de acesso (Login e Logoff) para completar o fluxo do usuário no nosso aplicativo, mantendo o padrão visual e a arquitetura com o Supabase Auth.

O que fazer:

1. Botão de Sair (Logoff) no Painel de Controle:

Na tela logada (nosso Hub Rápido em app/(app)/page.tsx), vá até o Header/Cabeçalho (onde está a saudação "Olá, [Nome]" e o botão de tema Light/Dark).

Adicione um botão de "Sair" (Logoff) de forma discreta, mas acessível (ex: no canto superior direito). Use o ícone LogOut da lucide-react.

Estilize-o como um botão ghost (sem fundo preenchido) para não brigar com as ações principais, apenas o ícone ou texto com as nossas cores de texto (text-zinc-500 / text-zinc-400).

Configure a ação para chamar o método signOut() do Supabase e redirecionar o usuário para a página de Boas-Vindas (/).

2. Botões de Login/Cadastro na Landing Page:

Confirme se a página não-logada (app/page.tsx, nossa tela de Boas-Vindas) possui os dois botões grandes de ação (CTAs) que direcionam o usuário para se autenticar.

Botão Principal: "Criar minha conta" (Fundo Terracota bg-orange-700, texto branco, direcionando para /signup ou aba de cadastro).

Botão Secundário: "Já tenho uma conta" (Estilo outline elegante com texto em marrom/chocolate, direcionando para /login ou aba de login).

Garanta que as rotas de autenticação (as páginas reais de login/signup) estejam funcionando integradas ao cliente do Supabase e que redirecionem de volta para o Painel de Controle (/) em caso de sucesso.

parte 2

O que fazer:

1. Atualizar a Tela de Login:

Na tela de login atual (ex: app/(auth)/login/page.tsx), adicione um link discreto e elegante escrito "Esqueci minha senha".

A cor desse link pode usar nossa paleta secundária text-zinc-500 com hover no tom de Terracota orange-700.

Esse link deve direcionar para a nova rota /recuperar-senha.

2. Nova Tela: Solicitar Recuperação (app/(auth)/recuperar-senha/page.tsx):

Crie uma página com um formulário simples contendo o campo de "E-mail" e um botão "Enviar link de recuperação".

O botão de ação principal deve ter o fundo Terracota (bg-orange-700).

Integre com a função do Supabase client para enviar o email de reset (supabase.auth.resetPasswordForEmail).

Adicione uma rota de retorno redirecionando (redirectTo) para a futura página de atualizar senha.

Inclua mensagens visuais de sucesso ou erro e um botão "Voltar para o login".

3. Nova Tela: Atualizar Senha (app/(auth)/atualizar-senha/page.tsx):

Crie a página que o usuário acessará ao clicar no link recebido por e-mail.

O formulário deve ter os campos "Nova Senha" e "Confirmar Nova Senha", e o botão "Salvar Nova Senha".

Integre com a função de atualização de usuário do Supabase (supabase.auth.updateUser({ password: newPassword })).

Após o sucesso, redirecione o usuário de volta para o Painel de Controle (/).

Estilo: Mantenha a estética "Reforma Chique" com fundos elegantes (suportando light e dark mode via stone-50 e zinc-900).