# Setup Guide — MAMUTE

Guia completo para configurar o ambiente de desenvolvimento e produção do zero.

---

## Pré-requisitos

- Node.js 18+ instalado
- Gerenciador de pacotes `pnpm` (`npm i -g pnpm`)
- Conta no Supabase (supabase.com)
- Conta no Vercel (vercel.com) — para deploy
- Git instalado

---

## 1. Supabase — Setup do banco

### 1.1 Criar projeto
1. Acesse supabase.com → New project
2. Name: `mamute`
3. Region: South America (São Paulo)
4. Salve a Database Password em lugar seguro

### 1.2 Rodar o schema
1. No menu lateral: SQL Editor → New query
2. Cole o conteúdo da seção **SQL Completo** do arquivo [DATABASE_SCHEMA.md](file:///d:/projects/react_projects/mamute-app/docs/architecture/DATABASE_SCHEMA.md)
3. Execute com Run (Ctrl+Enter)
4. Verifique em Table Editor: devem aparecer as tabelas (`units`, `disciplines`, `profiles`, `students`, `modules`, `classes`, `schedules`, `progress`, `reports`, `khan_profiles`, `khan_topics`, `khan_subtopics`, `parent_student`, `payments`)

### 1.3 Pegar credenciais
Project Settings → API:
- **Project URL**: `https://xxxxxxxx.supabase.co`
- **anon public key**: `eyJ...` (chave longa)

### 1.4 Criar usuário professor
Authentication → Users → Add user:
- Email: email do professor
- Password: senha segura
- O profile é criado automaticamente pelo trigger do banco com o role `'teacher'`

---

## 2. Projeto Next.js — Setup local

### 2.1 Instalar dependências
```bash
pnpm install
```

### 2.2 Configurar variáveis de ambiente
Crie o arquivo `.env` na raiz do projeto (copie do `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```
*Nota:* A chave `SUPABASE_SERVICE_ROLE_KEY` é necessária no servidor para gerenciar contas de usuários (professores/responsáveis) através da API administrativa.

### 2.3 Rodar em desenvolvimento
```bash
pnpm dev
```
Acesse: http://localhost:3000

### 2.4 Login inicial
Use as credenciais do professor criadas no passo 1.4.

---

## 3. Deploy no Vercel

### 3.1 Subir para GitHub
```bash
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/seu-usuario/mamute-app.git
git push -u origin main
```

### 3.2 Importar no Vercel
1. vercel.com → New Project → Import Git Repository
2. Selecione o repositório `mamute-app`
3. Framework Preset: **Next.js** (autodetectado)
4. Em Environment Variables, adicione:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy

Após o deploy, o Vercel fornece uma URL pública (ex: `mamute-app.vercel.app`).

---

## 4. Adicionar responsável (pai/mãe)

### 4.1 Criar conta do responsável
No Supabase: Authentication → Users → Add user
- Email: email do responsável
- Password: senha temporária (comunicar ao responsável)

### 4.2 Atualizar role para 'parent'
```sql
UPDATE profiles SET role = 'parent' WHERE id = 'uuid-do-usuario';
```

### 4.3 Vincular ao filho
```sql
INSERT INTO parent_student (parent_id, student_id)
VALUES ('uuid-do-responsavel', 'uuid-do-aluno');
```

O responsável acessa a URL do sistema normalmente.
O sistema detecta o role `'parent'` e renderiza o Portal dos Pais (/pais).

---

## 5. Variáveis de ambiente — referência completa

| Variável | Obrigatória | Onde pegar | Descrição |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Supabase → Project Settings → API | URL base do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Supabase → Project Settings → API | Chave pública anônima para requisições do cliente |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim (servidor) | Supabase → Project Settings → API | Chave privada de serviço com bypass de RLS (usada para gerenciar usuários) |

---

## 6. Troubleshooting

### "Variáveis de ambiente não configuradas no servidor" ou "Variáveis de ambiente do Supabase não configuradas"
→ Verifique se o arquivo `.env` existe na raiz (mesmo nível de `package.json`)
→ Certifique-se de que a variável `SUPABASE_SERVICE_ROLE_KEY` está configurada
→ Reinicie o servidor de desenvolvimento (Ctrl + C no terminal, depois `npm run dev`) após criar ou editar o `.env`

### Login não funciona
→ Verifique se o usuário foi criado em Authentication → Users
→ Verifique se as credenciais do Supabase estão corretas no `.env`

### Tabelas não aparecem
→ Verifique se o SQL foi executado com sucesso no SQL Editor
→ Veja em Table Editor → Public schema

### Responsável vê dados de outros alunos
→ RLS não está ativo — rode os comandos `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
→ Crie as policies conforme [DATABASE_SCHEMA.md](file:///d:/projects/react_projects/mamute-app/docs/architecture/DATABASE_SCHEMA.md)
