-- Migration: Create disciplines table and migrate from hardcoded CHECK constraint
-- Execute this in Supabase SQL Editor

-- 1. Create disciplines table
CREATE TABLE disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed existing disciplines
INSERT INTO disciplines (key, label, color, bg_color) VALUES
  ('piano', 'Piano', '#3B82F6', '#EFF6FF'),
  ('robotica', 'Robótica', '#10B981', '#ECFDF5'),
  ('matematica', 'Matemática', '#F59E0B', '#FFFBEB'),
  ('ingles', 'Inglês', '#8B5CF6', '#F5F3FF'),
  ('bateria', 'Bateria', '#EC4899', '#FDF2F8'),
  ('reforco', 'Reforço', '#F97316', '#FFF7ED');

-- 3. Drop the old CHECK constraint on modules.discipline
--    (Run this first to find the constraint name if needed:
--     SELECT conname FROM pg_constraint WHERE conrelid = 'modules'::regclass AND contype = 'c';)
ALTER TABLE modules DROP CONSTRAINT IF EXISTS modules_discipline_check;

-- 4. Add FK from modules.discipline to disciplines.key
ALTER TABLE modules
  ADD CONSTRAINT fk_modules_discipline
  FOREIGN KEY (discipline) REFERENCES disciplines(key)
  ON DELETE RESTRICT;

-- 5. Enable RLS + policies
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_all_disciplines" ON disciplines
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

CREATE POLICY "parent_read_disciplines" ON disciplines
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'parent'));
