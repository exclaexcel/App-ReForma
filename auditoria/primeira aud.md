Atue como um Desenvolvedor Full Stack Sênior e Engenheiro de QA (Quality Assurance).
Antes de construirmos novas funcionalidades, preciso que você faça uma Auditoria Total do nosso aplicativo para garantir a saúde do código e a integridade do sistema atual.

O que você deve auditar:

1. Integridade do Código e Build:
▪ Verifique se há algum erro de TypeScript, imports ausentes, dependências quebradas, funções duplicadas ou "código morto".
▪ Verifique mentalmente se um npm run build passaria sem erros críticos de roteamento no Next.js App Router.

2. Verificação de Conformidade com o PRD (prd.md):
▪ Analise as nossas rotas atuais, os formulários (despesas, cômodos, fases), o banco de dados (Supabase) e as lógicas de segurança (RLS).
▪ Verifique o que já está implementado corretamente em relação ao que definimos no nosso documento mestre.

3. Auditoria de UI/UX (Design System):
▪ A identidade visual "Reforma Chique" (com a paleta Zinc/Terracota/Chocolate) e as lógicas de alternância entre Modo Claro/Escuro estão consistentes globalmente?

O seu formato de Resposta:
Não escreva novos códigos ainda. Gere um Relatório de Inspeção claro e objetivo sobre a codebase atual, dividido em:
🟢 100% Funcional: O que está sólido, seguro e validado.
🟡 Avisos (Warnings): Pequenos ajustes de código, tipagem, interface ou dívidas técnicas que precisamos polir.
🔴 Erros Críticos: Vulnerabilidades ou bugs estruturais que precisam ser corrigidos imediatamente antes de avançarmos a obra.