# MAMUTE — Documentação do Projeto

Índice de todos os documentos de engenharia do sistema de gestão de ensino.

---

## Onde começar

| Você quer... | Leia |
|---|---|
| Entender o projeto do início | `prd/PRD.md` |
| Configurar o ambiente do zero | [SETUP_GUIDE.md](file:///d:/projects/react_projects/mamute-app/docs/SETUP_GUIDE.md) |
| Iniciar sessão com agente de IA | `prompts/AI_AGENT_PROMPT.md` |
| Solicitar uma nova feature | `prompts/FEATURE_REQUESTS.md` |
| Entender as regras de código (MANDATÓRIO) | [CODING_RULES.md](file:///d:/projects/react_projects/mamute-app/docs/rules/CODING_RULES.md) |
| Entender os padrões de componentes | [COMPONENT_RULES.md](file:///d:/projects/react_projects/mamute-app/docs/rules/COMPONENT_RULES.md) |
| Entender o banco de dados e RLS | [DATABASE_SCHEMA.md](file:///d:/projects/react_projects/mamute-app/docs/architecture/DATABASE_SCHEMA.md) |

---

## Estrutura de documentos

```
mamute-docs/
  INDEX.md                          ← você está aqui
  SETUP_GUIDE.md                    ← como configurar e rodar o projeto do zero
  
  prd/
    PRD.md                          ← requisitos, regras de negócio, roadmap
  
  rules/
    CODING_RULES.md                 ← padrões de código da stack Next.js + Tailwind
    SUPABASE_RULES.md               ← convenções do banco de dados e RLS
    COMPONENT_RULES.md              ← como criar e organizar componentes
  
  skills/
    SKILL_registro_aula.md          ← lógica de negócio do registro de aula
    SKILL_cadastro_aluno.md         ← lógica de negócio do cadastro de aluno
    SKILL_khan_academy.md           ← funcionamento da integração Khan Academy
    SKILL_visao_geral.md            ← alertas e lógica da visão geral
  
  architecture/
    DATABASE_SCHEMA.md              ← schema SQL completo + regras RLS
  
  prompts/
    AI_AGENT_PROMPT.md              ← prompt de contexto para agentes de IA
    FEATURE_REQUESTS.md             ← templates para solicitar features
```

---

## Resumo da stack

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Páginas/views estruturadas por rotas físicas, uso de Route Groups |
| **Frontend** | React 18 | Hooks only, sem Class Components |
| **Banco de dados** | Supabase (PostgreSQL) | Toda query concentrada em `src/lib/api.js` |
| **Autenticação** | Supabase Auth | Validação de sessão no layout de rota e RLS ativo no banco |
| **Estilização** | Tailwind CSS v3 | Design dark mode premium via variáveis CSS no `:root` e classes Tailwind |
| **Datas** | date-fns 3 | Locale `ptBR` para formatação e manipulação de datas |
| **Deploy** | Vercel | Gerenciador de deploy automático integrado ao GitHub |
| **Ícones** | lucide-react | Ícones vetoriais modernos |

---

## Status do desenvolvimento

| Módulo | Status |
|---|---|
| Autenticação | ✅ Migrado para Next.js |
| Dashboard | ✅ Migrado para Next.js |
| Listagem de alunos | ✅ Migrado para Next.js |
| Cadastro de alunos | ✅ Migrado para Next.js |
| Detalhe do aluno | ✅ Migrado para Next.js |
| Registro de aulas | ✅ Migrado para Next.js |
| Histórico de aulas | ✅ Migrado para Next.js |
| Visão geral com alertas | ✅ Migrado para Next.js |
| Agenda semanal | ✅ Migrado para Next.js (read-only) |
| Portal dos responsáveis | ✅ Migrado para Next.js |
| Aba Khan Academy | ✅ Migrado para Next.js (read) |
| Relatórios / PDF | ✅ Migrado para Next.js |
| Editar aluno | ⏳ Próxima feature |
| Editar aula | ⏳ Próxima feature |
| Cadastrar horário na agenda | ⏳ Próxima feature |
| Atualizar progresso | ⏳ Próxima feature |
| Configurar Khan Academy | ⏳ Próxima feature |
| Notificação por email | 🔮 Fase 2 |
| Financeiro | 🔮 Fase 3 |
