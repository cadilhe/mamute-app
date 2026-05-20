# Templates de Feature Request — MAMUTE

Use estes templates ao solicitar novas funcionalidades ao agente de IA.

---

## Template genérico

```
Feature: [nome da funcionalidade]

Como [professor | responsável], quero [ação] para [benefício].

Critérios de aceite:
- [ ] [critério 1]
- [ ] [critério 2]

Dados necessários do banco: [tabelas]
Componentes que serão afetados: [lista]
Nova rota necessária? [Sim/Não — qual]
```

---

## Features planejadas (próximas)

### F001 — Editar dados do aluno
```
Feature: Editar dados do aluno

Como professor, quero editar nome/idade/escola de um aluno existente.

Critérios de aceite:
- [ ] Botão "Editar" no header do StudentDetail
- [ ] Abre modal com campos pré-preenchidos
- [ ] Salva via students.update() em api.js
- [ ] Atualiza view sem reload de página

Dados: students (update)
Componentes: StudentDetail.jsx + novo EditStudentModal.jsx
Nova rota: Não
```

### F002 — Editar aula registrada
```
Feature: Editar registro de aula

Como professor, quero corrigir o conteúdo de uma aula já registrada.

Critérios de aceite:
- [ ] Ícone de editar em cada item do Histórico
- [ ] Abre modal com campos pré-preenchidos
- [ ] Apenas content, pending e next_step são editáveis (data não)
- [ ] Salva via classes.update() em api.js

Dados: classes (update)
Componentes: StudentDetail.jsx (aba Histórico) + novo EditClassModal.jsx
```

### F003 — Cadastrar horário na agenda
```
Feature: Adicionar horário na agenda

Como professor, quero registrar o horário semanal de cada aluno.

Critérios de aceite:
- [ ] Botão "+ Horário" na SchedulePage
- [ ] Modal: selecionar aluno, disciplina, dia da semana, hora início, hora fim
- [ ] Salva via schedule.create() em api.js
- [ ] Aparece imediatamente na grade

Dados: schedules (insert), students + modules (select para preencher selects)
Componentes: SchedulePage.jsx + novo AddScheduleModal.jsx
```

### F004 — Atualizar progresso do aluno
```
Feature: Atualizar % de progresso por disciplina

Como professor, quero registrar o percentual de progresso de cada disciplina.

Critérios de aceite:
- [ ] Na aba Progresso do aluno, input slider ou número para cada disciplina
- [ ] Salva via progress.upsert() em api.js (UNIQUE student_id + discipline)
- [ ] Barra de progresso atualiza imediatamente

Dados: progress (upsert)
Componentes: StudentDetail.jsx (aba Progresso)
```

### F005 — Configurar Khan Academy de um aluno
```
Feature: Adicionar/editar perfil Khan Academy

Como professor, quero configurar o perfil Khan de um aluno e adicionar tópicos.

Critérios de aceite:
- [ ] Botão "Configurar Khan" quando não há perfil
- [ ] Modal: username, URL do perfil, streak, minutos/semana
- [ ] Após criar perfil, poder adicionar tópicos com nome, URL e % progresso
- [ ] Cada tópico pode ter subtópicos com nome e URL

Dados: khan_profiles (upsert), khan_topics (insert), khan_subtopics (insert)
Componentes: KhanTab.jsx + KhanSetupModal.jsx + AddTopicModal.jsx
```

### F006 — Notificação por email ao responsável
```
Feature: Enviar resumo da aula por email ao responsável

Como professor, após registrar uma aula, quero que o responsável receba um email.

Critérios de aceite:
- [ ] Checkbox "Notificar responsável" no RegisterClassModal
- [ ] Se marcado, aciona Supabase Edge Function que envia email
- [ ] Email contém: nome do aluno, disciplina, conteúdo da aula, pendências

Dados: classes, students (parent_email), profiles
Nova infra: Supabase Edge Function + Resend ou SendGrid
Componentes: RegisterClassModal.jsx (adicionar checkbox)

Nota: Requer configuração de email provider no Supabase.
```
