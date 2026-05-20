# Component Rules — MAMUTE

Guia de quando criar, como organizar e como nomear componentes.

---

## Hierarquia de decisão

Antes de criar um novo componente, verifique nesta ordem:

1. **Já existe um shared?** → usar `src/components/shared/`
2. **É específico de uma feature?** → criar em `src/components/<feature>/`
3. **É usado em 3+ lugares diferentes?** → promover para `shared/`

---

## Componentes shared existentes

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

<Card>Conteúdo</Card>
<Card onClick={() => navigate('/alunos/'+id)}>Card clicável</Card>
<Card style={{ padding: 24 }}>Com style customizado</Card>
```

### Modal
```jsx
import { Modal } from '../shared/Modal';

<Modal open={showModal} onClose={() => setShowModal(false)} title="Título" width={560}>
  Conteúdo do modal
</Modal>
// Fecha com ESC automaticamente
// Fecha ao clicar fora automaticamente
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

<DisciplineBadge discipline="piano" size="sm" />   // sm | md
<AlertBadge type="danger" />   // danger | warning | success
```

---

## Anatomia de um componente de feature

```jsx
// src/components/students/StudentDetail.jsx

// 1. Imports externos
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 2. Imports internos (hooks → lib → outros componentes → shared)
import { useStudent } from '../../hooks/useStudents';
import { classes as classesApi } from '../../lib/api';
import { RegisterClassModal } from './RegisterClassModal';
import { Button } from '../shared/Button';

// 3. Componentes auxiliares locais (se pequenos)
function StatCard({ value, label }) {
  return <div>...</div>;
}

// 4. Componente principal — export nomeado
export function StudentDetail() {
  // 4a. Hooks de roteamento
  const { id } = useParams();
  const navigate = useNavigate();

  // 4b. Hooks customizados (dados)
  const { data: student, loading, refetch } = useStudent(id);

  // 4c. Estado local (UI only)
  const [tab, setTab] = useState('Hoje');
  const [showModal, setShowModal] = useState(false);

  // 4d. Handlers
  const handleSave = async () => { ... };

  // 4e. Early returns
  if (loading) return <Loading />;
  if (!student) return <EmptyState title="Aluno não encontrado" />;

  // 4f. Render
  return ( ... );
}
```

---

## Modais

Modais são sempre componentes separados no mesmo diretório da feature:

```
students/
  StudentDetail.jsx      → página
  RegisterClassModal.jsx → modal chamado pela página
  AddStudentModal.jsx    → modal chamado pela lista
```

Estado do modal (`open`) é controlado pelo pai:
```jsx
// No pai
const [showAdd, setShowAdd] = useState(false);
<Button onClick={() => setShowAdd(true)}>+ Novo</Button>
<AddStudentModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={handleSuccess} />
```

---

## Padrão de callback onSuccess

```jsx
// Modal recebe onSuccess para notificar o pai após operação
export function AddStudentModal({ open, onClose, onSuccess }) {
  const handleSubmit = async () => {
    await studentsApi.create(data);
    onClose();
    onSuccess(); // pai pode refetch, navegar, etc.
  };
}
```

---

## Tabs

Padrão de tabs usado no StudentDetail:
```jsx
const TABS = ['Hoje', 'Histórico', 'Progresso', 'Khan Academy'];
const [tab, setTab] = useState('Hoje');

// Render das tabs
<div style={{ display:'flex', borderBottom:'1px solid var(--border)' }}>
  {TABS.map(t => (
    <button key={t} onClick={() => setTab(t)} style={{
      padding: '10px 18px',
      fontWeight: tab === t ? 600 : 400,
      borderBottom: tab === t ? '2px solid var(--text)' : '2px solid transparent',
      // ...
    }}>{t}</button>
  ))}
</div>

// Condicional de conteúdo
{tab === 'Hoje' && <TodayTab student={student} />}
{tab === 'Histórico' && <HistoryTab classes={classHistory} />}
```
