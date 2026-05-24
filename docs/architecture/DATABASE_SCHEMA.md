# Database Schema — MAMUTE

Schema completo do banco de dados PostgreSQL no Supabase.

---
## Diagrama de relacionamentos

```
      ┌──────────────────────────────────────────┐
      │                  units                   │ (Unidades de Ensino)
      └─────────┬──────────────────────┬─────────┘
                │ (1:N)                │ (1:N)
                ▼                      ▼
           profiles ◄──(1:1)──► auth.users (Supabase Auth)
                │
                ├── [role=teacher] (se unit_id for nulo: admin global; senão: local)
                │
                └── [role=parent] ── parent_student (vínculo de responsabilidade)
                                            │
                                            ▼
                                         students (Alunos)
                                            │
                             ┌──────────────┼──────────────┬──────────────┐
                             │              │              │              │
                          payments       modules        classes        progress
                        (Financeiro)        │          (Aulas)      (Progresso)
                                            ├── disciplines
                                            │
                                         schedules
                                            │
                                       khan_profiles
                                            │
                                       khan_topics
                                            │
                                      khan_subtopics
```

---

## SQL Completo

Abaixo está o script SQL consolidado que define a estrutura de tabelas, índices e Row Level Security (RLS) do MAMUTE:

```sql
-- ============================================================================
-- MAMUTE - CONSOLIDATED DATABASE SCHEMA
-- This schema represents the complete structure of the application database,
-- including the modules of students, scheduling, Khan Academy, billing/payments,
-- teaching units, user profiles, and Row Level Security (RLS) policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BASE TABLES (No Foreign Key dependencies)
-- ----------------------------------------------------------------------------

-- Teaching units (schools/franchises)
CREATE TABLE public.units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT units_pkey PRIMARY KEY (id)
);

-- Disciplines offered (e.g. Piano, Robotics, Math)
CREATE TABLE public.disciplines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  color text NOT NULL,
  bg_color text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT disciplines_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- 2. CORE SYSTEM TABLES
-- ----------------------------------------------------------------------------

-- User Profiles (Teachers, Global Admins, Parents)
-- Linked to Supabase Auth internal table auth.users
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'teacher'::text CHECK (role = ANY (ARRAY['teacher'::text, 'parent'::text])),
  email text,
  unit_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL
);

-- Students list
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer,
  school text,
  parent_email text,
  active boolean DEFAULT true,
  notes text,
  monthly_fee numeric(10, 2) DEFAULT 0.00,
  due_day integer CHECK (due_day BETWEEN 1 AND 31),
  unit_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 3. ACADEMIC AND CLASS LOGS MODULES
-- ----------------------------------------------------------------------------

-- Academic modules associated to students and disciplines
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  discipline text NOT NULL,
  name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT fk_modules_discipline FOREIGN KEY (discipline) REFERENCES public.disciplines(key) ON DELETE RESTRICT
);

-- Classes / daily activity records
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  module_id uuid,
  date date NOT NULL DEFAULT CURRENT_DATE,
  content text,
  pending text,
  next_step text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT classes_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE SET NULL
);

-- Class schedules / weekly grid
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  module_id uuid,
  day_of_week integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time time without time zone NOT NULL,
  end_time time without time zone,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT schedules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE SET NULL
);

-- Student academic progress metrics per discipline
CREATE TABLE public.progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  discipline text NOT NULL,
  percent integer DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
  notes text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT progress_pkey PRIMARY KEY (id),
  CONSTRAINT progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Generated class and progress reports
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  type text DEFAULT 'full'::text,
  content jsonb,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 4. KHAN ACADEMY TRACKING MODULES
-- ----------------------------------------------------------------------------

-- Khan Academy student profiles
CREATE TABLE public.khan_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE,
  khan_username text,
  profile_url text,
  streak_days integer DEFAULT 0,
  minutes_week integer DEFAULT 0,
  last_activity date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT khan_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT khan_profiles_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Khan Academy topics tracked for a profile
CREATE TABLE public.khan_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  khan_profile_id uuid NOT NULL,
  name text NOT NULL,
  url text,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT khan_topics_pkey PRIMARY KEY (id),
  CONSTRAINT khan_topics_khan_profile_id_fkey FOREIGN KEY (khan_profile_id) REFERENCES public.khan_profiles(id) ON DELETE CASCADE
);

-- Khan Academy subtopics/skills completed under a topic
CREATE TABLE public.khan_subtopics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  khan_topic_id uuid NOT NULL,
  name text NOT NULL,
  url text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT khan_subtopics_pkey PRIMARY KEY (id),
  CONSTRAINT khan_subtopics_khan_topic_id_fkey FOREIGN KEY (khan_topic_id) REFERENCES public.khan_topics(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 5. RELATIONSHIP AND BILLING MODULES
-- ----------------------------------------------------------------------------

-- Associative table: parent-to-student links
CREATE TABLE public.parent_student (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT parent_student_pkey PRIMARY KEY (id),
  CONSTRAINT parent_student_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT parent_student_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT parent_student_unique UNIQUE (parent_id, student_id)
);

-- Payments and monthly fees history
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  due_date date NOT NULL,
  amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['paid'::text, 'pending'::text, 'overdue'::text])),
  paid_at date,
  amount_paid numeric(10, 2),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 6. INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_unit_id ON public.profiles(unit_id);
CREATE INDEX IF NOT EXISTS idx_students_unit_id ON public.students(unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_classes_student_id ON public.classes(student_id);
CREATE INDEX IF NOT EXISTS idx_schedules_student_id ON public.schedules(student_id);

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khan_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khan_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- --- POLICIES FOR public.units ---
CREATE POLICY "units_read_all" ON public.units FOR SELECT TO authenticated USING (true);
CREATE POLICY "units_admin_all" ON public.units FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher' AND unit_id IS NULL)
);

-- --- POLICIES FOR public.disciplines ---
CREATE POLICY "disciplines_read_all" ON public.disciplines FOR SELECT TO authenticated USING (true);
CREATE POLICY "disciplines_admin_all" ON public.disciplines FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- --- POLICIES FOR public.profiles ---
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "admin_insert_profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher' AND unit_id IS NULL)
);
CREATE POLICY "admin_update_profiles" ON public.profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher' AND unit_id IS NULL)
);
CREATE POLICY "admin_delete_profiles" ON public.profiles FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher' AND unit_id IS NULL)
);

-- --- POLICIES FOR public.students ---
CREATE POLICY "teacher_unit_students" ON public.students FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = students.unit_id))
);
CREATE POLICY "parent_own_students" ON public.students FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps WHERE ps.student_id = id AND ps.parent_id = auth.uid())
);

-- --- POLICIES FOR public.modules ---
CREATE POLICY "teacher_unit_modules" ON public.modules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.students s ON s.id = student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_modules" ON public.modules FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps WHERE ps.student_id = student_id AND ps.parent_id = auth.uid())
);

-- --- POLICIES FOR public.classes ---
CREATE POLICY "teacher_unit_classes" ON public.classes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.students s ON s.id = student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_classes" ON public.classes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps WHERE ps.student_id = student_id AND ps.parent_id = auth.uid())
);

-- --- POLICIES FOR public.schedules ---
CREATE POLICY "teacher_unit_schedules" ON public.schedules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.students s ON s.id = student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_schedules" ON public.schedules FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps WHERE ps.student_id = student_id AND ps.parent_id = auth.uid())
);

-- --- POLICIES FOR public.progress ---
CREATE POLICY "teacher_unit_progress" ON public.progress FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.students s ON s.id = student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_progress" ON public.progress FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps WHERE ps.student_id = student_id AND ps.parent_id = auth.uid())
);

-- --- POLICIES FOR public.reports ---
CREATE POLICY "teacher_unit_reports" ON public.reports FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.students s ON s.id = student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_reports" ON public.reports FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps WHERE ps.student_id = student_id AND ps.parent_id = auth.uid())
);

-- --- POLICIES FOR public.payments ---
CREATE POLICY "teacher_unit_payments" ON public.payments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.students s ON s.id = student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_payments" ON public.payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps WHERE ps.student_id = student_id AND ps.parent_id = auth.uid())
);

-- --- POLICIES FOR public.parent_student ---
CREATE POLICY "teacher_all_links" ON public.parent_student FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "parent_own_links" ON public.parent_student FOR SELECT TO authenticated USING (parent_id = auth.uid());

-- --- POLICIES FOR public.khan_profiles, khan_topics, khan_subtopics ---
CREATE POLICY "teacher_unit_khan_p" ON public.khan_profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.students s ON s.id = student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_khan_p" ON public.khan_profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps WHERE ps.student_id = student_id AND ps.parent_id = auth.uid())
);

CREATE POLICY "teacher_unit_khan_t" ON public.khan_topics FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.khan_profiles kp ON kp.id = khan_profile_id JOIN public.students s ON s.id = kp.student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_khan_t" ON public.khan_topics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps JOIN public.khan_profiles kp ON kp.student_id = ps.student_id WHERE kp.id = khan_profile_id AND ps.parent_id = auth.uid())
);

CREATE POLICY "teacher_unit_khan_st" ON public.khan_subtopics FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.khan_topics kt ON kt.id = khan_topic_id JOIN public.khan_profiles kp ON kp.id = kt.khan_profile_id JOIN public.students s ON s.id = kp.student_id WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id))
);
CREATE POLICY "parent_own_khan_st" ON public.khan_subtopics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_student ps JOIN public.khan_profiles kp ON kp.student_id = ps.student_id JOIN public.khan_topics kt ON kt.khan_profile_id = kp.id WHERE kt.id = khan_topic_id AND ps.parent_id = auth.uid())
);
```
 p.id = auth.uid()
    WHERE ps.student_id = reports.student_id AND ps.parent_id = auth.uid() AND p.role = 'parent'
  ));
```
