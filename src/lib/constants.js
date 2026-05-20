// Fallback: disciplines are now fetched from the database via useDisciplines() hook.
// This constant is used only when the DB is empty/unreachable.
export const DISCIPLINES = {
  piano: { label: 'Piano', color: '#3B82F6', bg: '#EFF6FF' },
  robotica: { label: 'Robótica', color: '#10B981', bg: '#ECFDF5' },
  matematica: { label: 'Matemática', color: '#F59E0B', bg: '#FFFBEB' },
  ingles: { label: 'Inglês', color: '#8B5CF6', bg: '#F5F3FF' },
  bateria: { label: 'Bateria', color: '#EC4899', bg: '#FDF2F8' },
  reforco: { label: 'Reforço', color: '#F97316', bg: '#FFF7ED' },
};

export const ALERT_DAYS = 14; // dias sem aula = alerta

export const KHAN_BASE_URL = 'https://pt.khanacademy.org';

export const ROLES = {
  TEACHER: 'teacher',
  PARENT: 'parent',
};
