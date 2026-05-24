# PRD — MAMUTE Sistema de Gestão de Ensino
**Versão:** 1.0 | **Status:** Concluído (Fases 1, 2, 3 e 4 implementadas)

---

## 1. Visão do Produto

### Problema
Professores autônomos com múltiplos alunos em múltiplas disciplinas não têm ferramenta centralizada para registrar aulas, acompanhar pendências e comunicar progresso aos responsáveis.

### Solução
Plataforma web para professores gerenciarem alunos, aulas, progresso e comunicação com responsáveis, com integração ao Khan Academy.

### Usuários
| Persona | Descrição | Acesso |
|---|---|---|
| **Professor** | Dono da MAMUTE. Gerencia tudo. | Full admin |
| **Responsável** | Pai/mãe. View-only do filho. | Portal restrito |

### Escopo MVP
- 50–100 alunos ativos
- Web app (desktop + mobile responsivo)
- Single-tenant (1 professor)

---

## 2. Disciplinas suportadas

| Chave | Label | Cor |
|---|---|---|
| `piano` | Piano | Azul `#3B82F6` |
| `robotica` | Robótica | Verde `#10B981` |
| `matematica` | Matemática | Âmbar `#F59E0B` |
| `ingles` | Inglês | Roxo `#8B5CF6` |
| `bateria` | Bateria | Rosa `#EC4899` |
| `reforco` | Reforço | Laranja `#F97316` |

---

## 3. Funcionalidades por prioridade

### P0 — MVP obrigatório

**Dashboard**
- Aulas registradas hoje
- Contador de alunos ativos
- Distribuição por disciplina

**Gestão de Alunos**
- Listar com busca por nome
- Cadastrar: nome, idade, escola, email responsável, disciplinas
- Editar e desativar (soft delete)
- Detalhe com abas: Hoje / Histórico / Progresso / Khan Academy

**Registro de Aulas**
- Campos: disciplina, conteúdo, pendências, próximo passo
- Data automática (hoje)
- Histórico imutável (trilha de auditoria)

**Visão Geral com Alertas**
- "Precisam atenção": 14+ dias sem aula
- "Com pendências": 2+ pendências acumuladas
- "Em dia": resto

**Portal dos Responsáveis**
- Login separado, vê só o próprio filho
- Exibe: última aula, tarefas, progresso, Khan

### P1 — Segunda fase

**Agenda Semanal**: grade por dia com horário recorrente  
**Khan Academy**: perfil, tópicos, subtópicos, links diretos  
**Relatórios**: modal + impressão/PDF gerado no browser

---

## 4. Escopo Adicional (Pós-MVP)

Os seguintes itens, originalmente definidos fora do escopo do MVP, foram incorporados e implementados com sucesso nas fases adicionais do roadmap:
- **Pagamentos / Financeiro**: Controle de mensalidades, vencimentos e histórico de pagamentos para os alunos.
- **Notificações por E-mail**: Disparo automático de e-mails para os responsáveis ao registrar as aulas (via Edge Functions + Resend/SendGrid).
- **Multi-professor / Unidades**: Suporte a múltiplas unidades de ensino e múltiplos professores vinculados a unidades específicas, além de uma role de Admin Global.
- **PWA (Progressive Web App)**: Configuração do PWA com suporte a funcionamento offline e instalação.

*Nota:* O aplicativo mobile nativo e a integração com API oficial do Khan Academy (permanece por preenchimento de URL manual) continuam fora do escopo atual do projeto.

---

## 5. Métricas de sucesso
- Registrar uma aula em menos de 60 segundos
- Responsável acessa progresso sem ajuda
- Zero perda de histórico
- Uptime 99%+

---

## 6. Roadmap

| Fase | Entregas | Status |
|---|---|---|
| 1 — MVP | Auth · Alunos · Aulas · Visão geral · Portal pais · Khan · Relatórios | ✅ Concluído |
| 2 — Comunicação | Email automático ao responsável após aula registrada | ✅ Concluído |
| 3 — Financeiro | Mensalidades, histórico de pagamentos | ✅ Concluído |
| 4 — Escala | Multi-professor (múltiplas unidades) & PWA offline | ✅ Concluído |
