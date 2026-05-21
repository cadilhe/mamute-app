# MAMUTE — Sistema de Gestão de Ensino

## Stack
- **Framework**: Next.js 14+ (App Router)
- **Frontend**: React 18
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Estilização**: Tailwind CSS v3
- **Gerenciador de Pacotes**: `pnpm`
- **Deploy**: Vercel

## Setup rápido

### 1. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Rode o projeto em desenvolvimento
```bash
pnpm dev
```
Acesse: http://localhost:3000

## Estrutura do projeto
```
src/
  app/
    (app)/         # Rotas privadas protegidas por autenticação
    (auth)/        # Rota de login pública
    globals.css    # Importações do Tailwind + Design tokens CSS
    layout.js      # Layout raiz do Next.js
    providers.js   # Wrapper do Provedor de Autenticação
  components/
    auth/          # Login
    layout/        # Sidebar + Componentes estruturais
    dashboard/     # Painel inicial
    students/      # Lista + Detalhe do aluno + Registro de aulas (com abas de controle segmentado)
    schedule/      # Agenda semanal
    overview/      # Visão geral de acompanhamento com alertas
    khan/          # Integração e abas da Khan Academy
    reports/       # Modais de relatórios e impressão de PDF
    shared/        # Componentes reutilizáveis (Badge, Button, Card, Input, Loading)
  hooks/
    useAuth.js     # Hook e contexto de autenticação
    useStudents.js # Hook para dados de alunos
    useClasses.js  # Hook para dados de aulas
    useDisciplines.js # Hook para contexto de disciplinas
  lib/
    supabase.js    # Cliente singleton do Supabase
    api.js         # Centralização de queries ao banco de dados (api.js)
```

## Deploy no Vercel
1. Suba o projeto para um repositório GitHub.
2. Acesse [vercel.com](https://vercel.com) e importe o repositório.
3. O preset do framework será detectado automaticamente como **Next.js**.
4. Em Environment Variables, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em Deploy.


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
