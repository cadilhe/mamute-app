'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Textarea, Select } from '../shared/Input';
import { Button } from '../shared/Button';
import { classes as classesApi, notifications as notificationsApi } from '../../lib/api';
import { useToast } from '../shared/Toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RegisterClassModal({ open, onClose, student, onSuccess }) {
  const [moduleId, setModuleId] = useState('');
  const [content, setContent] = useState('');
  const [pending, setPending] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifyParent, setNotifyParent] = useState(!!student?.parent_email);
  const toast = useToast();

  const modules = student?.modules || [];

  useEffect(() => {
    if (open) {
      setNotifyParent(!!student?.parent_email);
    }
  }, [open, student?.parent_email]);

  const handleSubmit = async () => {
    if (!moduleId) return;
    setLoading(true);
    const { error: err } = await classesApi.create({
      student_id: student.id,
      module_id: moduleId,
      date: format(new Date(), 'yyyy-MM-dd'),
      content,
      pending,
      next_step: nextStep,
    });
    if (err) {
      toast.error(err.message);
      setLoading(false);
      return;
    }

    if (notifyParent && student?.parent_email) {
      const activeModule = student.modules?.find(m => m.id === moduleId);
      const disciplineName = activeModule?.name || 'Disciplina';
      const disciplineKey = activeModule?.discipline || '';

      const { error: emailErr } = await notificationsApi.sendClassEmail({
        parentEmail: student.parent_email,
        studentName: student.name,
        disciplineName,
        disciplineKey,
        content,
        pending,
        nextStep,
        formattedDate: format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
      });

      if (emailErr) {
        console.error('Erro ao enviar e-mail:', emailErr);
        toast.warning('Aula registrada, mas a notificação por e-mail falhou.');
      }
    }

    setContent('');
    setPending('');
    setNextStep('');
    setModuleId('');
    setLoading(false);
    toast.success('Aula registrada com sucesso');
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
        <div className="flex items-center gap-2 py-1 select-none">
          <input
            id="notifyParentCheckbox"
            type="checkbox"
            checked={notifyParent}
            disabled={!student?.parent_email}
            onChange={e => setNotifyParent(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-surface accent-text text-text cursor-pointer disabled:cursor-not-allowed"
          />
          <label
            htmlFor="notifyParentCheckbox"
            className={`text-xs font-medium cursor-pointer ${
              student?.parent_email ? 'text-text-2' : 'text-text-3 cursor-not-allowed'
            }`}
          >
            Notificar responsável por e-mail
            {!student?.parent_email && (
              <span className="text-[10px] text-text-3 ml-1.5 font-normal italic">
                (E-mail do responsável não cadastrado)
              </span>
            )}
          </label>
        </div>
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
