# Component Rules — MAMUTE

Guia de quando criar, como organizar e como nomear componentes sob a arquitetura do Next.js e Tailwind CSS v3.

---

## Hierarquia de decisão

Antes de criar um novo componente, verifique nesta ordem:

1. **Já existe um shared?** → Usar do diretório `src/components/shared/`
2. **É específico de uma feature?** → Criar no diretório `src/components/<feature>/`
3. **É usado em 3 ou mais lugares diferentes?** → Promover para `src/components/shared/`

---

## Componentes shared existentes

Todos os componentes compartilhados usam Tailwind CSS e aceitam propriedades extras (`...props` e `className`).

### Button
```jsx
import { Button } from '../shared/Button';

<Button variant="primary" size="md" onClick={fn}>Salvar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="ghost">Ver mais</Button>
<Button variant="danger">Excluir</Button>
// size: 'sm' | 'md' | 'lg'
```

### Card
```jsx
import { Card } from '../shared/Card';

<Card>Conteúdo do Card</Card>
<Card onClick={() => router.push('/alunos/' + id)}>Card clicável</Card>
```

### Modal
```jsx
import { Modal } from '../shared/Modal';

<Modal open={showModal} onClose={() => setShowModal(false)} title="Título" width={560}>
  Conteúdo do modal
</Modal>
// Bloqueia rolagem do body, fecha com ESC e cliques externos automaticamente
```

### Input / Textarea / Select
```jsx
import { Input, Textarea, Select } from '../shared/Input';

<Input label="Nome" value={name} onChange={e => setName(e.target.value)} placeholder="..." />
<Textarea label="Conteúdo" value={text} onChange={e => setText(e.target.value)} rows={4} />
<Select label="Disciplina" value={disc} onChange={e => setDisc(e.target.value)}>
  <option value="">Selecione...</option>
  <option value="piano">Piano</option>
</Select>
```

### Loading / EmptyState
```jsx
import { Loading, EmptyState } from '../shared/Loading';

if (loading) return <Loading text="Carregando alunos..." />;

<EmptyState icon="👤" title="Nenhum aluno" description="Cadastre o primeiro aluno." />
```

### Badge
```jsx
import { DisciplineBadge, AlertBadge } from '../shared/Badge';

<DisciplineBadge discipline="piano" size="sm" />   // size: 'sm' | 'md'
<AlertBadge type="danger" />   // type: 'danger' | 'warning' | 'success'
```

---

## Anatomia de um componente de feature

```jsx
// src/components/students/StudentDetail.jsx
'use client';

// 1. Imports externos
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// 2. Imports internos (hooks → lib → outros componentes → shared)
import { useStudent } from '@/hooks/useStudents';
import { classes as classesApi } from '@/lib/api';
import { RegisterClassModal } from './RegisterClassModal';
import { Button } from '../shared/Button';
import { Loading } from '../shared/Loading';

// 3. Componentes auxiliares locais (se pequenos)
function StatCard({ value, label }) {
  return (
    <div className="bg-surface-2 p-3 rounded-lg border border-border">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-text-3">{label}</div>
    </div>
  );
}

// 4. Componente principal — export nomeado
export function StudentDetail() {
  // 4a. Hooks de roteamento do Next.js
  const { id } = useParams();
  const router = useRouter();

  // 4b. Hooks customizados (dados de cliente)
  const { data: student, loading, refetch } = useStudent(id);

  // 4c. Estado local (UI only)
  const [tab, setTab] = useState('Hoje');
  const [showModal, setShowModal] = useState(false);

  // 4d. Handlers
  const handleSave = async () => { ... };

  // 4e. Early returns
  if (loading) return <Loading />;
  if (!student) return <div className="text-text-3 text-sm">Aluno não encontrado.</div>;

  // 4f. Render usando Tailwind CSS
  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{student.name}</h1>
      {/* ... */}
    </div>
  );
}
```

---

## Modais

Modais são sempre criados como componentes separados no mesmo diretório da feature:
```
students/
  StudentDetail.jsx      → página
  RegisterClassModal.jsx → modal de registro chamado pela página
  AddStudentModal.jsx    → modal de cadastro chamado pela lista
```

O controle de visibilidade (`open`) e o callback de sucesso ficam sob o controle do componente pai:
```jsx
// No pai (StudentDetail)
const [showAdd, setShowAdd] = useState(false);

<Button onClick={() => setShowAdd(true)}>+ Novo</Button>
<AddStudentModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={refetch} />
```

No modal (filho):
```jsx
export function AddStudentModal({ open, onClose, onSuccess }) {
  const handleSubmit = async () => {
    await studentsApi.create(data);
    onClose();
    onSuccess(); // Notifica o pai para atualizar
  };
}
```

---

## Navegação por Abas (Tabs)

Padrão de abas moderno utilizando o conceito de Segmented Control (estilo iOS/macOS), implementado com Tailwind CSS e estado reativo local:
```jsx
const TABS = ['Hoje', 'Histórico', 'Progresso', 'Khan Academy'];
const [tab, setTab] = useState('Hoje');

// Render do controle segmentado de abas
<div className="flex mb-6 overflow-x-auto select-none no-scrollbar">
  <div className="inline-flex flex-nowrap gap-1 bg-surface-2 p-1 rounded-xl border border-border">
    {TABS.map(t => (
      <button
        key={t}
        onClick={() => setTab(t)}
        className={`px-5 py-2 rounded-lg cursor-pointer text-xs font-semibold tracking-wide transition-all duration-200 border-none outline-none whitespace-nowrap ${
          tab === t
            ? 'bg-bg text-text shadow-sm font-bold'
            : 'text-text-3 hover:text-text-2 hover:bg-surface/50'
        }`}
      >
        {t}
      </button>
    ))}
  </div>
</div>

// Render condicional do conteúdo da aba
{tab === 'Hoje' && <TodayTab student={student} />}
{tab === 'Histórico' && <HistoryTab studentId={student.id} />}
```
