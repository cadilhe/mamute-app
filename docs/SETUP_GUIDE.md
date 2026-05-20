# Setup Guide — MAMUTE

Guia completo para configurar o ambiente do zero.

---

## Pré-requisitos

- Node.js 18+ instalado
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
2. Cole o conteúdo de `architecture/DATABASE_SCHEMA.md` (seção SQL Completo)
3. Execute com Run (Ctrl+Enter)
4. Verifique em Table Editor: devem aparecer ~11 tabelas

### 1.3 Pegar credenciais
Project Settings → API:
- **Project URL**: `https://xxxxxxxx.supabase.co`
- **anon public key**: `eyJ...` (chave longa)

### 1.4 Criar usuário professor
Authentication → Users → Add user:
- Email: email do professor
- Password: senha segura
- O profile é criado automaticamente pelo trigger

---

## 2. Projeto React — Setup local

### 2.1 Instalar dependências
```bash
cd mamute
npm install
```

### 2.2 Configurar variáveis de ambiente
Crie o arquivo `.env` na raiz do projeto:
```
REACT_APP_SUPABASE_URL=https://SEU-PROJETO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 2.3 Rodar em desenvolvimento
```bash
npm start
```
Acesse: http://localhost:3000

### 2.4 Login inicial
Use as credenciais do professor criadas no passo 1.4.

---

## 3. Deploy no Vercel

### 3.1 Subir para GitHub
```bash
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/seu-usuario/mamute.git
git push -u origin main
```

### 3.2 Importar no Vercel
1. vercel.com → New Project → Import Git Repository
2. Selecione o repositório `mamute`
3. Framework Preset: Create React App
4. Em Environment Variables, adicione:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
5. Deploy

Após o deploy, Vercel fornece uma URL pública (ex: `mamute.vercel.app`).

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
O sistema detecta o role e redireciona para a visão dos pais.

---

## 5. Variáveis de ambiente — referência completa

| Variável | Obrigatória | Onde pegar |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | Sim | Supabase → Project Settings → API |
| `REACT_APP_SUPABASE_ANON_KEY` | Sim | Supabase → Project Settings → API |

---

## 6. Troubleshooting

### "Variáveis de ambiente não configuradas"
→ Verifique se o arquivo `.env` existe na raiz (mesmo nível de `package.json`)
→ Reinicie o servidor de desenvolvimento após criar/editar `.env`

### Login não funciona
→ Verifique se o usuário foi criado em Authentication → Users
→ Verifique se as credenciais do Supabase estão corretas no `.env`

### Tabelas não aparecem
→ Verifique se o SQL foi executado com sucesso no SQL Editor
→ Veja em Table Editor → Public schema

### Responsável vê dados de outros alunos
→ RLS não está ativo — rode os comandos `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
→ Crie as policies conforme `architecture/DATABASE_SCHEMA.md`
