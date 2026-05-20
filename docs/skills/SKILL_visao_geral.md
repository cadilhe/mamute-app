# Skill: Visão Geral com Alertas

**Quando usar:** ao implementar ou modificar a tela de visão geral.

---

## Propósito

Dar ao professor uma visão de saúde da sua turma:
quem está em risco de abandono, quem tem pendências acumuladas, quem está bem.

---

## Categorias de alerta

| Categoria | Critério | Cor |
|---|---|---|
| Precisam atenção | `days_since_last_class >= 14` | Vermelho `#EF4444` |
| Com pendências | `days_since_last_class < 14` e `pending_count >= 2` | Âmbar `#F59E0B` |
| Em dia | Todo o resto | Verde `#10B981` |

---

## Fonte dos dados: View `student_overview`

A view calcula automaticamente:
```sql
-- Campos disponíveis na view
id, name, age, school
days_since_last_class   -- INTEGER ou NULL (sem aulas)
pending_count           -- INTEGER (aulas com pending não-vazio)
last_class_date         -- DATE
```

Query:
```js
supabase
  .from('student_overview')
  .select('*')
  .order('days_since_last_class', { ascending: false })
```

---

## Lógica de filtragem no frontend

```js
const danger = data.filter(s => s.days_since_last_class >= 14);
const warning = data.filter(s => s.days_since_last_class < 14 && s.pending_count >= 2);
const ok = data.filter(s => s.days_since_last_class < 14 && s.pending_count < 2);

// filtro selecionado: 'all' | 'danger' | 'warning' | 'ok'
const shown = filter === 'all' ? data : { danger, warning, ok }[filter];
```

---

## Indicador na sidebar

O ponto vermelho na sidebar aparece quando `danger.length > 0`:
```jsx
// Em Sidebar.jsx
{alert && (
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', marginLeft: 'auto' }} />
)}
```

Para tornar dinâmico, a sidebar precisará de acesso ao estado global ou a um hook que chame a view.

---

## Texto de exibição

```js
// Dias sem aula
s.days_since_last_class === 0
  ? 'Aula hoje'
  : s.days_since_last_class === 1
    ? '1 dia sem aula'
    : `${s.days_since_last_class} dias sem aula`

// Sem nenhuma aula
s.days_since_last_class == null ? 'Sem aulas registradas' : ...
```
