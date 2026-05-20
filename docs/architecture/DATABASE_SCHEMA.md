# Database Schema — MAMUTE

Schema completo do banco de dados PostgreSQL no Supabase.

---

## Diagrama de relacionamentos

```
auth.users (Supabase Auth)
    │
    └── profiles (1:1)
           │
           ├── [role=teacher] → acessa tudo
           │
           └── [role=parent] → parent_student → students
                                                    │
                                      ┌─────────────┼─────────────────┐
                                      │             │                 │
                                   modules       classes           progress
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

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'parent')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-criar profile após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 
          COALESCE(new.raw_user_meta_data->>'role', 'teacher'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### students
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  school TEXT,
  parent_email TEXT,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### modules
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL CHECK (discipline IN (
    'piano', 'robotica', 'matematica', 'ingles', 'bateria', 'reforco'
  )),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### classes
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT,
  pending TEXT,
  next_step TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_classes_student_id ON classes(student_id);
CREATE INDEX idx_classes_date ON classes(date);
```

### progress
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
  percent INTEGER DEFAULT 0 CHECK (percent BETWEEN 0 AND 100),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, discipline)
);
```

### schedules
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  -- 1=segunda, 2=terça, ..., 6=sábado, 7=domingo
  start_time TIME NOT NULL,
  end_time TIME,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### parent_student
```sql
CREATE TABLE parent_student (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, student_id)
);
```

### khan_profiles
```sql
CREATE TABLE khan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  khan_username TEXT,
  profile_url TEXT,
  streak_days INTEGER DEFAULT 0,
  minutes_week INTEGER DEFAULT 0,
  last_activity DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id)
);
```

### khan_topics
```sql
CREATE TABLE khan_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  khan_profile_id UUID NOT NULL REFERENCES khan_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### khan_subtopics
```sql
CREATE TABLE khan_subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  khan_topic_id UUID NOT NULL REFERENCES khan_topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### reports
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'full',
  content JSONB,
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Views

### student_overview
```sql
CREATE OR REPLACE VIEW student_overview AS
SELECT
  s.id,
  s.name,
  s.age,
  s.school,
  s.active,
  CURRENT_DATE - MAX(c.date) AS days_since_last_class,
  MAX(c.date) AS last_class_date,
  COUNT(CASE WHEN c.pending IS NOT NULL AND c.pending <> '' THEN 1 END) AS pending_count
FROM students s
LEFT JOIN classes c ON c.student_id = s.id
WHERE s.active = true
GROUP BY s.id, s.name, s.age, s.school, s.active;
```

### last_class_per_module
```sql
CREATE OR REPLACE VIEW last_class_per_module AS
SELECT DISTINCT ON (c.student_id, c.module_id)
  c.id,
  c.student_id,
  c.module_id,
  c.date,
  c.content,
  c.pending,
  c.next_step,
  m.discipline,
  m.name AS module_name
FROM classes c
JOIN modules m ON m.id = c.module_id
ORDER BY c.student_id, c.module_id, c.date DESC;
```

---

## Row Level Security

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE khan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE khan_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE khan_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Professor vê tudo
CREATE POLICY "teacher_all" ON students
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Responsável vê só filhos vinculados
CREATE POLICY "parent_own_children" ON students
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student ps
      JOIN profiles p ON p.id = auth.uid()
      WHERE ps.student_id = students.id
        AND ps.parent_id = auth.uid()
        AND p.role = 'parent'
    )
  );

-- Repetir padrão acima para: modules, classes, progress, khan_profiles, khan_topics, khan_subtopics
```
