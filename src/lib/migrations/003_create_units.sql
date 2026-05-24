-- Migration: Create units table, associate students/profiles, and update RLS policies
-- Version: 003

-- 1. Create units table
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add unit_id to profiles and students
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES units(id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES units(id) ON DELETE SET NULL;

-- 3. Seed default unit
INSERT INTO units (name) VALUES ('Unidade Centro') ON CONFLICT DO NOTHING;

-- 4. Associate existing profiles (teachers) and students to the default unit
UPDATE profiles 
SET unit_id = (SELECT id FROM units WHERE name = 'Unidade Centro' LIMIT 1) 
WHERE role = 'teacher' AND unit_id IS NULL;

UPDATE students 
SET unit_id = (SELECT id FROM units WHERE name = 'Unidade Centro' LIMIT 1) 
WHERE unit_id IS NULL;

-- 5. Enable RLS on units table and create policies
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_read_all" ON units
  FOR SELECT TO authenticated
  USING (true);

-- Only global admin teachers (unit_id is null) can modify units
CREATE POLICY "units_admin_all" ON units
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'teacher' AND unit_id IS NULL
  ));

-- 6. Recreate or establish RLS policies for teachers on key tables to restrict by unit

-- Tabela: students
DROP POLICY IF EXISTS "teacher_unit_students" ON students;
CREATE POLICY "teacher_unit_students" ON students
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = students.unit_id)
  ));

-- Tabela: classes
DROP POLICY IF EXISTS "teacher_unit_classes" ON classes;
CREATE POLICY "teacher_unit_classes" ON classes
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN students s ON s.id = classes.student_id
    WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id)
  ));

-- Tabela: schedules
DROP POLICY IF EXISTS "teacher_unit_schedules" ON schedules;
CREATE POLICY "teacher_unit_schedules" ON schedules
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN students s ON s.id = schedules.student_id
    WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id)
  ));

-- Tabela: progress
DROP POLICY IF EXISTS "teacher_unit_progress" ON progress;
CREATE POLICY "teacher_unit_progress" ON progress
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN students s ON s.id = progress.student_id
    WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id)
  ));

-- Tabela: modules
DROP POLICY IF EXISTS "teacher_unit_modules" ON modules;
CREATE POLICY "teacher_unit_modules" ON modules
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN students s ON s.id = modules.student_id
    WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id)
  ));

-- Tabela: payments
DROP POLICY IF EXISTS "teacher_all_payments" ON payments;
DROP POLICY IF EXISTS "teacher_unit_payments" ON payments;
CREATE POLICY "teacher_unit_payments" ON payments
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN students s ON s.id = payments.student_id
    WHERE p.id = auth.uid() AND p.role = 'teacher' AND (p.unit_id IS NULL OR p.unit_id = s.unit_id)
  ));
