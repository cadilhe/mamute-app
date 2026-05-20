import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Input, Select } from '../shared/Input';
import { Button } from '../shared/Button';
import { students as studentsApi, modules as modulesApi } from '../../lib/api';
import { DISCIPLINES } from '../../lib/constants';

export function AddStudentModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ name:'', age:'', school:'', parent_email:'' });
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDiscipline = (disc) => {
    setSelectedDisciplines(prev =>
      prev.includes(disc) ? prev.filter(d => d !== disc) : [...prev, disc]
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Nome é obrigatório'); return; }
    if (selectedDisciplines.length === 0) { setError('Selecione ao menos uma disciplina'); return; }
    setLoading(true);
    setError('');

    const { data: student, error: err } = await studentsApi.create({
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      school: form.school || null,
      parent_email: form.parent_email || null,
      active: true,
    });

    if (err) { setError(err.message); setLoading(false); return; }

    // Create modules
    for (const disc of selectedDisciplines) {
      await modulesApi.create({ student_id: student.id, discipline: disc, name: DISCIPLINES[disc]?.label || disc });
    }

    setForm({ name:'', age:'', school:'', parent_email:'' });
    setSelectedDisciplines([]);
    setLoading(false);
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo Aluno">
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Input label="Nome completo *" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Nome do aluno" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Input label="Idade" type="number" value={form.age} onChange={e=>set('age',e.target.value)} placeholder="10" />
          <Input label="Escola" value={form.school} onChange={e=>set('school',e.target.value)} placeholder="Nome da escola" />
        </div>
        <Input label="Email do responsável" type="email" value={form.parent_email} onChange={e=>set('parent_email',e.target.value)} placeholder="pai@email.com" />

        <div>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--text-2)', marginBottom:8 }}>Disciplinas *</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {Object.entries(DISCIPLINES).map(([key, d]) => {
              const selected = selectedDisciplines.includes(key);
              return (
                <button key={key} onClick={()=>toggleDiscipline(key)}
                  style={{ padding:'6px 14px', borderRadius:20, border:'2px solid', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:selected?600:400,
                    borderColor: selected ? d.color : 'var(--border)',
                    background: selected ? d.bg : 'transparent',
                    color: selected ? d.color : 'var(--text-2)',
                    transition:'all 0.15s' }}>
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && <div style={{ padding:'8px 12px', borderRadius:8, background:'#FEF2F2', color:'#EF4444', fontSize:13 }}>{error}</div>}

        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:8 }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Salvando...' : 'Criar aluno'}</Button>
        </div>
      </div>
    </Modal>
  );
}
