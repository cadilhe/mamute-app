# Como limpar os dados do Supabase

Para limpar todos os dados existentes no banco e no Supabase Auth de forma segura antes de rodar o novo seed, você pode executar o seguinte bloco SQL no **SQL Editor** do painel do Supabase:

```sql
BEGIN;

-- 1. Limpa todas as tabelas de negócio e seus relacionamentos de forma cascateada
TRUNCATE TABLE 
  public.units, 
  public.disciplines, 
  public.students, 
  public.modules, 
  public.classes, 
  public.schedules, 
  public.progress, 
  public.reports, 
  public.khan_profiles, 
  public.khan_topics, 
  public.khan_subtopics, 
  public.parent_student, 
  public.payments
RESTART IDENTITY CASCADE;

-- 2. Remove os usuários fictícios criados anteriormente do Supabase Auth
-- (Esta remoção limpa automaticamente os profiles associados via CASCADE)
DELETE FROM auth.users 
WHERE id IN (
  'aa8065b3-af14-4a57-be43-4dae9809672e', -- professor dummy
  'b0000000-0000-0000-0000-000000000001', -- responsável dummy 1
  'b0000000-0000-0000-0000-000000000002', -- responsável dummy 2
  'b0000000-0000-0000-0000-000000000003', -- responsável dummy 3
  'b0000000-0000-0000-0000-000000000004', -- responsável dummy 4
  'b0000000-0000-0000-0000-000000000005', -- responsável dummy 5
  'b0000000-0000-0000-0000-000000000006'  -- responsável dummy 6
);

COMMIT;
```

### O que este script faz:
- **`TRUNCATE ... CASCADE`**: Remove instantaneamente todos os dados das tabelas de negócio, ignorando e limpando as dependências de chaves estrangeiras sem precisar deletar tabela por tabela.
- **`DELETE FROM auth.users`**: Limpa apenas os usuários simulados de teste. A conta do professor administrador real (`aa8065b3-af14-4a57-be43-4dae9809672d`) **é preservada** para que você não perca seu login atual de desenvolvimento.