import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../../hooks/useStudents';
import { classes as classesApi } from '../../lib/api';
import { DISCIPLINES } from '../../lib/constants';
import { DisciplineBadge } from '../shared/Badge';
import { Card } from '../shared/Card';
import { Loading } from '../shared/Loading';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatCard({ label, value, sub, color }) {
  return (
    <Card style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ fontSize:28, fontWeight:700, color: color||'var(--text)' }}>{value}</div>
      <div style={{ fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:12, color:'var(--text-3)' }}>{sub}</div>}
    </Card>
  );
}

export function Dashboard() {
  const { data: students, loading } = useStudents();
  const [todayClasses, setTodayClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    classesApi.listToday().then(({ data }) => setTodayClasses(data || []));
  }, []);

  if (loading) return <Loading />;

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const disciplines = {};
  students.forEach(s => (s.modules || []).forEach(m => {
    disciplines[m.discipline] = (disciplines[m.discipline] || 0) + 1;
  }));

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px' }}>Dashboard</h1>
        <p style={{ color:'var(--text-3)', fontSize:13, marginTop:2, textTransform:'capitalize' }}>{today}</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:24 }}>
        <StatCard label="Alunos ativos" value={students.length} sub="total na plataforma" />
        <StatCard label="Aulas hoje" value={todayClasses.length} sub="registradas" color="#3B82F6" />
        <StatCard label="Disciplinas" value={Object.keys(disciplines).length} sub="em andamento" />
      </div>

      {/* Aulas de Hoje */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Aulas de Hoje</h2>
          {todayClasses.length === 0 ? (
            <p style={{ color:'var(--text-3)', fontSize:13 }}>Nenhuma aula registrada hoje.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {todayClasses.map(c => (
                <div key={c.id} onClick={() => navigate('/alunos/' + c.student_id)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, background:'var(--surface-2)', cursor:'pointer' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500 }}>{c.students?.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>{c.content?.substring(0, 60) || 'Sem descrição'}</div>
                  </div>
                  <DisciplineBadge discipline={c.modules?.discipline} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Disciplinas */}
        <Card>
          <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Alunos por Disciplina</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {Object.entries(disciplines).map(([disc, count]) => {
              const d = DISCIPLINES[disc] || { label: disc, color:'#6B7280', bg:'#F9FAFB' };
              const pct = Math.round((count / students.length) * 100);
              return (
                <div key={disc}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:500 }}>{d.label}</span>
                    <span style={{ fontSize:12, color:'var(--text-3)' }}>{count} alunos</span>
                  </div>
                  <div style={{ height:6, borderRadius:3, background:'var(--surface-2)' }}>
                    <div style={{ height:'100%', borderRadius:3, background:d.color, width: pct+'%', transition:'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
