# Prompt para Agente de IA — MAMUTE

Use este prompt ao iniciar uma sessão de desenvolvimento com qualquer agente de IA (Cursor, Windsurf, Copilot, Claude, etc.).

---

## Prompt de contexto (colar no início da sessão)

```
Você está desenvolvendo o MAMUTE, um sistema de gestão de ensino para professor autônomo.

## Stack
- React 18 (hooks only, sem class components)
- React Router 6 (useNavigate, useParams)
- Supabase JS 2 (auth + PostgreSQL)
- date-fns 3 com locale ptBR
- Inline styles com CSS variables (sem Tailwind, sem CSS Modules)

## Estrutura de arquivos
src/
  components/<feature>/  → componentes por feature
  components/shared/     → Button, Card, Modal, Input, Textarea, Select, Loading, EmptyState, DisciplineBadge, AlertBadge
  hooks/                 → useAuth, useStudents, useClasses
  lib/
    supabase.js          → cliente singleton
    api.js               → TODA query ao banco fica aqui
    constants.js         → DISCIPLINES com cores, ALERT_DAYS=14

## Regras mandatórias
1. TODA query ao banco fica em src/lib/api.js — nunca query direto no componente
2. Inline styles usando CSS variables: var(--surface), var(--border), var(--text), var(--radius), etc.
3. Componentes shared existem — use-os antes de criar novos
4. Export nomeado sempre: export function MinhaPage() — nunca default anônimo
5. Soft delete em alunos: update({ active: false }) — nunca DELETE
6. Disciplinas válidas: piano | robotica | matematica | ingles | bateria | reforco
7. Datas: date-fns com ptBR. Armazenar como 'yyyy-MM-dd'
8. Keys em listas: sempre id único, nunca index
9. Estado derivado: calcular inline, não duplicar em useState

## Banco de dados
Tabelas principais: profiles, students, modules, classes, progress, schedules,
  khan_profiles, khan_topics, khan_subtopics, parent_student, reports
Views: student_overview (days_since_last_class, pending_count), last_class_per_module
RLS ativo: professor vê tudo, responsável só vê filho vinculado

## Design tokens (CSS variables em globals.css)
--bg, --surface, --surface-2, --border
--text, --text-2, --text-3
--piano, --piano-bg, --robotica, --robotica-bg, --matematica, --matematica-bg
--ingles, --ingles-bg, --bateria, --bateria-bg, --reforco, --reforco-bg
--danger, --danger-bg, --warning, --warning-bg, --success, --success-bg
--sidebar-w (220px), --radius (12px), --radius-sm (8px)
--shadow, --shadow-md

## Personas
- Professor: acesso total, rota protegida por <ProtectedRoute>
- Responsável: vê apenas portal /pais com dados do próprio filho

Antes de qualquer implementação, pergunte se há dúvida sobre o modelo de dados ou regras acima.
```

---

## Prompts específicos por tarefa

### Criar novo componente
```
Crie o componente [NomeDoComponente] em src/components/[feature]/[NomeDoComponente].jsx

Deve:
- [descrever comportamento]
- Usar componentes shared: [Button/Card/Modal/Input/etc.]
- Buscar dados via [nomeDaQuery] em src/lib/api.js
- Seguir as coding rules do projeto
```

### Adicionar nova query
```
Adicione a query [nomeDaOperação] em src/lib/api.js para [objetivo].

Tabela: [nome_da_tabela]
Campos necessários: [campos]
Filtros: [condições]
Retorno esperado: [estrutura]
```

### Corrigir bug
```
Bug: [descrever o comportamento incorreto]
Arquivo: [caminho/do/arquivo.jsx]
Comportamento esperado: [o que deveria acontecer]
Não mude o estilo ou estrutura do componente, apenas corrija a lógica.
```

### Adicionar nova tela
```
Crie a tela [NomeDaTela] em src/components/[feature]/[NomeDaTela].jsx

Rota: /[caminho]
Adicione a rota em src/App.js
Adicione o link na Sidebar em src/components/layout/Sidebar.jsx

Dados necessários: [tabelas/views do banco]
Usuário: [professor | responsável | ambos]
```

---

## Checklist antes de commitar

- [ ] Nenhuma query fora de api.js
- [ ] Nenhum `console.log` de debug
- [ ] Nenhum `key={index}` em listas
- [ ] CSS variables usadas (sem hex hardcoded para as vars do sistema)
- [ ] Loading state tratado
- [ ] Empty state tratado
- [ ] Erro do Supabase tratado (`if (error) { ... }`)
- [ ] Componentes shared reutilizados quando possível
