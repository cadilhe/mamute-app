import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { overview as overviewApi } from '../../lib/api';
import { DisciplineBadge, AlertBadge } from '../shared/Badge';
import { Loading, EmptyState } from '../shared/Loading';

export function OverviewPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

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

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px' }}>Visão Geral</h1>
        <p style={{ color:'var(--text-3)', fontSize:13, marginTop:2 }}>Acompanhe todos os alunos com alertas</p>
      </div>

      {/* Filter cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:20 }}>
        {[
          { key:'all', label:'Todos', count:data.length, color:'var(--text)', bg:'var(--surface-2)' },
          { key:'danger', label:'Precisam atenção', count:danger.length, color:'#EF4444', bg:'#FEF2F2' },
          { key:'warning', label:'Com pendências', count:warning.length, color:'#F59E0B', bg:'#FFFBEB' },
          { key:'ok', label:'Em dia', count:ok.length, color:'#10B981', bg:'#ECFDF5' },
        ].map(({ key, label, count, color, bg }) => (
          <div key={key} onClick={()=>setFilter(key)} style={{
            padding:'16px 20px', borderRadius:12, border:'2px solid',
            borderColor: filter===key ? color : 'var(--border)',
            background: filter===key ? bg : 'var(--surface)',
            cursor:'pointer', transition:'all 0.15s',
          }}>
            <div style={{ fontSize:24, fontWeight:700, color }}>{count}</div>
            <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Student list */}
      {shown.length === 0 ? (
        <EmptyState icon="✓" title="Nenhum aluno nessa categoria" />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {shown.map(s => {
            const alertType = s.days_since_last_class >= 14 ? 'danger' : s.pending_count >= 2 ? 'warning' : 'success';
            return (
              <div key={s.id} onClick={()=>navigate('/alunos/'+s.id)}
                style={{ background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', padding:'14px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'box-shadow 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
                  {s.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>
                    {s.days_since_last_class != null
                      ? s.days_since_last_class === 0 ? 'Aula hoje' : `${s.days_since_last_class} dias sem aula`
                      : 'Sem aulas registradas'
                    }
                    {s.pending_count > 0 && ` · ${s.pending_count} pendências`}
                  </div>
                </div>
                <AlertBadge type={alertType} />
                <span style={{ color:'var(--text-3)' }}>›</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
