'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudents } from '@/hooks/useStudents';
import { DisciplineBadge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Loading, EmptyState } from '../shared/Loading';
import { AddStudentModal } from './AddStudentModal';

export function StudentsList() {
  const { data: students, loading, refetch } = useStudents();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Alunos</h1>
        <Button onClick={() => setShowAdd(true)}>+ Novo aluno</Button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar aluno..."
        className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text text-sm outline-none mb-4 focus:border-text-2 transition-colors"
      />

      {filtered.length === 0 ? (
        <EmptyState icon="👤" title="Nenhum aluno encontrado" description="Adicione um aluno para começar." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(student => (
            <div
              key={student.id}
              onClick={() => router.push('/alunos/' + student.id)}
              className="bg-surface rounded-xl border border-border px-5 py-4 cursor-pointer flex items-center gap-4 transition-all hover:shadow-md hover:border-text-3"
            >
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-base text-text-2 shrink-0 select-none">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text truncate">{student.name}</div>
                <div className="text-xs text-text-3 mt-0.5">
                  {student.age && `${student.age} anos`}{student.school && ` · ${student.school}`}
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap shrink-0">
                {(student.modules || []).map(m => (
                  <DisciplineBadge key={m.id} discipline={m.discipline} />
                ))}
              </div>
              <span className="text-text-3 text-lg font-light select-none ml-2">›</span>
            </div>
          ))}
        </div>
      )}

      <AddStudentModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          setShowAdd(false);
          refetch();
        }}
      />
    </div>
  );
}
