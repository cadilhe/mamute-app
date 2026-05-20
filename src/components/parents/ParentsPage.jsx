import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { parents as parentsApi } from '../../lib/api';
import { DisciplineBadge } from '../shared/Badge';
import { Loading, EmptyState } from '../shared/Loading';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ParentsPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    parentsApi.getChildren(user.id).then(({ data }) => {
      const kids = (data || []).map(d => d.students).filter(Boolean);
      setChildren(kids);
      if (kids.length > 0) setSelected(kids[0]);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <Loading />;
  if (children.length === 0) return (
    <EmptyState icon="👨‍👩‍👧" title="Nenhum filho vinculado" description="Peça ao professor para vincular seu filho à sua conta." />
  );

  const s = selected;
  const lastClass = s?.classes?.sort((a,b) => new Date(b.date)-new Date(a.date))[0];

  return (
    <div style={{ maxWidth:640, margin:'0 auto' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px' }}>Portal dos Pais</h1>
        {children.length > 1 && (
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            {children.map(c => (
              <button key={c.id} onClick={()=>setSelected(c)}
                style={{ padding:'6px 14px', borderRadius:20, border:'2px solid', cursor:'pointer', fontFamily:'inherit', fontSize:13,
                  borderColor: selected?.id===c.id ? 'var(--text)' : 'var(--border)',
                  background: selected?.id===c.id ? 'var(--text)' : 'transparent',
                  color: selected?.id===c.id ? '#fff' : 'var(--text-2)' }}>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {s && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Student info */}
          <div style={{ background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', padding:20, display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:22 }}>
              {s.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>{s.name}</div>
              <div style={{ fontSize:13, color:'var(--text-3)' }}>{s.age && `${s.age} anos`}{s.school && ` · ${s.school}`}</div>
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {(s.modules||[]).map(m => <DisciplineBadge key={m.id} discipline={m.discipline} />)}
            </div>
          </div>

          {/* Last class */}
          {lastClass ? (
            <div style={{ background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', padding:20 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>Última Aula</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:8 }}>
                {format(new Date(lastClass.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </div>
              <p style={{ fontSize:14, lineHeight:1.6 }}>{lastClass.content || 'Sem descrição'}</p>
              {lastClass.pending && (
                <div style={{ marginTop:12, padding:12, borderRadius:8, background:'#FFFBEB', borderLeft:'3px solid #F59E0B' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#F59E0B', marginBottom:4 }}>TAREFA / PENDÊNCIA</div>
                  <div style={{ fontSize:13 }}>{lastClass.pending}</div>
                </div>
              )}
              {lastClass.next_step && (
                <div style={{ marginTop:8, padding:12, borderRadius:8, background:'#ECFDF5', borderLeft:'3px solid #10B981' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#10B981', marginBottom:4 }}>PRÓXIMA AULA</div>
                  <div style={{ fontSize:13 }}>{lastClass.next_step}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', padding:20 }}>
              <p style={{ color:'var(--text-3)' }}>Nenhuma aula registrada ainda.</p>
            </div>
          )}

          {/* Progress */}
          {(s.progress||[]).length > 0 && (
            <div style={{ background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', padding:20 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>Progresso por Disciplina</div>
              {(s.progress||[]).map(p => (
                <div key={p.id} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <DisciplineBadge discipline={p.discipline} />
                    <span style={{ fontSize:12, fontWeight:600 }}>{p.percent||0}%</span>
                  </div>
                  <div style={{ height:6, borderRadius:3, background:'var(--surface-2)' }}>
                    <div style={{ height:'100%', borderRadius:3, background:'var(--text)', width:(p.percent||0)+'%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
