'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { overview as overviewApi } from '@/lib/api';
import { AlertBadge } from '../shared/Badge';
import { Loading, EmptyState } from '../shared/Loading';

export function OverviewPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    overviewApi.getAll().then(({ data: d }) => {
      setData(d || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  const danger = data.filter(s => s.days_since_last_class >= 14);
  const warning = data.filter(s => s.days_since_last_class < 14 && s.pending_count >= 2);
  const ok = data.filter(s => s.days_since_last_class < 14 && s.pending_count < 2);

  const shown = filter === 'danger' ? danger : filter === 'warning' ? warning : filter === 'ok' ? ok : data;

  const filters = [
    { key: 'all', label: 'Todos', count: data.length, activeColor: 'text-text', activeBg: 'bg-surface-2', activeBorder: 'border-text-2' },
    { key: 'danger', label: 'Precisam atenção', count: danger.length, activeColor: 'text-danger', activeBg: 'bg-danger-bg/40', activeBorder: 'border-danger' },
    { key: 'warning', label: 'Com pendências', count: warning.length, activeColor: 'text-warning', activeBg: 'bg-warning-bg/40', activeBorder: 'border-warning' },
    { key: 'ok', label: 'Em dia', count: ok.length, activeColor: 'text-success', activeBg: 'bg-success-bg/40', activeBorder: 'border-success' },
  ];

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Visão Geral</h1>
        <p className="text-xs text-text-3 mt-0.5">Acompanhe todos os alunos com alertas</p>
      </div>

      {/* Filter cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 select-none">
        {filters.map(({ key, label, count, activeColor, activeBg, activeBorder }) => (
          <div
            key={key}
            onClick={() => setFilter(key)}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
              filter === key
                ? `${activeBg} ${activeBorder}`
                : 'border-border bg-surface hover:border-text-3'
            }`}
          >
            <div className={`text-2xl font-bold ${filter === key ? activeColor : 'text-text-2'}`}>{count}</div>
            <div className="text-xs text-text-3 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Student list */}
      {shown.length === 0 ? (
        <EmptyState icon="✓" title="Nenhum aluno nessa categoria" />
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map(s => {
            const alertType = s.days_since_last_class >= 14 ? 'danger' : s.pending_count >= 2 ? 'warning' : 'success';
            return (
              <div
                key={s.id}
                onClick={() => router.push('/alunos/' + s.id)}
                className="bg-surface rounded-xl border border-border px-5 py-3.5 cursor-pointer flex items-center gap-3 transition-all hover:shadow-md hover:border-text-3"
              >
                <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center font-bold text-sm text-text-2 shrink-0 select-none">
                  {s.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text truncate">{s.name}</div>
                  <div className="text-xs text-text-3 mt-0.5">
                    {s.days_since_last_class != null
                      ? s.days_since_last_class === 0 ? 'Aula hoje' : `${s.days_since_last_class} dias sem aula`
                      : 'Sem aulas registradas'
                    }
                    {s.pending_count > 0 && ` · ${s.pending_count} pendências`}
                  </div>
                </div>
                <AlertBadge type={alertType} />
                <span className="text-text-3 text-lg font-light select-none ml-2">›</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
