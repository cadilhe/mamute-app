# Skill: Cadastrar Aluno

**Quando usar:** ao implementar ou modificar o fluxo de criação de novos alunos.

---

## Dados de um aluno

```
id            UUID (automático)
name          TEXT (obrigatório)
age           INTEGER (opcional)
school        TEXT (opcional)
parent_email  TEXT (email do responsável — usado para vincular login)
active        BOOLEAN (default: true)
created_at    TIMESTAMP (automático)
```

---

## Fluxo completo de criação

1. Na lista de alunos, clicar em "+ Novo aluno" → abre `AddStudentModal`
2. Preencher: nome, idade (opcional), escola (opcional), email do responsável (opcional)
3. Selecionar disciplinas (ao menos 1 — toggle de botões coloridos)
4. Ao confirmar:
   a. Criar o aluno em `students`
   b. Para cada disciplina selecionada, criar um `module`
5. Fechar modal e refetch da lista

---

## Sequência de API calls

```js
// 1. Criar aluno
const { data: student } = await studentsApi.create({
  name, age, school, parent_email, active: true
});

// 2. Criar módulos (um por disciplina selecionada)
for (const disc of selectedDisciplines) {
  await modulesApi.create({
    student_id: student.id,
    discipline: disc,                    // chave: 'piano', 'robotica', etc.
    name: DISCIPLINES[disc].label,       // label: 'Piano', 'Robótica', etc.
  });
}
```

---

## Seleção de disciplinas

Usar os botões com toggle colorido — não um select padrão:

```jsx
{Object.entries(DISCIPLINES).map(([key, d]) => {
  const selected = selectedDisciplines.includes(key);
  return (
    <button key={key} onClick={() => toggleDiscipline(key)} style={{
      borderColor: selected ? d.color : 'var(--border)',
      background: selected ? d.bg : 'transparent',
      color: selected ? d.color : 'var(--text-2)',
    }}>
      {d.label}
    </button>
  );
})}
```

---

## Vincular responsável (pós-criação)

O `parent_email` é salvo no cadastro do aluno.
Para dar acesso ao portal, o professor precisa:
1. Criar a conta do responsável em Supabase Auth (painel ou via invite)
2. Rodar o SQL de vínculo:
```sql
INSERT INTO parent_student (parent_id, student_id)
VALUES ('uuid-do-usuario-pai', 'uuid-do-aluno');
```

Isso será automatizado em uma fase futura.

---

## Validações

| Campo | Regra |
|---|---|
| `name` | Obrigatório, mínimo 2 caracteres |
| `discipline` | Ao menos 1 selecionada |
| `parent_email` | Formato email se preenchido |
| `age` | Número positivo se preenchido |
