'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Input, Select } from '../shared/Input';
import { Button } from '../shared/Button';
import { schedule as scheduleApi, modules as modulesApi } from '../../lib/api';

const DAYS = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

export function AddScheduleModal({ open, onClose, students, onSuccess }) {
  const [studentId, setStudentId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [studentModules, setStudentModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStudentId('');
      setModuleId('');
      setDayOfWeek('');
      setStartTime('');
      setEndTime('');
      setStudentModules([]);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (!studentId) {
      setStudentModules([]);
      setModuleId('');
      return;
    }
    setModulesLoading(true);
    setModuleId('');
    modulesApi.listByStudent(studentId).then(({ data }) => {
      setStudentModules(data || []);
      setModulesLoading(false);
    });
  }, [studentId]);

  const handleSubmit = async () => {
    if (!studentId || !moduleId || !dayOfWeek || !startTime) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await scheduleApi.create({
      student_id: studentId,
      module_id: moduleId,
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime || null,
      active: true,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title="Adicionar Horário">
      <div className="flex flex-col gap-3.5">
        <Select label="Aluno *" value={studentId} onChange={e => setStudentId(e.target.value)}>
          <option value="">Selecione...</option>
          {(students || []).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>

        <Select label="Disciplina *" value={moduleId} onChange={e => setModuleId(e.target.value)}>
          <option value="">Selecione...</option>
          {studentModules.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </Select>

        <Select label="Dia da semana *" value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
          <option value="">Selecione...</option>
          {DAYS.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Hora início *"
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
          <Input
            label="Hora fim"
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger-bg/40 border border-danger/20 text-danger text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Salvando...' : 'Adicionar'}</Button>
        </div>
      </div>
    </Modal>
  );
}
