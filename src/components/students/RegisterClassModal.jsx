'use client';

import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Textarea, Select } from '../shared/Input';
import { Button } from '../shared/Button';
import { classes as classesApi } from '../../lib/api';
import { format } from 'date-fns';

export function RegisterClassModal({ open, onClose, student, onSuccess }) {
  const [moduleId, setModuleId] = useState('');
  const [content, setContent] = useState('');
  const [pending, setPending] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [loading, setLoading] = useState(false);

  const modules = student?.modules || [];

  const handleSubmit = async () => {
    if (!moduleId) return;
    setLoading(true);
    await classesApi.create({
      student_id: student.id,
      module_id: moduleId,
      date: format(new Date(), 'yyyy-MM-dd'),
      content,
      pending,
      next_step: nextStep,
    });
    setContent('');
    setPending('');
    setNextStep('');
    setModuleId('');
    setLoading(false);
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Registrar aula — ${student?.name}`}>
      <div className="flex flex-col gap-3.5">
        <Select label="Disciplina *" value={moduleId} onChange={e => setModuleId(e.target.value)}>
          <option value="">Selecione...</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
        <Textarea
          label="O que foi feito na aula"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Descreva o conteúdo da aula..."
          rows={4}
        />
        <Textarea
          label="Pendências / tarefas"
          value={pending}
          onChange={e => setPending(e.target.value)}
          placeholder="O que ficou pendente..."
          rows={2}
        />
        <Textarea
          label="Próximo passo"
          value={nextStep}
          onChange={e => setNextStep(e.target.value)}
          placeholder="O que será feito na próxima aula..."
          rows={2}
        />
        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading || !moduleId}>
            {loading ? 'Salvando...' : 'Registrar aula'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
