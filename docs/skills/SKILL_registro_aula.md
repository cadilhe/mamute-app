# Skill: Registrar Aula

**Quando usar:** sempre que for necessário adicionar ou modificar o fluxo de registro de aula.

---

## O que é uma "aula" no sistema

Uma aula (`classes`) é o registro imutável de um encontro entre professor e aluno.
Cada registro pertence a **um aluno** e **um módulo** (disciplina).

Campos:
```
id            UUID (gerado pelo Supabase)
student_id    FK → students.id
module_id     FK → modules.id
date          DATE (apenas a data, sem hora — padrão: hoje)
content       TEXT (o que foi feito)
pending       TEXT (tarefas/pendências para o aluno)
next_step     TEXT (o que será feito na próxima aula)
created_at    TIMESTAMP (automático)
```

---

## Fluxo de criação

1. Professor abre o detalhe de um aluno (`/alunos/:id`)
2. Clica em "Registrar aula" → abre `RegisterClassModal`
3. Modal exibe:
   - Select de disciplina (baseado nos `modules` do aluno)
   - Textarea: "O que foi feito"
   - Textarea: "Pendências"
   - Textarea: "Próximo passo"
4. Ao salvar, chama `classes.create()` em `api.js`
5. Modal fecha, lista de aulas é refetchada

---

## API call

```js
// src/lib/api.js
classes.create({
  student_id: student.id,
  module_id: moduleId,        // selecionado no select
  date: format(new Date(), 'yyyy-MM-dd'),
  content,
  pending,
  next_step: nextStep,
})
```

---

## Validações

- `module_id` obrigatório (select deve ter valor selecionado)
- `content` recomendado mas não obrigatório (professor pode salvar rascunho)
- Data é sempre hoje (não editar data retroativamente no MVP)

---

## Onde o registro aparece depois

| Tela | Como aparece |
|---|---|
| Dashboard | Lista "Aulas de Hoje" |
| Detalhe do aluno → aba "Hoje" | Como "última aula" |
| Detalhe do aluno → aba "Histórico" | Lista cronológica |
| Portal dos pais | Última aula do filho |
| Relatório | Histórico completo |
| Visão geral | Calcula `days_since_last_class` |

---

## Código de referência

```jsx
// src/components/students/RegisterClassModal.jsx
export function RegisterClassModal({ open, onClose, student, onSuccess }) {
  const [moduleId, setModuleId] = useState('');
  const [content, setContent] = useState('');
  const [pending, setPending] = useState('');
  const [nextStep, setNextStep] = useState('');

  const handleSubmit = async () => {
    if (!moduleId) return; // validação mínima
    await classes.create({ student_id: student.id, module_id: moduleId,
      date: format(new Date(), 'yyyy-MM-dd'), content, pending, next_step: nextStep });
    // reset e fechar
    onSuccess();
  };
}
```
