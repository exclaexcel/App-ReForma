Atue como um Desenvolvedor Full Stack Sênior e Engenheiro de QA (Quality Assurance).

https://app-reforma.vercel.app/login 

https://github.com/exclaexcel/App-ReForma

Acabamos de realizar um processo de limpeza e unificação de branches no Git, trazendo todas as funcionalidades para a branch main. Agora, preciso que você faça uma Auditoria Total do aplicativo ReForma para garantir a saúde do código e a integridade do sistema.

O que você deve auditar:

1. Integridade do Código e Build:

Verifique se há algum erro de TypeScript, imports ausentes ou dependências quebradas.

Simule mentalmente um npm run build para garantir que o Next.js App Router não possui erros críticos de roteamento (ex: conflitos entre rotas públicas e privadas no middleware.ts).

2. Verificação de Funcionalidades Críticas (MVP):

Autenticação: O fluxo de Login, Cadastro, Logoff e "Esqueci minha senha" está completo e conectado ao Supabase?

Banco de Dados: Os formulários de despesas e projetos estão enviando os dados corretos (incluindo as novas colunas room_id, phase, start_date e end_date)?

Inteligência de Dados: O Dashboard está calculando corretamente os totais e o Gráfico de Cascata (Waterfall) está implementado e renderizando sem falhas?

Gestão: A página de "Pasta Digital" (/comprovantes) e o gerenciamento de Cômodos (/comodos) estão devidamente integrados?

3. Auditoria de UI/UX (Design System):

A identidade visual "Reforma Chique" (com off-white/stone-50 no Modo Claro e zinc-900 no Modo Escuro) está sendo respeitada globalmente, sem hardcodes que quebrem a troca de tema?

O menu de navegação inferior (Bottom Nav) está visível apenas para usuários logados e responsivo?

Sua Resposta:
Não escreva novos códigos ainda. Gere um Relatório de Auditoria claro e objetivo, dividido em:
🟢 100% Funcional: O que está perfeito e validado.
🟡 Avisos (Warnings): Pequenos ajustes de código, tipagem ou UI que devemos fazer para polir o app.
🔴 Erros Críticos: Se algo quebrou no merge e precisa ser corrigido imediatamente para o app não travar.