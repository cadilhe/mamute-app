# MAMUTE — Documentação do Projeto

Índice de todos os documentos de engenharia.

---

## Onde começar

| Você quer... | Leia |
|---|---|
| Entender o projeto do início | `prd/PRD.md` |
| Configurar o ambiente | `SETUP_GUIDE.md` |
| Iniciar sessão com agente de IA | `prompts/AI_AGENT_PROMPT.md` |
| Solicitar uma nova feature | `prompts/FEATURE_REQUESTS.md` |
| Entender as regras de código | `rules/CODING_RULES.md` |
| Entender o banco de dados | `architecture/DATABASE_SCHEMA.md` |

---

## Estrutura de documentos

```
mamute-docs/
  INDEX.md                          ← você está aqui
  SETUP_GUIDE.md                    ← como configurar tudo do zero
  
  prd/
    PRD.md                          ← requisitos, funcionalidades, roadmap
  
  rules/
    CODING_RULES.md                 ← padrões de código mandatórios
    SUPABASE_RULES.md               ← convenções do banco de dados
    COMPONENT_RULES.md              ← como criar e organizar componentes
  
  skills/
    SKILL_registro_aula.md          ← como funciona o registro de aula
    SKILL_cadastro_aluno.md         ← como funciona o cadastro de aluno
    SKILL_khan_academy.md           ← como funciona a integração Khan
    SKILL_visao_geral.md            ← como funciona a visão geral com alertas
  
  architecture/
    DATABASE_SCHEMA.md              ← schema SQL completo + RLS
  
  prompts/
    AI_AGENT_PROMPT.md              ← prompt de contexto para agentes de IA
    FEATURE_REQUESTS.md             ← templates para solicitar features
```

---

## Resumo da stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + React Router 6 |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Deploy | Vercel |
| Ícones | lucide-react |
| Datas | date-fns com locale ptBR |
| Estilo | Inline styles + CSS variables |

---

## Status do desenvolvimento

| Módulo | Status |
|---|---|
| Autenticação | ✅ Implementado |
| Dashboard | ✅ Implementado |
| Listagem de alunos | ✅ Implementado |
| Cadastro de alunos | ✅ Implementado |
| Detalhe do aluno | ✅ Implementado |
| Registro de aulas | ✅ Implementado |
| Histórico de aulas | ✅ Implementado |
| Visão geral com alertas | ✅ Implementado |
| Agenda semanal | ✅ Implementado (read-only) |
| Portal dos responsáveis | ✅ Implementado |
| Aba Khan Academy | ✅ Implementado (read) |
| Relatórios / PDF | ✅ Implementado |
| Editar aluno | ⏳ Próxima feature |
| Editar aula | ⏳ Próxima feature |
| Cadastrar horário na agenda | ⏳ Próxima feature |
| Atualizar progresso | ⏳ Próxima feature |
| Configurar Khan Academy | ⏳ Próxima feature |
| Notificação por email | 🔮 Fase 2 |
| Financeiro | 🔮 Fase 3 |
