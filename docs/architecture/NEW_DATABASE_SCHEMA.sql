-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
  CONSTRAINT classes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT classes_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
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
  CONSTRAINT khan_profiles_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.khan_subtopics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  khan_topic_id uuid NOT NULL,
  name text NOT NULL,
  url text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT khan_subtopics_pkey PRIMARY KEY (id),
  CONSTRAINT khan_subtopics_khan_topic_id_fkey FOREIGN KEY (khan_topic_id) REFERENCES public.khan_topics(id)
);
CREATE TABLE public.khan_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  khan_profile_id uuid NOT NULL,
  name text NOT NULL,
  url text,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT khan_topics_pkey PRIMARY KEY (id),
  CONSTRAINT khan_topics_khan_profile_id_fkey FOREIGN KEY (khan_profile_id) REFERENCES public.khan_profiles(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  discipline text NOT NULL,
  name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT fk_modules_discipline FOREIGN KEY (discipline) REFERENCES public.disciplines(key)
);
CREATE TABLE public.parent_student (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT parent_student_pkey PRIMARY KEY (id),
  CONSTRAINT parent_student_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES auth.users(id),
  CONSTRAINT parent_student_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'teacher'::text CHECK (role = ANY (ARRAY['teacher'::text, 'parent'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  discipline text NOT NULL,
  percent integer DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
  notes text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT progress_pkey PRIMARY KEY (id),
  CONSTRAINT progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  type text DEFAULT 'full'::text,
  content jsonb,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
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
  CONSTRAINT schedules_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT schedules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer,
  school text,
  parent_email text,
  active boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id)
);