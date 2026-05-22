'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Input, Textarea } from '../shared/Input';
import { Button } from '../shared/Button';
import { students as studentsApi, modules as modulesApi } from '../../lib/api';
import { useDisciplines } from '../../hooks/useDisciplines';
import { useToast } from '../shared/Toast';

export function EditStudentModal({ open, onClose, student, onSuccess }) {
  const [form, setForm] = useState({ name: '', age: '', school: '', parent_email: '', notes: '' });
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { disciplines } = useDisciplines();
  const toast = useToast();

  useEffect(() => {
    if (open && student) {
      setForm({
        name: student.name || '',
        age: student.age ? String(student.age) : '',
        school: student.school || '',
        parent_email: student.parent_email || '',
        notes: student.notes || '',
      });
      setSelectedDisciplines((student.modules || []).map(m => m.discipline));
      setError('');
    }
  }, [open, student]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
    if (selectedDisciplines.length === 0) {
      setError('Selecione ao menos uma disciplina');
      return;
    }
    setLoading(true);
    setError('');

    const { error: err } = await studentsApi.update(student.id, {
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      school: form.school || null,
      parent_email: form.parent_email || null,
      notes: form.notes || null,
    });

    if (err) {
      toast.error(err.message);
      setLoading(false);
      return;
    }

    // Sync modules: remove deselected, add newly selected
    const existingModules = student.modules || [];
    const existingDisciplines = existingModules.map(m => m.discipline);

    const toRemove = existingModules.filter(m => !selectedDisciplines.includes(m.discipline));
    const toAdd = selectedDisciplines.filter(d => !existingDisciplines.includes(d));

    let syncError = false;
    for (const m of toRemove) {
      const { error: removeErr } = await modulesApi.remove(m.id);
      if (removeErr) syncError = true;
    }

    for (const disc of toAdd) {
      const { error: createErr } = await modulesApi.create({
        student_id: student.id,
        discipline: disc,
        name: disciplines[disc]?.label || disc,
      });
      if (createErr) syncError = true;
    }

    setLoading(false);
    if (syncError) {
      toast.warning('Aluno salvo, mas algumas disciplinas não foram sincronizadas.');
    } else {
      toast.success('Aluno atualizado com sucesso');
    }
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar Aluno">
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
        <Textarea
          label="Observações"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Notas internas sobre o aluno"
          rows={3}
        />

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
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
