'use client';

import { useEffect, useState, useCallback } from 'react';
import { schedule as scheduleApi } from '@/lib/api';
import { useStudents } from '@/hooks/useStudents';
import { DisciplineBadge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Loading, ErrorState, EmptyState } from '../shared/Loading';
import { AddScheduleModal } from './AddScheduleModal';
import { EditScheduleModal } from './EditScheduleModal';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function SchedulePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editScheduleTarget, setEditScheduleTarget] = useState(null);
  const { data: students } = useStudents();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: d, error: err } = await scheduleApi.list();
    if (err) {
      setError(err.message);
      setData([]);
    } else {
      setData(d || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  if (data.length === 0) {
    return (
      <div className="w-full animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Agenda</h1>
            <p className="text-xs text-text-3 mt-0.5">Grade semanal de aulas</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>+ Horário</Button>
        </div>
        <EmptyState
          icon="📅"
          title="Nenhum horário cadastrado"
          description="Adicione horários semanais para organizar a grade de aulas."
        />
        <AddScheduleModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          students={students}
          onSuccess={() => { setShowAdd(false); fetch(); }}
        />
        <EditScheduleModal
          open={showEdit}
          onClose={() => { setShowEdit(false); setEditScheduleTarget(null); }}
          scheduleItem={editScheduleTarget}
          students={students}
          onSuccess={() => { setShowEdit(false); setEditScheduleTarget(null); fetch(); }}
        />
      </div>
    );
  }

  const byDay = {};
  DAYS.forEach((_, i) => {
    byDay[i + 1] = data.filter(s => s.day_of_week === i + 1);
  });

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Agenda</h1>
          <p className="text-xs text-text-3 mt-0.5">Grade semanal de aulas</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Horário</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DAYS.map((day, i) => (
          <div key={day} className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-surface-2 border-b border-border select-none">
              <div className="font-semibold text-sm text-text">{day}</div>
              <div className="text-[10px] text-text-3 mt-0.5">{byDay[i + 1]?.length || 0} aulas</div>
            </div>
            
            <div className="p-3 flex flex-col gap-2 min-h-[80px] justify-start">
              {byDay[i + 1]?.length === 0 ? (
                <div className="text-text-3 text-xs text-center py-4 w-full select-none">—</div>
              ) : (
                byDay[i + 1]?.map(s => (
                  <div
                    key={s.id}
                    onClick={() => { setEditScheduleTarget(s); setShowEdit(true); }}
                    className="p-2.5 rounded-lg bg-bg border border-border/30 flex justify-between items-center gap-2 hover:border-text-3 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-text truncate">{s.students?.name}</div>
                      <div className="text-[10px] text-text-3 mt-0.5 font-medium">
                        {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <DisciplineBadge discipline={s.modules?.discipline} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <AddScheduleModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        students={students}
        onSuccess={() => {
          setShowAdd(false);
          fetch();
        }}
      />
      <EditScheduleModal
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
          setEditScheduleTarget(null);
        }}
        scheduleItem={editScheduleTarget}
        students={students}
        onSuccess={() => {
          setShowEdit(false);
          setEditScheduleTarget(null);
          fetch();
        }}
      />
    </div>
  );
}
