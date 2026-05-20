# Coding Rules — MAMUTE

Regras mandatórias para todo código gerado neste projeto.
Um agente de IA ou desenvolvedor deve seguir estas regras sem exceção.

---

## Stack e versões

| Tecnologia | Versão | Notas |
|---|---|---|
| React | 18.x | Hooks only, sem class components |
| React Router | 6.x | `useNavigate`, `useParams` |
| Supabase JS | 2.x | `@supabase/supabase-js` |
| date-fns | 3.x | Para datas. Nunca `moment.js` |
| lucide-react | latest | Ícones. Apenas quando necessário |

---

## Estrutura de arquivos

```
src/
  components/
    <feature>/          # Um diretório por feature
      FeatureName.jsx   # PascalCase sempre
  hooks/
    useNomeCamelCase.js
  lib/
    supabase.js         # cliente singleton
    api.js              # todas as queries — nunca query fora daqui
    constants.js        # sem magic strings no código
  styles/
    globals.css         # design tokens via CSS variables
```

**Regras de nomenclatura:**
- Componentes: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Utilitários: `camelCase.js`
- Constantes: `UPPER_SNAKE_CASE`
- CSS vars: `--kebab-case`

---

## Componentes React

### Obrigatório
```jsx
// CORRETO: função nomeada exportada
export function MinhaPage() { ... }

// ERRADO: arrow function anônima como default export
export default () => { ... }
```

### Props
```jsx
// Sempre desestruturar props com defaults explícitos
export function Button({ children, variant = 'primary', disabled = false, onClick }) { ... }
```

### Estado
```jsx
// Estado local: useState
// Estado derivado: useMemo ou calcular inline
// Nunca duplicar estado que pode ser derivado de outro
const [students, setStudents] = useState([]);
const filtered = students.filter(s => s.name.includes(search)); // derivado, não estado
```

### Efeitos
```jsx
// useEffect com dependências explícitas sempre
// Extrair lógica de fetch para hooks customizados (src/hooks/)
useEffect(() => {
  fetchData();
}, [studentId]); // dependências obrigatórias
```

---

## Queries ao banco

**Regra de ouro: toda query fica em `src/lib/api.js`. Zero queries em componentes.**

```js
// CORRETO — em api.js
export const students = {
  list: () => supabase.from('students').select('*, modules(*)').eq('active', true),
};

// ERRADO — query direto no componente
const { data } = await supabase.from('students').select('*'); // proibido fora de api.js
```

### Tratamento de erro
```js
// Sempre desestruturar { data, error }
const { data, error } = await students.list();
if (error) {
  console.error('Erro ao buscar alunos:', error.message);
  setError(error.message);
  return;
}
```

---

## Estilização

**Regra: inline styles com CSS variables. Sem CSS Modules, sem Tailwind, sem styled-components.**

```jsx
// CORRETO
<div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20 }}>

// ERRADO
<div className="bg-white rounded-xl p-5">  // sem Tailwind
<div className={styles.container}>         // sem CSS Modules
```

### Design tokens disponíveis (globals.css)
```
Cores de fundo:   --bg, --surface, --surface-2
Bordas:           --border
Texto:            --text, --text-2, --text-3
Disciplinas:      --piano, --piano-bg, --robotica, --robotica-bg, ...
Alertas:          --danger, --danger-bg, --warning, --warning-bg, --success, --success-bg
Layout:           --sidebar-w (220px)
Formas:           --radius (12px), --radius-sm (8px)
Sombras:          --shadow, --shadow-md
```

### Componentes shared prontos (usar sempre antes de criar novo)
```
Button      → src/components/shared/Button.jsx
Card        → src/components/shared/Card.jsx
Modal       → src/components/shared/Modal.jsx
Input       → src/components/shared/Input.jsx
Textarea    → src/components/shared/Input.jsx
Select      → src/components/shared/Input.jsx
Loading     → src/components/shared/Loading.jsx
EmptyState  → src/components/shared/Loading.jsx
DisciplineBadge → src/components/shared/Badge.jsx
AlertBadge  → src/components/shared/Badge.jsx
```

---

## Autenticação e segurança

- Toda rota do professor é protegida por `<ProtectedRoute>` em `App.js`
- Responsável **nunca** acessa rotas do professor
- Row Level Security (RLS) está ativo no Supabase — nunca desativar
- `REACT_APP_SUPABASE_ANON_KEY` é pública por design — não é segredo
- Nunca commitar `.env` (está no `.gitignore`)

---

## Datas

```js
// Sempre usar date-fns com locale ptBR
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

format(new Date(c.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
// → "15 de março de 2025"

// Data de hoje para inserção no banco
format(new Date(), 'yyyy-MM-dd')
// → "2025-03-15"
```

---

## Padrões proibidos

```jsx
// ❌ Nunca: index como key em listas que mudam
items.map((item, i) => <div key={i}>)

// ✅ Sempre: ID único
items.map(item => <div key={item.id}>)

// ❌ Nunca: mutation direta de estado
state.items.push(newItem);

// ✅ Sempre: novo array/objeto
setItems(prev => [...prev, newItem]);

// ❌ Nunca: console.log em produção (usar só durante dev)
// ✅ Remover antes de commitar

// ❌ Nunca: texto hardcoded de disciplina
if (module.type === 'piano') { ... }

// ✅ Sempre: usar constants.js
import { DISCIPLINES } from '../../lib/constants';
```

---

## Git

```
feat: adiciona registro de aula
fix: corrige filtro de alunos inativos
refactor: extrai lógica de Khan para hook
docs: atualiza README com instrução de deploy
```

Branches:
- `main` → produção (protegida)
- `dev` → integração
- `feat/nome-da-feature` → desenvolvimento
