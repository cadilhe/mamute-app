'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudent } from '@/hooks/useStudents';
import { useClassesByStudent } from '@/hooks/useClasses';
import { progress as progressApi, parents as parentsApi } from '../../lib/api';
import { DisciplineBadge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Loading, EmptyState } from '../shared/Loading';
import { useToast } from '../shared/Toast';
import { RegisterClassModal } from './RegisterClassModal';
import { EditStudentModal } from './EditStudentModal';
import { EditClassModal } from './EditClassModal';
import { KhanTab } from '../khan/KhanTab';
import { ReportModal } from '../reports/ReportModal';
import { LinkParentModal } from '../parents/LinkParentModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TABS = ['Hoje', 'Histórico', 'Progresso', 'Khan Academy'];

function ProgressCard({ studentId, discipline, existingPercent, existingNotes }) {
  const [percent, setPercent] = useState(existingPercent || 0);
  const [notes, setNotes] = useState(existingNotes || '');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const clamp = (v) => Math.min(100, Math.max(0, v));

  const handleSavePercent = async () => {
    setSaving(true);
    const { error: err } = await progressApi.upsert({ student_id: studentId, discipline, percent: clamp(percent), notes });
    if (err) toast.error(err.message);
    setSaving(false);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    const { error: err } = await progressApi.upsert({ student_id: studentId, discipline, percent: clamp(percent), notes });
    if (err) toast.error(err.message);
    setSaving(false);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-2">
        <DisciplineBadge discipline={discipline} size="md" />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            value={percent}
            onChange={e => setPercent(Number(e.target.value))}
            onBlur={handleSavePercent}
            className="w-14 px-2 py-0.5 rounded border border-border bg-surface text-text text-sm text-right outline-none focus:border-text-2"
          />
          <span className="text-sm font-semibold text-text-3 select-none">%</span>
        </div>
      </div>
      <div className="h-2 rounded bg-surface-2 overflow-hidden w-full">
        <div
          className="h-full rounded bg-text transition-all duration-500"
          style={{ width: `${clamp(percent)}%` }}
        />
      </div>
      <div className="flex items-start gap-1 mt-2">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={handleSaveNotes}
          placeholder="Observações..."
          rows={2}
          className="w-full px-3 py-1.5 rounded border border-border bg-surface text-text text-xs outline-none resize-y focus:border-text-2 placeholder:text-text-3"
        />
        {saving && (
          <span className="text-[10px] text-text-3 whitespace-nowrap pt-1.5">Salvando...</span>
        )}
      </div>
    </Card>
  );
}

export function StudentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: student, loading, refetch: refetchStudent } = useStudent(id);
  const { data: classHistory, refetch: refetchClasses } = useClassesByStudent(id);
  const [tab, setTab] = useState('Hoje');
  const [showRegister, setShowRegister] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showEditClass, setShowEditClass] = useState(false);
  const [editClassTarget, setEditClassTarget] = useState(null);
  const [linkedParents, setLinkedParents] = useState([]);
  const [showLinkParent, setShowLinkParent] = useState(false);

  const fetchParents = useCallback(async () => {
    if (!id) return;
    const { data, error: err } = await parentsApi.getByStudent(id);
    if (!err) setLinkedParents(data || []);
  }, [id]);

  useEffect(() => { fetchParents(); }, [fetchParents]);

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
          <Button variant="ghost" onClick={() => setShowEdit(true)}>✏️ Editar</Button>
          <Button variant="secondary" onClick={() => setShowReport(true)}>📋 Relatório</Button>
          <Button onClick={() => setShowRegister(true)}>+ Registrar aula</Button>
        </div>
      </div>

      {/* Responsável */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider select-none shrink-0">Responsável</span>
        {linkedParents.length === 0 ? (
          <span className="text-xs text-text-3">Nenhum vinculado.</span>
        ) : (
          linkedParents.map(lp => (
            <span
              key={lp.parent_id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs text-text"
            >
              {lp.profiles?.full_name || 'Responsável'}
              <button
                onClick={async () => {
                  const { error: err } = await parentsApi.unlink(lp.parent_id, student.id);
                  if (!err) fetchParents();
                }}
                className="bg-transparent border-none cursor-pointer text-text-3 hover:text-danger text-sm leading-none select-none"
              >
                ×
              </button>
            </span>
          ))
        )}
        <Button variant="ghost" size="sm" onClick={() => setShowLinkParent(true)}>
          {linkedParents.length > 0 ? '+ Vincular' : 'Vincular'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 overflow-x-auto select-none no-scrollbar">
        <div className="inline-flex flex-nowrap gap-1 bg-surface-2 p-1 rounded-xl border border-border">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg cursor-pointer text-xs font-semibold tracking-wide transition-all duration-200 border-none outline-none whitespace-nowrap ${
                tab === t
                  ? 'bg-bg text-text shadow-sm font-bold'
                  : 'text-text-3 hover:text-text-2 hover:bg-surface/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
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
                  {lastClass.date ? format(new Date(lastClass.date), "d 'de' MMMM", { locale: ptBR }) : '—'}
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
              <EmptyState icon="📝" title="Nenhuma aula registrada" description="Registre a primeira aula deste aluno." />
            </Card>
          )}
        </div>
      )}

      {/* Tab: Histórico */}
      {tab === 'Histórico' && (
        <div className="flex flex-col gap-2.5">
          {classHistory.length === 0 ? (
            <EmptyState icon="📋" title="Nenhuma aula registrada" description="O histórico de aulas aparecerá aqui." />
          ) : (
            classHistory.map(c => (
              <Card key={c.id} className="px-5 py-3.5">
                <div className="flex gap-2 items-center mb-1.5">
                  <DisciplineBadge discipline={c.modules?.discipline} />
                  <span className="text-xs text-text-3">
                    {c.date ? format(new Date(c.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : '—'}
                  </span>
                  <button
                    onClick={() => { setEditClassTarget(c); setShowEditClass(true); }}
                    className="ml-auto bg-transparent border-none cursor-pointer text-text-3 hover:text-text transition-colors text-xs select-none"
                  >
                    ✏️
                  </button>
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
          {(student.modules || []).length === 0 ? (
            <EmptyState icon="📊" title="Nenhuma disciplina cadastrada" description="Edite o aluno para adicionar disciplinas." />
          ) : (
            (student.modules || []).map(m => {
              const p = (student.progress || []).find(pr => pr.discipline === m.discipline);
              return (
                <ProgressCard
                  key={m.id}
                  studentId={student.id}
                  discipline={m.discipline}
                  existingPercent={p?.percent || 0}
                  existingNotes={p?.notes || ''}
                />
              );
            })
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
      <EditStudentModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        student={student}
        onSuccess={() => {
          setShowEdit(false);
          refetchStudent();
          refetchClasses();
        }}
      />
      <EditClassModal
        open={showEditClass}
        onClose={() => setShowEditClass(false)}
        classItem={editClassTarget}
        student={student}
        onSuccess={() => {
          setShowEditClass(false);
          refetchClasses();
        }}
      />
      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        student={student}
        classHistory={classHistory}
      />
      <LinkParentModal
        open={showLinkParent}
        onClose={() => setShowLinkParent(false)}
        student={student}
        onSuccess={() => {
          setShowLinkParent(false);
          fetchParents();
        }}
      />
    </div>
  );
}
