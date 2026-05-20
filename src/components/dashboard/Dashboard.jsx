'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudents } from '@/hooks/useStudents';
import { classes as classesApi } from '@/lib/api';
import { useDisciplines } from '@/hooks/useDisciplines';
import { DisciplineBadge } from '../shared/Badge';
import { Card } from '../shared/Card';
import { Loading } from '../shared/Loading';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatCard({ label, value, sub, colorClass }) {
  return (
    <Card className="flex flex-col gap-1">
      <div className={`text-3xl font-bold ${colorClass || 'text-text'}`}>{value}</div>
      <div className="font-semibold text-sm text-text mt-1">{label}</div>
      {sub && <div className="text-xs text-text-3 mt-0.5">{sub}</div>}
    </Card>
  );
}

export function Dashboard() {
  const { data: students, loading } = useStudents();
  const [todayClasses, setTodayClasses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    classesApi.listToday().then(({ data }) => setTodayClasses(data || []));
  }, []);

  const { disciplines: discMap } = useDisciplines();

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const discCounts = {};
  students.forEach(s => (s.modules || []).forEach(m => {
    discCounts[m.discipline] = (discCounts[m.discipline] || 0) + 1;
  }));

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Dashboard</h1>
        <p className="text-xs text-text-3 mt-0.5 capitalize">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Alunos ativos" value={students.length} sub="total na plataforma" />
        <StatCard label="Aulas hoje" value={todayClasses.length} sub="registradas" colorClass="text-piano" />
        <StatCard label="Disciplinas" value={Object.keys(discCounts).length} sub="em andamento" />
      </div>

      {/* Aulas de Hoje e Disciplinas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aulas de Hoje */}
        <Card>
          <h2 className="font-semibold text-sm mb-4 text-text">Aulas de Hoje</h2>
          {todayClasses.length === 0 ? (
            <p className="text-text-3 text-xs">Nenhuma aula registrada hoje.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todayClasses.map(c => (
                <div
                  key={c.id}
                  onClick={() => router.push('/alunos/' + c.student_id)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 cursor-pointer transition-all hover:bg-surface-2/60"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-text truncate">{c.students?.name}</div>
                    <div className="text-xs text-text-3 mt-0.5 truncate">
                      {c.content?.substring(0, 60) || 'Sem descrição'}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <DisciplineBadge discipline={c.modules?.discipline} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Disciplinas */}
        <Card>
          <h2 className="font-semibold text-sm mb-4 text-text">Alunos por Disciplina</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(discCounts).map(([disc, count]) => {
              const d = (discMap && discMap[disc]) || { label: disc, color: '#6b6860', bg: 'transparent' };
              const pct = Math.round((count / students.length) * 100);
              return (
                <div key={disc} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center mb-1 select-none">
                    <span className="text-sm font-medium text-text">{d.label}</span>
                    <span className="text-xs text-text-3">{count} alunos</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden w-full">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: d.color,
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(discCounts).length === 0 && (
              <p className="text-text-3 text-xs">Nenhuma disciplina em andamento.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
