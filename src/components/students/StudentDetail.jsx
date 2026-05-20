import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudent } from '../../hooks/useStudents';
import { useClassesByStudent } from '../../hooks/useClasses';
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
  const navigate = useNavigate();
  const { data: student, loading, refetch } = useStudent(id);
  const { data: classHistory, refetch: refetchClasses } = useClassesByStudent(id);
  const [tab, setTab] = useState('Hoje');
  const [showRegister, setShowRegister] = useState(false);
  const [showReport, setShowReport] = useState(false);

  if (loading) return <Loading />;
  if (!student) return <div style={{ padding:32, color:'var(--text-3)' }}>Aluno não encontrado.</div>;

  const lastClass = classHistory[0];
  const pendencies = classHistory.filter(c => c.pending && c.pending.trim()).slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <button onClick={()=>navigate('/alunos')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:18 }}>←</button>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:20 }}>
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.5px' }}>{student.name}</h1>
          <div style={{ fontSize:13, color:'var(--text-3)' }}>
            {student.age && `${student.age} anos`}{student.school && ` · ${student.school}`}
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {(student.modules || []).map(m => <DisciplineBadge key={m.id} discipline={m.discipline} />)}
        </div>
        <Button variant="secondary" onClick={()=>setShowReport(true)}>📋 Relatório</Button>
        <Button onClick={()=>setShowRegister(true)}>+ Registrar aula</Button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:20, borderBottom:'1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'10px 18px', background:'none', border:'none', cursor:'pointer',
            fontFamily:'inherit', fontSize:14, fontWeight: tab===t ? 600 : 400,
            color: tab===t ? 'var(--text)' : 'var(--text-3)',
            borderBottom: tab===t ? '2px solid var(--text)' : '2px solid transparent',
            marginBottom:'-1px', transition:'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab: Hoje */}
      {tab === 'Hoje' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {lastClass ? (
            <Card>
              <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:4 }}>Última aula</div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                <DisciplineBadge discipline={lastClass.modules?.discipline} />
                <span style={{ fontSize:13, color:'var(--text-3)' }}>
                  {format(new Date(lastClass.date), "d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <p style={{ fontSize:14, lineHeight:1.6 }}>{lastClass.content || 'Sem descrição'}</p>
              {lastClass.pending && (
                <div style={{ marginTop:12, padding:'10px 12px', borderRadius:8, background:'#FFFBEB', borderLeft:'3px solid #F59E0B' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#F59E0B', marginBottom:2 }}>PENDÊNCIAS</div>
                  <div style={{ fontSize:13 }}>{lastClass.pending}</div>
                </div>
              )}
              {lastClass.next_step && (
                <div style={{ marginTop:8, padding:'10px 12px', borderRadius:8, background:'#ECFDF5', borderLeft:'3px solid #10B981' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#10B981', marginBottom:2 }}>PRÓXIMO PASSO</div>
                  <div style={{ fontSize:13 }}>{lastClass.next_step}</div>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p style={{ color:'var(--text-3)', fontSize:14 }}>Nenhuma aula registrada ainda.</p>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Histórico */}
      {tab === 'Histórico' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {classHistory.length === 0 ? (
            <p style={{ color:'var(--text-3)', padding:24 }}>Nenhuma aula registrada.</p>
          ) : classHistory.map((c, i) => (
            <Card key={c.id} style={{ padding:'14px 20px' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                <DisciplineBadge discipline={c.modules?.discipline} />
                <span style={{ fontSize:12, color:'var(--text-3)' }}>
                  {format(new Date(c.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.5 }}>{c.content || 'Sem descrição'}</p>
              {c.pending && <p style={{ fontSize:12, color:'#F59E0B', marginTop:4 }}>⚠ {c.pending}</p>}
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Progresso */}
      {tab === 'Progresso' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {(student.progress || []).map(p => {
            const d = p.discipline;
            return (
              <Card key={p.id}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
                  <DisciplineBadge discipline={d} size="md" />
                  <span style={{ fontSize:13, fontWeight:600 }}>{p.percent || 0}%</span>
                </div>
                <div style={{ height:8, borderRadius:4, background:'var(--surface-2)' }}>
                  <div style={{ height:'100%', borderRadius:4, background:'var(--text)', width:(p.percent||0)+'%', transition:'width 0.5s' }} />
                </div>
                {p.notes && <p style={{ fontSize:12, color:'var(--text-3)', marginTop:8 }}>{p.notes}</p>}
              </Card>
            );
          })}
          {(student.progress || []).length === 0 && <p style={{ color:'var(--text-3)' }}>Nenhum progresso registrado.</p>}
        </div>
      )}

      {/* Tab: Khan */}
      {tab === 'Khan Academy' && <KhanTab studentId={id} />}

      {/* Modals */}
      <RegisterClassModal
        open={showRegister} onClose={()=>setShowRegister(false)}
        student={student}
        onSuccess={()=>{ setShowRegister(false); refetchClasses(); }}
      />
      <ReportModal
        open={showReport} onClose={()=>setShowReport(false)}
        student={student} classHistory={classHistory}
      />
    </div>
  );
}
