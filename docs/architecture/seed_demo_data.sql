-- ============================================================================
-- MAMUTE - Seed Script: Demo Data (Consolidated & Updated Schema)
-- ============================================================================
-- Execute in Supabase SQL Editor
-- Teacher 1 (Admin Global): carlos.cadilhe@gmail.com (aa8065b3-af14-4a57-be43-4dae9809672d)
-- Teacher 2 (Local Centro): professor.centro@email.com (aa8065b3-af14-4a57-be43-4dae9809672e)
-- Parents: 6 dummy auth.users (cannot log in, for FK/RLS only)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Units (Unidades de Ensino)
-- ============================================================================
INSERT INTO public.units (id, name)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Unidade Centro'),
  ('a0000000-0000-0000-0000-000000000002', 'Unidade Sul')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. Disciplines (Disciplinas)
-- ============================================================================
INSERT INTO public.disciplines (key, label, color, bg_color, active)
VALUES
  ('piano',      'Piano',      '#3B82F6', '#EFF6FF', true),
  ('robotica',   'Robótica',   '#10B981', '#ECFDF5', true),
  ('matematica', 'Matemática', '#F59E0B', '#FFFBEB', true),
  ('ingles',     'Inglês',     '#8B5CF6', '#F5F3FF', true),
  ('bateria',    'Bateria',    '#EC4899', '#FDF2F8', true),
  ('reforco',    'Reforço',    '#F97316', '#FFF7ED', true)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 3. Teachers & Profiles
-- ============================================================================
-- Carlos Cadilhe (Super-Admin/Global)
INSERT INTO public.profiles (id, full_name, role, email, unit_id)
VALUES ('aa8065b3-af14-4a57-be43-4dae9809672d', 'Carlos Cadilhe', 'teacher', 'carlos.cadilhe@gmail.com', NULL)
ON CONFLICT (id) DO UPDATE SET role = 'teacher', full_name = 'Carlos Cadilhe', email = 'carlos.cadilhe@gmail.com', unit_id = NULL;

-- Fernando (Super-Admin/Global)
INSERT INTO public.profiles (id, full_name, role, email, unit_id)
VALUES ('10557044-0336-4594-b5cb-dda133fffd5e', 'Fernando', 'teacher', 'fernando@escolamamute.com.br', NULL)
ON CONFLICT (id) DO UPDATE SET role = 'teacher', full_name = 'Fernando', email = 'fernando@escolamamute.com.br', unit_id = NULL;

-- Professor Centro (Local Centro)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        raw_app_meta_data, raw_user_meta_data, email_confirmed_at,
                        created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'aa8065b3-af14-4a57-be43-4dae9809672e',
   'authenticated', 'authenticated', 'professor.centro@email.com', 'x',
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Professor Centro","role":"teacher"}'::jsonb, now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, email, unit_id)
VALUES ('aa8065b3-af14-4a57-be43-4dae9809672e', 'Professor Centro', 'teacher', 'professor.centro@email.com', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET role = 'teacher', full_name = 'Professor Centro', email = 'professor.centro@email.com', unit_id = 'a0000000-0000-0000-0000-000000000001';

-- ============================================================================
-- 4. Dummy parent auth.users (will auto-create profiles through trigger)
-- ============================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        raw_app_meta_data, raw_user_meta_data, email_confirmed_at,
                        created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'ana.silva@email.com', 'x',
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Ana Silva","role":"parent"}'::jsonb, now(), now(), now()),

  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'pedro.santos@email.com', 'x',
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Pedro Santos","role":"parent"}'::jsonb, now(), now(), now()),

  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated', 'mariana.costa@email.com', 'x',
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Mariana Costa","role":"parent"}'::jsonb, now(), now(), now()),

  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000004',
   'authenticated', 'authenticated', 'joao.oliveira@email.com', 'x',
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"João Oliveira","role":"parent"}'::jsonb, now(), now(), now()),

  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000005',
   'authenticated', 'authenticated', 'fernanda.lima@email.com', 'x',
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Fernanda Lima","role":"parent"}'::jsonb, now(), now(), now()),

  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000006',
   'authenticated', 'authenticated', 'roberto.alves@email.com', 'x',
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Roberto Alves","role":"parent"}'::jsonb, now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Populate emails in profiles (since trigger only populates full_name and role)
UPDATE public.profiles SET email = 'ana.silva@email.com' WHERE id = 'b0000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET email = 'pedro.santos@email.com' WHERE id = 'b0000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET email = 'mariana.costa@email.com' WHERE id = 'b0000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET email = 'joao.oliveira@email.com' WHERE id = 'b0000000-0000-0000-0000-000000000004';
UPDATE public.profiles SET email = 'fernanda.lima@email.com' WHERE id = 'b0000000-0000-0000-0000-000000000005';
UPDATE public.profiles SET email = 'roberto.alves@email.com' WHERE id = 'b0000000-0000-0000-0000-000000000006';

-- ============================================================================
-- 5. Students (10 students)
-- ============================================================================
INSERT INTO public.students (id, name, age, school, parent_email, active, notes, monthly_fee, due_day, unit_id)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Lucas Silva',       8,  'Escola Municipal Santos Dumont', 'ana.silva@email.com',     true,  'Gosta muito de piano, tem facilidade com música', 350.00, 10, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Julia Silva',       10, 'Escola Municipal Santos Dumont', 'ana.silva@email.com',     true,  'Dificuldade em matemática, precisa de reforço em inglês', 350.00, 10, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'Gabriel Santos',    7,  'Colégio São José',               'pedro.santos@email.com',  true,  'Adora robótica, muito criativo', 400.00, 5, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000004', 'Sofia Santos',      12, 'Colégio São José',               'pedro.santos@email.com',  true,  'Focada, quer aprender bateria', 450.00, 5, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000005', 'Miguel Costa',      9,  'Escola Nova Geração',            'mariana.costa@email.com', true,  'Curioso, começou robótica recentemente', 380.00, 15, 'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000006', 'Laura Costa',       11, 'Escola Nova Geração',            'mariana.costa@email.com', true,  'Boa aluna, dedicada aos estudos', 380.00, 15, 'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000007', 'Pedro Oliveira',    6,  'Escola Infantil Pequeno Mundo',  'joao.oliveira@email.com', true,  'O mais novo da turma, muita energia', 320.00, 20, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000008', 'Beatriz Lima',      13, 'Colégio Anglo',                  'fernanda.lima@email.com', true,  'Preparação para vestibular, foco em matemática e inglês', 480.00, 10, 'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000009', 'Rafael Lima',       8,  'Colégio Anglo',                  'fernanda.lima@email.com', true,  'Hiperativo, bateria ajuda na concentration', 420.00, 10, 'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000010', 'Alice Alves',       15, 'Instituto Federal',               'roberto.alves@email.com', true,  'Quer seguir carreira em tecnologia', 500.00, 25, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, age = EXCLUDED.age, school = EXCLUDED.school, 
  parent_email = EXCLUDED.parent_email, active = EXCLUDED.active, notes = EXCLUDED.notes,
  monthly_fee = EXCLUDED.monthly_fee, due_day = EXCLUDED.due_day, unit_id = EXCLUDED.unit_id;

-- ============================================================================
-- 6. Parent-Student associations
-- ============================================================================
INSERT INTO public.parent_student (parent_id, student_id)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000008'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000009'),
  ('b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000010')
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- ============================================================================
-- 7. Modules
-- ============================================================================
INSERT INTO public.modules (id, student_id, discipline, name, active)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'piano',      'Piano',      true),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'matematica', 'Matemática', true),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'ingles',     'Inglês',     true),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'reforco',    'Reforço',    true),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'robotica',   'Robótica',   true),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000004', 'ingles',     'Inglês',     true),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004', 'matematica', 'Matemática', true),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000004', 'bateria',    'Bateria',    true),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005', 'piano',      'Piano',      true),
  ('d0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-000000000005', 'robotica',   'Robótica',   true),
  ('d0000000-0000-0000-0000-00000000000b', 'c0000000-0000-0000-0000-000000000006', 'matematica', 'Matemática', true),
  ('d0000000-0000-0000-0000-00000000000c', 'c0000000-0000-0000-0000-000000000006', 'ingles',     'Inglês',     true),
  ('d0000000-0000-0000-0000-00000000000d', 'c0000000-0000-0000-0000-000000000006', 'reforco',    'Reforço',    true),
  ('d0000000-0000-0000-0000-00000000000e', 'c0000000-0000-0000-0000-000000000007', 'robotica',   'Robótica',   true),
  ('d0000000-0000-0000-0000-00000000000f', 'c0000000-0000-0000-0000-000000000008', 'ingles',     'Inglês',     true),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000008', 'matematica', 'Matemática', true),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000008', 'piano',      'Piano',      true),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000009', 'bateria',    'Bateria',    true),
  ('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000009', 'reforco',    'Reforço',    true),
  ('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000010', 'matematica', 'Matemática', true),
  ('d0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000010', 'ingles',     'Inglês',     true),
  ('d0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000010', 'robotica',   'Robótica',   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. Classes (Activity logs)
-- ============================================================================
INSERT INTO public.classes (student_id, module_id, date, content, pending, next_step)
VALUES
  -- Lucas - Piano
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', CURRENT_DATE - 28, 'Escala de Dó maior - mão direita',          'Treinar escala 10 min/dia',                       'Introduzir mão esquerda'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', CURRENT_DATE - 21, 'Escala de Dó maior - mão esquerda',        'Coordenar as duas mãos lentamente',               'Juntar as duas mãos'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', CURRENT_DATE - 14, 'Escala com as duas mãos - início',          'Praticar compasso 4/4',                           'Aumentar velocidade gradualmente'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', CURRENT_DATE - 7,  'Escala completa - duas mãos',               NULL,                                              'Iniciar "Für Elise" simplificado'),
  -- Lucas - Matemática
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', CURRENT_DATE - 25, 'Tabuada do 6 e 7',                          'Reforçar tabuada do 7',                           'Tabuada do 8'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', CURRENT_DATE - 18, 'Tabuada do 8 e 9',                          'Exercícios página 34',                            'Introduzir divisão simples'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', CURRENT_DATE - 4,  'Divisão por 2 e 3',                         'Folha de exercícios extra',                       'Divisão por 4 e 5'),

  -- Julia - Inglês
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', CURRENT_DATE - 20, 'Verb to be - present',                      'Completar exercícios livro p.22',                 'Verb to be - negative'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', CURRENT_DATE - 13, 'Verb to be - negative and questions',        'Escrever 5 frases com verb to be',                'Present continuous'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', CURRENT_DATE - 6,  'Present continuous - affirmative',           NULL,                                              'Present continuous - negative'),
  -- Julia - Reforço
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', CURRENT_DATE - 22, 'Reforço de frações - soma e subtração',       'Revisar denominador comum',                       'Multiplicação de frações'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', CURRENT_DATE - 8,  'Reforço de português - crase',               'Lista de exercícios - 20 frases',                 'Regência verbal'),

  -- Gabriel - Robótica
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', CURRENT_DATE - 19, 'Introdução ao Scratch',                      'Criar animação simples no Scratch',               'Movimento de personagens'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', CURRENT_DATE - 12, 'Scratch - movimentos e loops',               'Jogo de labirinto simples',                       'Variáveis no Scratch'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', CURRENT_DATE - 5,  'Scratch - variáveis e pontuação',            NULL,                                              'Introdução ao Arduino LED blink'),

  -- Sofia - Inglês
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006', CURRENT_DATE - 15, 'Simple past - regular verbs',                'Lista de verbos regulares para memorizar',        'Simple past - irregular verbs'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006', CURRENT_DATE - 1,  'Simple past - irregular verbs',              'Exercícios com was/were',                         'Reading comprehension'),
  -- Sofia - Matemática
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007', CURRENT_DATE - 17, 'Equações de 1º grau',                        'Resolver 10 equações',                            'Sistemas de equações'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007', CURRENT_DATE - 3,  'Sistemas de equações - método da adição',     'Resolver sistema pelo método da substituição',    'Geometria - ângulos'),
  -- Sofia - Bateria
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008', CURRENT_DATE - 26, 'Postura e empunhadura de baquetas',           'Exercício de single stroke roll',                 'Rudimentos básicos'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008', CURRENT_DATE - 19, 'Rudimentos: single e double stroke',           'Praticar com metrônomo 60bpm',                   'Paradiddle'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008', CURRENT_DATE - 5,  'Paradiddle e combinações',                   NULL,                                              'Primeiro ritmo: rock básico'),

  -- Miguel - Piano
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000009', CURRENT_DATE - 23, 'Notas musicais - clave de sol',               'Identificar notas na pauta',                      'Pentacorde de Dó'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000009', CURRENT_DATE - 16, 'Pentacorde de Dó - dedilhado',                'Praticar mão direita 5 min/dia',                  'Mão esquerda'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000009', CURRENT_DATE - 2,  'Primeira música: Brilha Brilha Estrelinha',   NULL,                                              'Escala de Dó maior'),
  -- Miguel - Robótica
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-00000000000a', CURRENT_DATE - 24, 'O que é um robô? Componentes básicos',         'Desenhar seu robô ideal',                         'Introdução ao kit LEGO'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-00000000000a', CURRENT_DATE - 10, 'Kit LEGO - montagem do robô base',            'Terminar montagem em casa',                       'Primeiro programa: andar para frente'),

  -- Laura - Matemática
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000b', CURRENT_DATE - 27, 'Frações equivalentes',                        'Lista de exercícios página 56',                   'Comparação de frações'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000b', CURRENT_DATE - 20, 'Comparação e ordenação de frações',            'Jogo online de frações',                          'Números decimais'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000b', CURRENT_DATE - 6,  'Números decimais - décimos e centésimos',      NULL,                                              'Operações com decimais'),
  -- Laura - Inglês
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000c', CURRENT_DATE - 24, 'Prepositions of place',                       'Desenhar quarto e descrever em inglês',           'Prepositions of time'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000c', CURRENT_DATE - 3,  'Prepositions of time + there is/are',         'Exercícios do workbook',                          'Describing people'),
  -- Laura - Reforço
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000d', CURRENT_DATE - 21, 'Interpretação de texto',                      'Ler capítulo 3 do livro paradidático',            'Resumo e fichamento'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000d', CURRENT_DATE - 7,  'Redação - texto dissertativo',                'Escrever redação sobre meio ambiente',            'Revisão gramatical'),

  -- Pedro - Robótica
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-00000000000e', CURRENT_DATE - 18, 'Cores e formas com robô',                     'Brincar com app de blocos lógicos',               'Sequências simples'),
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-00000000000e', CURRENT_DATE - 11, 'Sequência de cores - padrões',                'Criar sequência com 5 cores',                     'Introdução a botões'),
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-00000000000e', CURRENT_DATE - 4,  'Robô segue linha - introdução',               NULL,                                              'Sensor de cor'),

  -- Beatriz - Inglês
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-00000000000f', CURRENT_DATE - 14, 'Conditionals - first and second',              'Escrever 10 frases condicionais',                 'Third conditional'),
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-00000000000f', CURRENT_DATE - 2,  'Third conditional + wish clauses',            'Exercícios de fixação ENEM',                      'Reading - texto científico'),
  -- Beatriz - Matemática
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000010', CURRENT_DATE - 16, 'Função quadrática - vértice',                  'Resolver 5 problemas de máximo e mínimo',         'Função exponencial'),
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000010', CURRENT_DATE - 4,  'Função exponencial - gráfico',                'Lista de exercícios ENEM 2024',                   'Logaritmos'),
  -- Beatriz - Piano
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000011', CURRENT_DATE - 22, 'Acordes maiores e menores',                    'Praticar sequência C - Am - F - G',               'Inversão de acordes'),
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000011', CURRENT_DATE - 9,  'Inversão de acordes e acompanhamento',         NULL,                                              'Leitura de cifras'),

  -- Rafael - Bateria
  ('c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000012', CURRENT_DATE - 20, 'Apresentação das peças da bateria',             'Nomear cada peça corretamente',                   'Ritmo básico no chimbal'),
  ('c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000012', CURRENT_DATE - 6,  'Ritmo básico: chimbal + caixa',               'Praticar 5 minutos com metrônomo',                'Adicionar bumbo'),
  -- Rafael - Reforço
  ('c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000013', CURRENT_DATE - 18, 'Alfabetização - sílabas complexas',             'Leitura de palavras com LH e NH',                 'Formação de frases'),
  ('c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000013', CURRENT_DATE - 4,  'Matemática - soma e subtração até 20',         'Jogo de matemática online',                      'Problemas simples'),

  -- Alice - Matemática
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000014', CURRENT_DATE - 29, 'Trigonometria - seno e cosseno',               'Tabela de ângulos notáveis para decorar',         'Lei dos senos'),
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000014', CURRENT_DATE - 15, 'Lei dos senos e cossenos',                     'Resolver triângulo qualquer',                     'Ciclo trigonométrico'),
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000014', CURRENT_DATE - 1,  'Ciclo trigonométrico completo',                NULL,                                              'Funções trigonométricas'),
  -- Alice - Inglês
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000015', CURRENT_DATE - 25, 'Passive voice - all tenses',                   'Transformar 10 frases para voz passiva',          'Reported speech'),
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000015', CURRENT_DATE - 8,  'Reported speech - statements',                 'Exercícios de reported speech',                   'Reported questions'),
  -- Alice - Robótica
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000016', CURRENT_DATE - 26, 'Arduino - sensores analógicos',                'Ler valor do potenciômetro no serial monitor',    'Sensor de tempo de resposta'),
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000016', CURRENT_DATE - 12, 'Sensor de temperatura e LCD',                  'Montar circuito no Tinkercad',                    'Motor DC com driver'),
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000016', CURRENT_DATE - 2,  'Motor DC - controle de velocidade',            NULL,                                              'Projeto: carrinho seguidor de linha')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 9. Progress
-- ============================================================================
INSERT INTO public.progress (student_id, discipline, percent, notes)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'piano',      45, 'Bom desenvolvimento, coordenação motora evoluindo'),
  ('c0000000-0000-0000-0000-000000000001', 'matematica', 60, 'Domina tabuada, iniciando divisão'),
  ('c0000000-0000-0000-0000-000000000002', 'ingles',     35, 'Dificuldade com verbos irregulares'),
  ('c0000000-0000-0000-0000-000000000002', 'reforco',    40, 'Melhorou em frações, mas crase ainda confunde'),
  ('c0000000-0000-0000-0000-000000000003', 'robotica',   30, 'Muito entusiasmado, aprende rápido'),
  ('c0000000-0000-0000-0000-000000000004', 'ingles',     55, 'Bom domínio de simple past'),
  ('c0000000-0000-0000-0000-000000000004', 'matematica', 50, 'Equações resolvidas com segurança'),
  ('c0000000-0000-0000-0000-000000000004', 'bateria',    25, 'Rudimentos básicos ok, precisa melhorar ritmo'),
  ('c0000000-0000-0000-0000-000000000005', 'piano',      20, 'Reconhece notas, começando músicas simples'),
  ('c0000000-0000-0000-0000-000000000005', 'robotica',   15, 'Fase de conceitos básicos'),
  ('c0000000-0000-0000-0000-000000000006', 'matematica', 65, 'Frações consolidadas, boa em decimais'),
  ('c0000000-0000-0000-0000-000000000006', 'ingles',     45, 'Prepositions ok, iniciando there is/are'),
  ('c0000000-0000-0000-0000-000000000006', 'reforco',    50, 'Boa interpretação, redação em desenvolvimento'),
  ('c0000000-0000-0000-0000-000000000007', 'robotica',   10, 'Iniciante, descobrindo o mundo da robótica'),
  ('c0000000-0000-0000-0000-000000000008', 'ingles',     70, 'Condicionais dominados, pronta para avançar'),
  ('c0000000-0000-0000-0000-000000000008', 'matematica', 60, 'Função quadrática ok, exponencial em andamento'),
  ('c0000000-0000-0000-0000-000000000008', 'piano',      40, 'Acordes básicos dominados, iniciando inversões'),
  ('c0000000-0000-0000-0000-000000000009', 'bateria',    15, 'Conhece as peças, iniciando ritmos'),
  ('c0000000-0000-0000-0000-000000000009', 'reforco',    30, 'Sílabas complexas em desenvolvimento'),
  ('c0000000-0000-0000-0000-000000000010', 'matematica', 75, 'Trigonometria avançando bem'),
  ('c0000000-0000-0000-0000-000000000010', 'ingles',     65, 'Passive voice ok, reported speech em andamento'),
  ('c0000000-0000-0000-0000-000000000010', 'robotica',   55, 'Sensores dominados, partindo para motores')
ON CONFLICT (student_id, discipline) DO UPDATE SET
  percent = EXCLUDED.percent, notes = EXCLUDED.notes;

-- ============================================================================
-- 10. Schedules (weekly grid) 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb 7=Dom
-- ============================================================================
INSERT INTO public.schedules (student_id, module_id, day_of_week, start_time, end_time, active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1, '14:00', '15:00', true),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 3, '10:00', '11:00', true),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 2, '15:00', '16:00', true),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 4, '09:00', '10:00', true),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', 3, '14:00', '15:30', true),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006', 2, '10:00', '11:00', true),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007', 4, '14:00', '15:00', true),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008', 5, '16:00', '17:00', true),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000009', 1, '16:00', '17:00', true),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-00000000000a', 3, '15:30', '17:00', true),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000b', 2, '09:00', '10:00', true),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000c', 3, '14:00', '15:00', true),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-00000000000d', 5, '10:00', '11:00', true),
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-00000000000e', 4, '15:00', '16:00', true),
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-00000000000f', 2, '16:00', '17:30', true),
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000010', 4, '10:00', '11:30', true),
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000011', 6, '09:00', '10:00', true),
  ('c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000012', 3, '16:00', '17:00', true),
  ('c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000013', 5, '14:00', '15:00', true),
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000014', 1, '15:00', '16:30', true),
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000015', 3, '10:00', '11:00', true),
  ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000016', 5, '15:00', '16:30', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 11. Khan Academy integration (profiles, topics, subtopics)
-- ============================================================================
INSERT INTO public.khan_profiles (id, student_id, khan_username, profile_url, streak_days, minutes_week, last_activity)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'lucas_silva2024', 'https://pt.khanacademy.org/profile/lucas_silva2024',  12, 90,  CURRENT_DATE - 1),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 'sofia_batera',     'https://pt.khanacademy.org/profile/sofia_batera',      21, 120, CURRENT_DATE - 2),
  ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', 'laura_estudos',    'https://pt.khanacademy.org/profile/laura_estudos',     8,  75,  CURRENT_DATE - 3),
  ('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008', 'beatriz_enem',     'https://pt.khanacademy.org/profile/beatriz_enem',      30, 150, CURRENT_DATE),
  ('e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010', 'alice_tech',       'https://pt.khanacademy.org/profile/alice_tech',        15, 200, CURRENT_DATE - 1)
ON CONFLICT (student_id) DO UPDATE SET 
  khan_username = EXCLUDED.khan_username, profile_url = EXCLUDED.profile_url, 
  streak_days = EXCLUDED.streak_days, minutes_week = EXCLUDED.minutes_week, last_activity = EXCLUDED.last_activity;

INSERT INTO public.khan_topics (id, khan_profile_id, name, url, progress, "order")
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Aritmética - multiplicação', 'https://pt.khanacademy.org/math/arithmetic/multiplication', 70, 1),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Aritmética - divisão',      'https://pt.khanacademy.org/math/arithmetic/division',       45, 2),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'Álgebra - equações',        'https://pt.khanacademy.org/math/algebra/equations',        65, 1),
  ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'Álgebra - sistemas',        'https://pt.khanacademy.org/math/algebra/systems',          40, 2),
  ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 'Inglês - grammar',          'https://pt.khanacademy.org/humanities/grammar',            50, 3),
  ('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 'Frações',                  'https://pt.khanacademy.org/math/arithmetic/fractions',     80, 1),
  ('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003', 'Decimais',                 'https://pt.khanacademy.org/math/arithmetic/decimals',      60, 2),
  ('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004', 'Funções',                  'https://pt.khanacademy.org/math/algebra/functions',        75, 1),
  ('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000004', 'Exponencial e Logaritmos',  'https://pt.khanacademy.org/math/algebra2/logarithms',      55, 2),
  ('f0000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-000000000004', 'Trigonometria',            'https://pt.khanacademy.org/math/trigonometry',             60, 3),
  ('f0000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000005', 'Computer Science',         'https://pt.khanacademy.org/computing/cs',                  70, 1),
  ('f0000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-000000000005', 'Programação',              'https://pt.khanacademy.org/computing/programming',         45, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.khan_subtopics (khan_topic_id, name, url, completed)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Tabuada do 1 ao 5',   'https://pt.khanacademy.org/math/arithmetic/multiplication/tables1-5',   true),
  ('f0000000-0000-0000-0000-000000000001', 'Tabuada do 6 ao 10',  'https://pt.khanacademy.org/math/arithmetic/multiplication/tables6-10',  false),
  ('f0000000-0000-0000-0000-000000000002', 'Divisão exata',       'https://pt.khanacademy.org/math/arithmetic/division/exact',             true),
  ('f0000000-0000-0000-0000-000000000002', 'Divisão com resto',   'https://pt.khanacademy.org/math/arithmetic/division/remainder',         false),
  ('f0000000-0000-0000-0000-000000000003', 'Equações de 1 passo', 'https://pt.khanacademy.org/math/algebra/equations/one-step',           true),
  ('f0000000-0000-0000-0000-000000000003', 'Equações de 2 passos','https://pt.khanacademy.org/math/algebra/equations/two-steps',          true),
  ('f0000000-0000-0000-0000-000000000003', 'Equações com variáveis','https://pt.khanacademy.org/math/algebra/equations/variables',         false),
  ('f0000000-0000-0000-0000-000000000004', 'Método da substituição','https://pt.khanacademy.org/math/algebra/systems/substitution',        true),
  ('f0000000-0000-0000-0000-000000000004', 'Método da adição',    'https://pt.khanacademy.org/math/algebra/systems/addition',              false),
  ('f0000000-0000-0000-0000-000000000005', 'Nouns and pronouns',  'https://pt.khanacademy.org/humanities/grammar/nouns',                   true),
  ('f0000000-0000-0000-0000-000000000005', 'Verbs and tenses',    'https://pt.khanacademy.org/humanities/grammar/verbs',                   false),
  ('f0000000-0000-0000-0000-000000000006', 'Soma de frações',     'https://pt.khanacademy.org/math/arithmetic/fractions/add',              true),
  ('f0000000-0000-0000-0000-000000000006', 'Subtração de frações','https://pt.khanacademy.org/math/arithmetic/fractions/subtract',        true),
  ('f0000000-0000-0000-0000-000000000006', 'Multiplicação de frações','https://pt.khanacademy.org/math/arithmetic/fractions/multiply',     false),
  ('f0000000-0000-0000-0000-000000000007', 'Décimos',             'https://pt.khanacademy.org/math/arithmetic/decimals/tenths',            true),
  ('f0000000-0000-0000-0000-000000000007', 'Centésimos',          'https://pt.khanacademy.org/math/arithmetic/decimals/hundredths',        false),
  ('f0000000-0000-0000-0000-000000000008', 'Função afim',         'https://pt.khanacademy.org/math/algebra/functions/linear',             true),
  ('f0000000-0000-0000-0000-000000000008', 'Função quadrática',   'https://pt.khanacademy.org/math/algebra/functions/quadratic',          true),
  ('f0000000-0000-0000-0000-000000000009', 'Gráficos exponenciais','https://pt.khanacademy.org/math/algebra2/logarithms/graphs',          true),
  ('f0000000-0000-0000-0000-000000000009', 'Equações exponenciais','https://pt.khanacademy.org/math/algebra2/logarithms/equations',      false),
  ('f0000000-0000-0000-0000-000000000009', 'Logaritmos',          'https://pt.khanacademy.org/math/algebra2/logarithms/intro',             false),
  ('f0000000-0000-0000-0000-00000000000a', 'Seno e cosseno',      'https://pt.khanacademy.org/math/trigonometry/unit-circle/sine-cosine', true),
  ('f0000000-0000-0000-0000-00000000000a', 'Tangente',            'https://pt.khanacademy.org/math/trigonometry/unit-circle/tangent',     false),
  ('f0000000-0000-0000-0000-00000000000b', 'Algoritmos',          'https://pt.khanacademy.org/computing/cs/algorithms',                    true),
  ('f0000000-0000-0000-0000-00000000000b', 'Estruturas de dados', 'https://pt.khanacademy.org/computing/cs/data-structures',               true),
  ('f0000000-0000-0000-0000-00000000000b', 'Criptografia',        'https://pt.khanacademy.org/computing/cs/cryptography',                  false),
  ('f0000000-0000-0000-0000-00000000000c', 'Variáveis',           'https://pt.khanacademy.org/computing/programming/variables',            true),
  ('f0000000-0000-0000-0000-00000000000c', 'Loops',               'https://pt.khanacademy.org/computing/programming/loops',                false),
  ('f0000000-0000-0000-0000-00000000000c', 'Funções',             'https://pt.khanacademy.org/computing/programming/functions',            false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 12. Reports
-- ============================================================================
INSERT INTO public.reports (student_id, type, content, generated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'full', '{"piano":{"percent":45,"observations":"Bom progresso"},"matematica":{"percent":60,"observations":"Domina tabuada"}}'::jsonb, CURRENT_DATE - 15),
  ('c0000000-0000-0000-0000-000000000004', 'full', '{"ingles":{"percent":55,"observations":"Simple past ok"},"matematica":{"percent":50,"observations":"Equações ok"},"bateria":{"percent":25,"observations":"Iniciante"}}'::jsonb, CURRENT_DATE - 10),
  ('c0000000-0000-0000-0000-000000000008', 'full', '{"ingles":{"percent":70,"observations":"Avançando"},"matematica":{"percent":60,"observations":"Exponencial em andamento"},"piano":{"percent":40,"observations":"Acordes básicos ok"}}'::jsonb, CURRENT_DATE - 7),
  ('c0000000-0000-0000-0000-000000000010', 'full', '{"matematica":{"percent":75,"observations":"Trigonometria bem"},"ingles":{"percent":65,"observations":"Reported speech"},"robotica":{"percent":55,"observations":"Sensores ok"}}'::jsonb, CURRENT_DATE - 3),
  ('c0000000-0000-0000-0000-000000000006', 'monthly', '{"matematica":{"percent":65},"ingles":{"percent":45},"reforco":{"percent":50}}'::jsonb, CURRENT_DATE - 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 13. Payments (Billing data)
-- ============================================================================
INSERT INTO public.payments (student_id, due_date, amount, status, paid_at, amount_paid, notes)
VALUES
  -- Lucas Silva (R$ 350.00, vencimento dia 10)
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '15 days', 350.00, 'paid', CURRENT_DATE - INTERVAL '14 days', 350.00, 'Pagamento em dia via PIX'),
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '15 days', 350.00, 'pending', NULL, NULL, NULL),
  
  -- Julia Silva (R$ 350.00, vencimento dia 10)
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '15 days', 350.00, 'paid', CURRENT_DATE - INTERVAL '12 days', 350.00, 'Pagamento em atraso suave'),
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '15 days', 350.00, 'pending', NULL, NULL, NULL),

  -- Gabriel Santos (R$ 400.00, vencimento dia 5)
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '20 days', 400.00, 'paid', CURRENT_DATE - INTERVAL '20 days', 400.00, 'PIX'),
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE + INTERVAL '10 days', 400.00, 'pending', NULL, NULL, NULL),

  -- Sofia Santos (R$ 450.00, vencimento dia 5)
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '20 days', 450.00, 'paid', CURRENT_DATE - INTERVAL '20 days', 450.00, 'PIX'),
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE + INTERVAL '10 days', 450.00, 'pending', NULL, NULL, NULL),

  -- Miguel Costa (R$ 380.00, vencimento dia 15)
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '10 days', 380.00, 'overdue', NULL, NULL, 'Responsável informou que pagará com atraso'),

  -- Laura Costa (R$ 380.00, vencimento dia 15)
  ('c0000000-0000-0000-0000-000000000006', CURRENT_DATE - INTERVAL '10 days', 380.00, 'paid', CURRENT_DATE - INTERVAL '10 days', 380.00, 'Dinheiro'),

  -- Pedro Oliveira (R$ 320.00, vencimento dia 20)
  ('c0000000-0000-0000-0000-000000000007', CURRENT_DATE - INTERVAL '5 days', 320.00, 'paid', CURRENT_DATE - INTERVAL '5 days', 320.00, 'Transferência bancária'),

  -- Beatriz Lima (R$ 480.00, vencimento dia 10)
  ('c0000000-0000-0000-0000-000000000008', CURRENT_DATE - INTERVAL '15 days', 480.00, 'paid', CURRENT_DATE - INTERVAL '15 days', 480.00, 'PIX'),

  -- Rafael Lima (R$ 420.00, vencimento dia 10)
  ('c0000000-0000-0000-0000-000000000009', CURRENT_DATE - INTERVAL '15 days', 420.00, 'paid', CURRENT_DATE - INTERVAL '15 days', 420.00, 'PIX'),

  -- Alice Alves (R$ 500.00, vencimento dia 25)
  ('c0000000-0000-0000-0000-000000000010', CURRENT_DATE - INTERVAL '1 day', 500.00, 'pending', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================================
-- Verification (run after COMMIT)
-- ============================================================================
SELECT 'units' AS tbl, COUNT(*) FROM units
UNION ALL SELECT 'disciplines', COUNT(*) FROM disciplines
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'students', COUNT(*) FROM students
UNION ALL SELECT 'modules', COUNT(*) FROM modules
UNION ALL SELECT 'classes', COUNT(*) FROM classes
UNION ALL SELECT 'progress', COUNT(*) FROM progress
UNION ALL SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL SELECT 'parent_student', COUNT(*) FROM parent_student
UNION ALL SELECT 'khan_profiles', COUNT(*) FROM khan_profiles
UNION ALL SELECT 'khan_topics', COUNT(*) FROM khan_topics
UNION ALL SELECT 'khan_subtopics', COUNT(*) FROM khan_subtopics
UNION ALL SELECT 'reports', COUNT(*) FROM reports
UNION ALL SELECT 'payments', COUNT(*) FROM payments
ORDER BY tbl;
