-- Migration: Create payments table and billing settings on students
-- Version: 002

-- 1. Add billing columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS due_day INTEGER CHECK (due_day BETWEEN 1 AND 31);

-- 2. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  paid_at DATE,
  amount_paid NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Teachers have full permissions
CREATE POLICY "teacher_all_payments" ON payments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Parents can only view their own child's payments
CREATE POLICY "parent_own_payments" ON payments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM parent_student ps
    JOIN profiles p ON p.id = auth.uid()
    WHERE ps.student_id = payments.student_id AND ps.parent_id = auth.uid() AND p.role = 'parent'
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
