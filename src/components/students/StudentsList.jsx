import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../../hooks/useStudents';
import { DisciplineBadge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Loading, EmptyState } from '../shared/Loading';
import { AddStudentModal } from './AddStudentModal';

export function StudentsList() {
  const { data: students, loading, refetch } = useStudents();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px' }}>Alunos</h1>
        <Button onClick={() => setShowAdd(true)}>+ Novo aluno</Button>
      </div>

      <input
        value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Buscar aluno..."
        style={{ width:'100%', padding:'10px 16px', borderRadius:10, border:'1px solid var(--border)', background:'var(--surface)', fontSize:14, outline:'none', marginBottom:16 }}
      />

      {filtered.length === 0 ? (
        <EmptyState icon="👤" title="Nenhum aluno encontrado" description="Adicione um aluno para começar." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(student => (
            <div key={student.id} onClick={() => navigate('/alunos/' + student.id)}
              style={{ background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:16, transition:'box-shadow 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
            >
              <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, color:'var(--text-2)', flexShrink:0 }}>
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{student.name}</div>
                <div style={{ fontSize:12, color:'var(--text-3)' }}>
                  {student.age && `${student.age} anos`}{student.school && ` · ${student.school}`}
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(student.modules || []).map(m => (
                  <DisciplineBadge key={m.id} discipline={m.discipline} />
                ))}
              </div>
              <span style={{ color:'var(--text-3)', fontSize:18 }}>›</span>
            </div>
          ))}
        </div>
      )}

      <AddStudentModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); refetch(); }} />
    </div>
  );
}
