import { supabase } from './supabase';

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const auth = {
  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthChange: (cb) => supabase.auth.onAuthStateChange(cb),
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const students = {
  list: () =>
    supabase
      .from('students')
      .select(`*, modules(*), khan_profiles(*)`)
      .eq('active', true)
      .order('name'),

  get: (id) =>
    supabase
      .from('students')
      .select(`*, modules(*), khan_profiles(*), progress(*)`)
      .eq('id', id)
      .single(),

  create: (data) => supabase.from('students').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('students').update(data).eq('id', id).select().single(),

  deactivate: (id) =>
    supabase.from('students').update({ active: false }).eq('id', id),
};

// ─── CLASSES ─────────────────────────────────────────────────────────────────
export const classes = {
  listByStudent: (studentId) =>
    supabase
      .from('classes')
      .select(`*, modules(name, discipline)`)
      .eq('student_id', studentId)
      .order('date', { ascending: false }),

  listToday: () => {
    const today = new Date().toISOString().split('T')[0];
    return supabase
      .from('classes')
      .select(`*, students(name), modules(name, discipline)`)
      .eq('date', today)
      .order('students(name)');
  },

  create: (data) => supabase.from('classes').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('classes').update(data).eq('id', id).select().single(),
};

// ─── MODULES ─────────────────────────────────────────────────────────────────
export const modules = {
  listByStudent: (studentId) =>
    supabase.from('modules').select('*').eq('student_id', studentId),

  create: (data) => supabase.from('modules').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('modules').update(data).eq('id', id).select().single(),

  remove: (id) => supabase.from('modules').delete().eq('id', id),
};

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
export const progress = {
  listByStudent: (studentId) =>
    supabase.from('progress').select('*').eq('student_id', studentId),

  upsert: (data) =>
    supabase.from('progress').upsert(data).select().single(),
};

// ─── SCHEDULE ────────────────────────────────────────────────────────────────
export const schedule = {
  list: () =>
    supabase
      .from('schedules')
      .select(`*, students(name), modules(name, discipline)`)
      .eq('active', true)
      .order('day_of_week')
      .order('start_time'),

  create: (data) => supabase.from('schedules').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('schedules').update(data).eq('id', id).select().single(),

  remove: (id) => supabase.from('schedules').delete().eq('id', id),
};

// ─── KHAN ACADEMY ────────────────────────────────────────────────────────────
export const khan = {
  getProfile: (studentId) =>
    supabase
      .from('khan_profiles')
      .select(`*, khan_topics(*, khan_subtopics(*))`)
      .eq('student_id', studentId)
      .single(),

  saveProfile: (data) =>
    supabase.from('khan_profiles').upsert(data).select().single(),

  addTopic: (data) =>
    supabase.from('khan_topics').insert(data).select().single(),

  updateTopic: (id, data) =>
    supabase.from('khan_topics').update(data).eq('id', id).select().single(),

  removeTopic: (id) =>
    supabase.from('khan_topics').delete().eq('id', id),

  addSubtopic: (data) =>
    supabase.from('khan_subtopics').insert(data).select().single(),

  updateSubtopic: (id, data) =>
    supabase.from('khan_subtopics').update(data).eq('id', id).select().single(),

  removeSubtopic: (id) =>
    supabase.from('khan_subtopics').delete().eq('id', id),
};

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
export const overview = {
  getAll: () =>
    supabase
      .from('student_overview')
      .select('*')
      .order('days_since_last_class', { ascending: false }),
};

// ─── DISCIPLINES ──────────────────────────────────────────────────────────────
export const disciplines = {
  list: () =>
    supabase
      .from('disciplines')
      .select('*')
      .eq('active', true)
      .order('label'),

  listAll: () =>
    supabase
      .from('disciplines')
      .select('*')
      .order('label'),

  create: (data) =>
    supabase.from('disciplines').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('disciplines').update(data).eq('id', id).select().single(),

  remove: (id) =>
    supabase.from('disciplines').update({ active: false }).eq('id', id),
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────
export const reports = {
  generate: (studentId, type, content) =>
    supabase.from('reports').insert({
      student_id: studentId,
      type,
      content,
      generated_at: new Date().toISOString(),
    }),

  list: (studentId) =>
    supabase
      .from('reports')
      .select('*')
      .eq('student_id', studentId)
      .order('generated_at', { ascending: false }),
};

// ─── PARENTS ─────────────────────────────────────────────────────────────────
export const parents = {
  getChildren: (parentId) =>
    supabase
      .from('parent_student')
      .select(`students(*, modules(*), classes(*), khan_profiles(*), progress(*))`)
      .eq('parent_id', parentId),

  list: () =>
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'parent')
      .order('full_name'),

  link: (parentId, studentId) =>
    supabase.from('parent_student').insert({ parent_id: parentId, student_id: studentId }),

  unlink: (parentId, studentId) =>
    supabase
      .from('parent_student')
      .delete()
      .eq('parent_id', parentId)
      .eq('student_id', studentId),

  getByStudent: async (studentId) => {
    const { data: links, error: linksErr } = await supabase
      .from('parent_student')
      .select('parent_id')
      .eq('student_id', studentId);

    if (linksErr) return { data: [], error: linksErr };

    const parentIds = (links || []).map(l => l.parent_id);

    if (parentIds.length === 0) return { data: [] };

    const { data: profilesData, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', parentIds);

    if (profilesErr) return { data: [], error: profilesErr };

    return {
      data: parentIds.map(pid => ({
        parent_id: pid,
        profiles: (profilesData || []).find(p => p.id === pid) || null,
      })),
    };
  },

  getLinkedStudentIds: () =>
    supabase.from('parent_student').select('student_id'),
};

// ─── FUNCTIONS / NOTIFICATIONS ───────────────────────────────────────────────
export const notifications = {
  sendClassEmail: (data) => supabase.functions.invoke('send-class-email', { body: data }),
};

