# MAMUTE — Sistema de Gestão de Ensino

## Stack
- **Frontend**: React 18
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Deploy**: Vercel

## Setup rápido

### 1. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```
REACT_APP_SUPABASE_URL=https://SEU-PROJETO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Rode o projeto
```bash
npm start
```
Acesse: http://localhost:3000

## Estrutura do projeto
```
src/
  components/
    auth/          # Login
    layout/        # Sidebar + Layout
    dashboard/     # Tela inicial
    students/      # Lista + Detalhe + Cadastro de aulas
    schedule/      # Agenda semanal
    overview/      # Visão geral com alertas
    khan/          # Integração Khan Academy
    reports/       # Modal de relatório + impressão
    parents/       # Portal dos responsáveis
    shared/        # Badge, Button, Card, Input, Modal, Loading
  hooks/
    useAuth.js     # Autenticação
    useStudents.js # Dados de alunos
    useClasses.js  # Dados de aulas
  lib/
    supabase.js    # Cliente Supabase
    api.js         # Todas as queries ao banco
    constants.js   # Disciplinas, cores, configurações
  styles/
    globals.css    # Design tokens + estilos base
  App.js           # Router principal
  index.js         # Entry point
```

## Deploy no Vercel
1. Suba o projeto para um repositório GitHub
2. Acesse vercel.com e importe o repositório
3. Configure as variáveis de ambiente no painel do Vercel
4. Deploy automático a cada push

## Primeiro usuário (professor)
No painel do Supabase:
1. Vá em **Authentication > Users**
2. Clique em **Invite user** ou **Add user**
3. Insira o email e senha do professor
4. O usuário aparecerá na tabela `profiles` automaticamente após o primeiro login

## Usuários dos pais
1. Crie o usuário do pai em Authentication > Users
2. No SQL Editor, vincule o pai ao filho:
```sql
INSERT INTO parent_student (parent_id, student_id)
VALUES ('uuid-do-pai', 'uuid-do-aluno');
```
