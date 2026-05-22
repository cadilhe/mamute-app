'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Textarea, Select } from '../shared/Input';
import { Button } from '../shared/Button';
import { classes as classesApi } from '../../lib/api';
import { useToast } from '../shared/Toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function EditClassModal({ open, onClose, classItem, student, onSuccess }) {
  const [moduleId, setModuleId] = useState('');
  const [content, setContent] = useState('');
  const [pending, setPending] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const modules = student?.modules || [];

  useEffect(() => {
    if (open && classItem) {
      setModuleId(classItem.module_id || '');
      setContent(classItem.content || '');
      setPending(classItem.pending || '');
      setNextStep(classItem.next_step || '');
    }
  }, [open, classItem]);

  const handleSubmit = async () => {
    if (!moduleId) return;
    setLoading(true);
    const { error: err } = await classesApi.update(classItem.id, {
      module_id: moduleId,
      content,
      pending,
      next_step: nextStep,
    });
    if (err) {
      toast.error(err.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    toast.success('Aula atualizada com sucesso');
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Editar aula — ${student?.name}`}>
      <div className="flex flex-col gap-3.5">
        <div className="text-xs text-text-3 mb-1">
          Data: {classItem && format(new Date(classItem.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>

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
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
