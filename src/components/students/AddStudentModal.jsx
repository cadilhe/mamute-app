'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Input, Select } from '../shared/Input';
import { Button } from '../shared/Button';
import { students as studentsApi, modules as modulesApi } from '../../lib/api';
import { useDisciplines } from '../../hooks/useDisciplines';
import { useToast } from '../shared/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUnits } from '@/hooks/useUnits';

export function AddStudentModal({ open, onClose, onSuccess }) {
  const { profile } = useAuth();
  const { units, activeUnitId } = useUnits();
  const [form, setForm] = useState({ name: '', age: '', school: '', parent_email: '', unit_id: '' });
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { disciplines } = useDisciplines();
  const toast = useToast();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm({
        name: '',
        age: '',
        school: '',
        parent_email: '',
        unit_id: activeUnitId !== 'all' ? activeUnitId : ''
      });
      setSelectedDisciplines([]);
      setError('');
    }
  }, [open, activeUnitId]);

  const toggleDiscipline = (disc) => {
    setSelectedDisciplines(prev =>
      prev.includes(disc) ? prev.filter(d => d !== disc) : [...prev, disc]
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (form.age && (isNaN(form.age) || parseInt(form.age) < 1)) {
      setError('Idade deve ser um número positivo');
      return;
    }
    if (form.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parent_email)) {
      setError('Email do responsável inválido');
      return;
    }

    const isGlobalAdmin = profile?.role === 'teacher' && !profile.unit_id;
    if (isGlobalAdmin && !form.unit_id) {
      setError('Selecione a unidade do aluno');
      return;
    }

    if (selectedDisciplines.length === 0) {
      setError('Selecione ao menos uma disciplina');
      return;
    }
    setLoading(true);
    setError('');

    const { data: student, error: err } = await studentsApi.create({
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      school: form.school || null,
      parent_email: form.parent_email || null,
      active: true,
      unit_id: isGlobalAdmin ? form.unit_id : (profile?.unit_id || null)
    });

    if (err) {
      toast.error(err.message);
      setLoading(false);
      return;
    }

    // Create modules
    let syncError = false;
    for (const disc of selectedDisciplines) {
      const { error: createErr } = await modulesApi.create({
        student_id: student.id,
        discipline: disc,
        name: disciplines[disc]?.label || disc,
      });
      if (createErr) syncError = true;
    }

    setForm({ name: '', age: '', school: '', parent_email: '' });
    setSelectedDisciplines([]);
    setLoading(false);
    if (syncError) {
      toast.warning('Aluno criado, mas algumas disciplinas não foram salvas.');
    } else {
      toast.success('Aluno criado com sucesso');
    }
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo Aluno">
      <div className="flex flex-col gap-4">
        <Input
          label="Nome completo *"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Nome do aluno"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Idade"
            type="number"
            value={form.age}
            onChange={e => set('age', e.target.value)}
            placeholder="10"
          />
          <Input
            label="Escola"
            value={form.school}
            onChange={e => set('school', e.target.value)}
            placeholder="Nome da escola"
          />
        </div>
        <Input
          label="Email do responsável"
          type="email"
          value={form.parent_email}
          onChange={e => set('parent_email', e.target.value)}
          placeholder="pai@email.com"
        />

        {profile?.role === 'teacher' && !profile.unit_id && (
          <Select
            label="Unidade *"
            value={form.unit_id}
            onChange={e => set('unit_id', e.target.value)}
            required
          >
            <option value="">Selecione a unidade...</option>
            {units.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        )}

        <div>
          <div className="text-xs font-semibold text-text-2 mb-2 select-none">Disciplinas *</div>
          <div className="flex flex-wrap gap-2">
            {disciplines && Object.entries(disciplines).map(([key, d]) => {
              const isSelected = selectedDisciplines.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleDiscipline(key)}
                  className={`px-4 py-1.5 rounded-full border-2 text-xs font-semibold cursor-pointer transition-all select-none ${
                    isSelected
                      ? 'border-transparent text-text'
                      : 'border-border bg-transparent text-text-2 hover:border-text-3'
                  }`}
                  style={isSelected ? { backgroundColor: d.bg, borderColor: d.color, color: d.color } : {}}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger-bg/40 border border-danger/20 text-danger text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Criar aluno'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
