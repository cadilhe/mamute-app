'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { parents as parentsApi } from '@/lib/api';
import { DisciplineBadge } from '../shared/Badge';
import { Loading, EmptyState, ErrorState } from '../shared/Loading';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ParentsPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    parentsApi.getChildren(user.id).then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
        setChildren([]);
      } else {
        const kids = (data || []).map(d => d.students).filter(Boolean);
        setChildren(kids);
        if (kids.length > 0) setSelected(kids[0]);
      }
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, [user]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;
  
  if (children.length === 0) {
    return (
      <EmptyState
        icon="👨‍👩‍👧"
        title="Nenhum filho vinculado"
        description="Peça ao professor para vincular seu filho à sua conta."
      />
    );
  }

  const s = selected;
  const lastClass = s?.classes?.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Portal dos Pais</h1>
        {children.length > 1 && (
          <div className="flex gap-2 mt-3 select-none">
            {children.map(c => {
              const isSelected = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`px-4 py-1.5 rounded-full border-2 text-xs font-semibold cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-text bg-text text-bg'
                      : 'border-border bg-transparent text-text-2 hover:border-text-3'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {s && (
        <div className="flex flex-col gap-4">
          {/* Student info */}
          <div className="bg-surface rounded-xl border border-border p-5 flex gap-4 items-center flex-col sm:flex-row">
            <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center font-bold text-2xl text-text shrink-0 select-none">
              {s.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="font-bold text-base text-text">{s.name}</div>
              <div className="text-xs text-text-3 mt-0.5">
                {s.age && `${s.age} anos`}{s.school && ` · ${s.school}`}
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center sm:justify-start shrink-0">
              {(s.modules || []).map(m => (
                <DisciplineBadge key={m.id} discipline={m.discipline} />
              ))}
            </div>
          </div>

          {/* Last class */}
          {lastClass ? (
            <div className="bg-surface rounded-xl border border-border p-5">
              <div className="text-[10px] font-bold text-text-3 tracking-wider uppercase mb-3 select-none">
                Última Aula
              </div>
              <div className="text-xs text-text-3 mb-2 font-medium capitalize">
                {format(new Date(lastClass.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </div>
              <p className="text-sm leading-relaxed text-text-2">{lastClass.content || 'Sem descrição'}</p>
              
              {lastClass.pending && (
                <div className="mt-3 p-3 rounded-lg bg-warning-bg/40 border-l-4 border-warning">
                  <div className="text-[10px] font-bold text-warning tracking-wider mb-1 select-none">
                    TAREFA / PENDÊNCIA
                  </div>
                  <div className="text-sm text-text">{lastClass.pending}</div>
                </div>
              )}
              {lastClass.next_step && (
                <div className="mt-2.5 p-3 rounded-lg bg-success-bg/40 border-l-4 border-success">
                  <div className="text-[10px] font-bold text-success tracking-wider mb-1 select-none">
                    PRÓXIMA AULA
                  </div>
                  <div className="text-sm text-text">{lastClass.next_step}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border p-5">
              <p className="text-text-3 text-sm">Nenhuma aula registrada ainda.</p>
            </div>
          )}

          {/* Progress */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="text-[10px] font-bold text-text-3 tracking-wider uppercase mb-3 select-none">
              Progresso por Disciplina
            </div>
            {(s.progress || []).length === 0 ? (
              <p className="text-text-3 text-sm">Nenhum progresso registrado ainda.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {(s.progress || []).map(p => (
                  <div key={p.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center mb-1 select-none">
                      <DisciplineBadge discipline={p.discipline} />
                      <span className="text-xs font-semibold text-text">{p.percent || 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden w-full">
                      <div
                        className="h-full rounded-full bg-text transition-all duration-500"
                        style={{ width: `${p.percent || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
