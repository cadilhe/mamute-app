# Supabase Rules — MAMUTE

Convenções e padrões para o banco de dados Supabase do projeto.

---

## Conexão

O cliente Supabase é um singleton em `src/lib/supabase.js`.
Nunca criar outro cliente. Nunca importar `createClient` fora desse arquivo.

```js
// ✅ Correto: importar o cliente pronto
import { supabase } from '../lib/supabase';

// ❌ Errado: criar novo cliente
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(...); // proibido
```

---

## Tabelas e convenções

| Tabela | Propósito |
|---|---|
| `profiles` | Estende `auth.users`. Role: teacher ou parent |
| `students` | Alunos. `active: bool` para soft delete |
| `modules` | Disciplinas de cada aluno |
| `classes` | Registro imutável de cada aula |
| `progress` | % de progresso por disciplina por aluno |
| `schedules` | Grade semanal recorrente |
| `khan_profiles` | Perfil Khan Academy do aluno |
| `khan_topics` | Tópicos em andamento no Khan |
| `khan_subtopics` | Exercícios/vídeos específicos |
| `parent_student` | Vínculo N:N responsável ↔ aluno |
| `reports` | Log de relatórios gerados |

**Views úteis:**
- `student_overview` → alunos com `days_since_last_class` e `pending_count`
- `last_class_per_module` → última aula por módulo por aluno

---

## Padrões de query (via api.js)

### Select com join
```js
supabase
  .from('students')
  .select('*, modules(*), khan_profiles(*)')
  .eq('active', true)
  .order('name')
```

### Insert e retornar o registro
```js
supabase
  .from('students')
  .insert({ name, age, active: true })
  .select()
  .single()
```

### Update
```js
supabase
  .from('classes')
  .update({ content, pending })
  .eq('id', id)
  .select()
  .single()
```

### Upsert (inserir ou atualizar)
```js
supabase
  .from('khan_profiles')
  .upsert({ student_id, khan_username, profile_url })
  .select()
  .single()
```

---

## Row Level Security (RLS)

RLS está **sempre ativo**. Nunca desativar em produção.

Política base:
- **Professor** (`role = 'teacher'`): lê e escreve tudo
- **Responsável** (`role = 'parent'`): lê apenas dados vinculados ao próprio filho via `parent_student`

Para verificar se RLS está ativo:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## Migrations

Toda mudança de schema vai em arquivo numerado:
```
architecture/
  migrations/
    001_initial_schema.sql
    002_add_khan_tables.sql
    003_add_schedules.sql
```

Nunca alterar schema diretamente no Supabase Studio sem registrar aqui.

---

## Dados de disciplina

A coluna `discipline` em `modules` aceita apenas os valores:
```
piano | robotica | matematica | ingles | bateria | reforco
```

Nunca inserir valor fora dessa lista. A validação é feita via `constants.js` no frontend.

---

## Soft delete

Alunos nunca são deletados fisicamente.
```js
// Desativar aluno
supabase.from('students').update({ active: false }).eq('id', id)

// Listar apenas ativos (padrão)
supabase.from('students').select('*').eq('active', true)
```

---

## Timestamps

Todas as tabelas têm `created_at` com `DEFAULT now()`.
Para aulas, `date` é do tipo `DATE` (apenas a data, sem hora).

```js
// Inserir aula com data de hoje
{ date: format(new Date(), 'yyyy-MM-dd') }
```

---

## Variáveis de ambiente

| Variável | Onde usar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase.js` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase.js` |

Arquivo `.env` na raiz do projeto (nunca commitar, está no `.gitignore`).  
`.env.example` commitado com placeholders para onboarding.
