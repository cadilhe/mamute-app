# Coding Rules — MAMUTE

Regras mandatórias para todo código gerado neste projeto.
Um agente de IA ou desenvolvedor deve seguir estas regras sem exceção.

---

## Stack e versões

| Tecnologia | Versão | Notas |
|---|---|---|
| Next.js | 14.x+ | App Router, rotas físicas, Route Groups |
| React | 18.x | Hooks only, sem Class Components |
| Supabase JS | 2.x | `@supabase/supabase-js` |
| Tailwind CSS | 3.x | Estilização principal por classes utilitárias |
| date-fns | 3.x | Para tratamento de datas. Nunca `moment.js` |
| lucide-react | latest | Pacote de ícones oficiais |

---

## Estrutura de arquivos

```
src/
  app/
    (app)/              # Grupo de rotas autenticadas (Dashboard, Alunos, Agenda, etc.)
      layout.js         # Layout privado (verifica auth +Sidebar)
      page.js           # Rota '/' (Dashboard)
      alunos/           # Rota '/alunos'
        page.js
        [id]/           # Rota '/alunos/:id'
          page.js
      agenda/           # Rota '/agenda'
        page.js
      visao-geral/      # Rota '/visao-geral'
        page.js
      pais/             # Rota '/pais' (Portal dos Pais)
        page.js
    (auth)/             # Grupo de rotas públicas de autenticação
      login/            # Rota '/login'
        page.js
    globals.css         # Importações do Tailwind + Variáveis CSS globais
    layout.js           # Layout global raiz
    providers.js        # Provedor do AuthProvider
  components/
    <feature>/          # Componentes específicos por funcionalidade
    shared/             # Componentes compartilhados reutilizáveis
  hooks/
    useNomeCamelCase.js # Hooks de cliente (ex: useAuth.js)
  lib/
    supabase.js         # Cliente singleton do Supabase
    api.js              # TODAS AS QUERIES — nunca faça queries fora daqui
    constants.js        # Constantes globais (ex: DISCIPLINES)
```

**Regras de nomenclatura:**
- Componentes e Páginas: `PascalCase.jsx` ou `page.js`
- Hooks: `useCamelCase.js`
- Utilitários/API: `camelCase.js`
- Constantes: `UPPER_SNAKE_CASE`
- Variáveis CSS: `--kebab-case`

---

## Componentes React

### Diretiva 'use client'
Em Next.js App Router, componentes e páginas que utilizam hooks de estado (`useState`, `useEffect`, `useContext`) ou do roteador de cliente devem possuir `'use client';` como primeira linha.

### Export Nomeado
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

### Estado derivado
```jsx
// Nunca duplicar estado que pode ser derivado de outro
const [students, setStudents] = useState([]);
const filtered = students.filter(s => s.name.includes(search)); // derivado, não estado
```

---

## Queries ao banco

**Regra de ouro: toda query fica em `src/lib/api.js`. Zero queries diretas em componentes.**

```js
// CORRETO — em api.js
export const students = {
  list: () => supabase.from('students').select('*, modules(*)').eq('active', true),
};

// ERRADO — query direto no componente
const { data } = await supabase.from('students').select('*'); // proibido fora de api.js
```

---

## Estilização

**Regra: Uso exclusivo do Tailwind CSS v3 e Variáveis CSS globais mapeadas no tailwind.config.js. Sem CSS Modules, sem estilos inline desnecessários.**

```jsx
// CORRETO
<div className="bg-surface rounded-xl p-5 border border-border">

// ERRADO
<div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20 }}>
```

### Design tokens estendidos do Tailwind (tailwind.config.js):
```
bg-bg              → Cor de fundo principal (#0f0f10)
bg-surface         → Fundo secundário (#17171a)
bg-surface-2       → Fundo terciário (#1e1e22)
border-border      → Cor das bordas (#2a2a30)
text-text          → Texto principal (#e8e8ed)
text-text-2        → Texto secundário (#8888a0)
text-text-3        → Texto desabilitado/discreto (#58586f)
text-danger / bg-danger-bg / border-danger     → Alerta de atenção
text-warning / bg-warning-bg / border-warning → Alerta de pendência
text-success / bg-success-bg / border-success → Alerta em dia
```

---

## Autenticação e segurança

- Toda rota protegida do professor e do responsável fica sob o grupo de rotas `(app)/` e é validada no [layout.js (Privado)](file:///d:/projects/react_projects/mamute-app/src/app/(app)/layout.js).
- Row Level Security (RLS) está ativo no Supabase — nunca desative ou ignore as policies.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` é pública por design.
- Nunca comite o arquivo `.env` (deve ser mantido no `.gitignore`).

---

## Datas

```js
// Sempre usar date-fns com locale ptBR
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

format(new Date(c.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
// → "15 de março de 2025"
```

---

## Git e Commits

Usar Commits Semânticos:
- `feat:` Novas funcionalidades.
- `fix:` Resolução de bugs.
- `security:` Alterações críticas de segurança ou RLS.
- `docs:` Criação ou ajuste de documentações.
- `refactor:` Ajustes de código estruturais sem alteração lógica.
