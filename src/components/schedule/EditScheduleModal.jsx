'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Input, Select } from '../shared/Input';
import { Button } from '../shared/Button';
import { schedule as scheduleApi, modules as modulesApi } from '../../lib/api';
import { useToast } from '../shared/Toast';
import { ConfirmModal } from '../shared/ConfirmModal';

const DAYS = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

export function EditScheduleModal({ open, onClose, scheduleItem, students, onSuccess }) {
  const toast = useToast();
  const [studentId, setStudentId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [studentModules, setStudentModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && scheduleItem) {
      setStudentId(scheduleItem.student_id || '');
      setModuleId(scheduleItem.module_id || '');
      setDayOfWeek(String(scheduleItem.day_of_week) || '');
      setStartTime(scheduleItem.start_time ? scheduleItem.start_time.slice(0, 5) : '');
      setEndTime(scheduleItem.end_time ? scheduleItem.end_time.slice(0, 5) : '');
      setShowConfirmDelete(false);
      setError('');
    }
  }, [open, scheduleItem]);

  useEffect(() => {
    if (!studentId) {
      setStudentModules([]);
      return;
    }
    setModulesLoading(true);
    modulesApi.listByStudent(studentId).then(({ data, error: err }) => {
      if (err) {
        setStudentModules([]);
      } else {
        setStudentModules(data || []);
      }
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
    const { error: err } = await scheduleApi.update(scheduleItem.id, {
      student_id: studentId,
      module_id: moduleId,
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime || null,
    });
    if (err) {
      toast.error(err.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    toast.success('Horário atualizado com sucesso');
    onSuccess();
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    const { error: err } = await scheduleApi.remove(scheduleItem.id);
    if (err) {
      toast.error(err.message);
      setDeleting(false);
      setShowConfirmDelete(false);
      return;
    }
    setDeleting(false);
    setShowConfirmDelete(false);
    toast.success('Horário excluído com sucesso');
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar Horário">
      <div className="flex flex-col gap-3.5">
        <Select label="Aluno *" value={studentId} onChange={e => setStudentId(e.target.value)}>
          <option value="">Selecione...</option>
          {(students || []).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>

        <Select
          label="Disciplina *"
          value={moduleId}
          onChange={e => setModuleId(e.target.value)}
          disabled={modulesLoading}
        >
          <option value="">{modulesLoading ? 'Carregando disciplinas...' : 'Selecione...'}</option>
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

        <div className="flex justify-between items-center pt-2 border-t border-border mt-1.5">
          <Button variant="danger" onClick={() => setShowConfirmDelete(true)} disabled={loading || deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={onClose} disabled={loading || deleting}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading || deleting}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Excluir Horário"
        message="Tem certeza que deseja excluir este horário da agenda?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </Modal>
  );
}
