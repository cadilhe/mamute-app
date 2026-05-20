'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudent } from '@/hooks/useStudents';
import { useClassesByStudent } from '@/hooks/useClasses';
import { DisciplineBadge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Loading } from '../shared/Loading';
import { RegisterClassModal } from './RegisterClassModal';
import { KhanTab } from '../khan/KhanTab';
import { ReportModal } from '../reports/ReportModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TABS = ['Hoje', 'Histórico', 'Progresso', 'Khan Academy'];

export function StudentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: student, loading } = useStudent(id);
  const { data: classHistory, refetch: refetchClasses } = useClassesByStudent(id);
  const [tab, setTab] = useState('Hoje');
  const [showRegister, setShowRegister] = useState(false);
  const [showReport, setShowReport] = useState(false);

  if (loading) return <Loading />;
  if (!student) return <div className="p-8 text-text-3 text-sm">Aluno não encontrado.</div>;

  const lastClass = classHistory[0];

  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/alunos')}
          className="bg-transparent border-none cursor-pointer text-text-3 text-2xl hover:text-text transition-colors select-none"
        >
          ←
        </button>
        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center font-bold text-xl text-text select-none shrink-0">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-text truncate">{student.name}</h1>
          <div className="text-xs text-text-3 mt-0.5">
            {student.age && `${student.age} anos`}{student.school && ` · ${student.school}`}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {(student.modules || []).map(m => (
            <DisciplineBadge key={m.id} discipline={m.discipline} />
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={() => setShowReport(true)}>📋 Relatório</Button>
          <Button onClick={() => setShowRegister(true)}>+ Registrar aula</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-5 overflow-x-auto select-none">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4.5 py-2.5 bg-transparent border-b-2 cursor-pointer text-sm transition-all -mb-px outline-none ${
              tab === t
                ? 'font-semibold text-text border-text'
                : 'font-normal text-text-3 border-transparent hover:text-text-2'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Hoje */}
      {tab === 'Hoje' && (
        <div className="flex flex-col gap-4">
          {lastClass ? (
            <Card>
              <div className="text-xs text-text-3 mb-1">Última aula</div>
              <div className="flex gap-2 items-center mb-2">
                <DisciplineBadge discipline={lastClass.modules?.discipline} />
                <span className="text-sm text-text-3">
                  {format(new Date(lastClass.date), "d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-text-2">{lastClass.content || 'Sem descrição'}</p>
              
              {lastClass.pending && (
                <div className="mt-3 p-3 rounded-lg bg-warning-bg/40 border-l-4 border-warning">
                  <div className="text-[10px] font-bold text-warning tracking-wider mb-0.5">PENDÊNCIAS</div>
                  <div className="text-sm text-text">{lastClass.pending}</div>
                </div>
              )}
              {lastClass.next_step && (
                <div className="mt-2.5 p-3 rounded-lg bg-success-bg/40 border-l-4 border-success">
                  <div className="text-[10px] font-bold text-success tracking-wider mb-0.5">PRÓXIMO PASSO</div>
                  <div className="text-sm text-text">{lastClass.next_step}</div>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-text-3 text-sm">Nenhuma aula registrada ainda.</p>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Histórico */}
      {tab === 'Histórico' && (
        <div className="flex flex-col gap-2.5">
          {classHistory.length === 0 ? (
            <p className="text-text-3 text-sm p-6 text-center bg-surface rounded-xl border border-border">
              Nenhuma aula registrada.
            </p>
          ) : (
            classHistory.map(c => (
              <Card key={c.id} className="px-5 py-3.5">
                <div className="flex gap-2 items-center mb-1.5">
                  <DisciplineBadge discipline={c.modules?.discipline} />
                  <span className="text-xs text-text-3">
                    {format(new Date(c.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm text-text-2 leading-normal">{c.content || 'Sem descrição'}</p>
                {c.pending && <p className="text-xs text-warning mt-1 font-medium">⚠ {c.pending}</p>}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Progresso */}
      {tab === 'Progresso' && (
        <div className="flex flex-col gap-3">
          {(student.progress || []).map(p => {
            const d = p.discipline;
            return (
              <Card key={p.id}>
                <div className="flex justify-between items-center mb-2">
                  <DisciplineBadge discipline={d} size="md" />
                  <span className="text-sm font-semibold text-text">{p.percent || 0}%</span>
                </div>
                <div className="h-2 rounded bg-surface-2 overflow-hidden w-full">
                  <div
                    className="h-full rounded bg-text transition-all duration-500"
                    style={{ width: `${p.percent || 0}%` }}
                  />
                </div>
                {p.notes && <p className="text-xs text-text-3 mt-2">{p.notes}</p>}
              </Card>
            );
          })}
          {(student.progress || []).length === 0 && (
            <p className="text-text-3 text-sm">Nenhum progresso registrado.</p>
          )}
        </div>
      )}

      {/* Tab: Khan */}
      {tab === 'Khan Academy' && <KhanTab studentId={id} />}

      {/* Modals */}
      <RegisterClassModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        student={student}
        onSuccess={() => {
          setShowRegister(false);
          refetchClasses();
        }}
      />
      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        student={student}
        classHistory={classHistory}
      />
    </div>
  );
}
