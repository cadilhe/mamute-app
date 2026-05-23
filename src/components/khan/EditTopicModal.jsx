'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { ConfirmModal } from '../shared/ConfirmModal';
import { khan as khanApi } from '../../lib/api';
import { useToast } from '../shared/Toast';

export function EditTopicModal({ open, onClose, topic, onSuccess }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState('');
  const [subtopics, setSubtopics] = useState([]);
  const [subtopicsToRemove, setSubtopicsToRemove] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && topic) {
      setName(topic.name || '');
      setUrl(topic.url || '');
      setProgress(topic.progress !== undefined ? String(topic.progress) : '');
      setSubtopics((topic.khan_subtopics || []).map(s => ({ ...s })));
      setSubtopicsToRemove([]);
      setError('');
    }
  }, [open, topic]);

  const setSubtopic = (i, field, value) => {
    setSubtopics(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addSubtopicRow = () => {
    setSubtopics(prev => [...prev, { name: '', url: '' }]);
  };

  const removeSubtopicRow = (i) => {
    const target = subtopics[i];
    if (target.id) {
      setSubtopicsToRemove(prev => [...prev, target.id]);
    }
    setSubtopics(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Nome do tópico é obrigatório');
      return;
    }
    if (url && !/^https?:\/\/.+/.test(url)) {
      setError('URL inválida (deve começar com http:// ou https://)');
      return;
    }
    if (progress && (isNaN(progress) || parseInt(progress) < 0 || parseInt(progress) > 100)) {
      setError('Progresso deve ser um número entre 0 e 100');
      return;
    }
    for (const sub of subtopics) {
      if (sub.url && !/^https?:\/\/.+/.test(sub.url)) {
        setError(`URL do subtópico "${sub.name || 'sem nome'}" inválida`);
        return;
      }
    }
    setLoading(true);
    setError('');

    // 1. Update basic topic details
    const { error: topicErr } = await khanApi.updateTopic(topic.id, {
      name: name.trim(),
      url: url || null,
      progress: progress ? parseInt(progress) : 0,
    });

    if (topicErr) {
      toast.error(topicErr.message);
      setLoading(false);
      return;
    }

    let subErrors = false;

    // 2. Delete subtopics marked for removal
    for (const subId of subtopicsToRemove) {
      const { error: removeErr } = await khanApi.removeSubtopic(subId);
      if (removeErr) subErrors = true;
    }

    // 3. Add or update remaining subtopics
    for (const sub of subtopics) {
      if (!sub.name.trim()) continue;
      
      if (sub.id) {
        // Update existing subtopic
        const { error: updateErr } = await khanApi.updateSubtopic(sub.id, {
          name: sub.name.trim(),
          url: sub.url || null,
        });
        if (updateErr) subErrors = true;
      } else {
        // Add new subtopic
        const { error: addErr } = await khanApi.addSubtopic({
          khan_topic_id: topic.id,
          name: sub.name.trim(),
          url: sub.url || null,
        });
        if (addErr) subErrors = true;
      }
    }

    setLoading(false);
    if (subErrors) {
      toast.warning('Tópico atualizado, mas alguns subtópicos não puderam ser salvos.');
    } else {
      toast.success('Tópico atualizado com sucesso');
    }
    onSuccess();
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    const { error: err } = await khanApi.removeTopic(topic.id);
    if (err) {
      toast.error(err.message);
      setDeleting(false);
      setShowConfirmDelete(false);
      return;
    }
    setDeleting(false);
    setShowConfirmDelete(false);
    toast.success('Tópico excluído com sucesso');
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar Tópico" width={600}>
      <div className="flex flex-col gap-3.5">
        <Input
          label="Nome do tópico *"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Álgebra"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Link do tópico no Khan"
          />
          <Input
            label="Progresso (%)"
            type="number"
            value={progress}
            onChange={e => setProgress(e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-text-2 select-none">Subtópicos</span>
            <Button variant="ghost" size="sm" onClick={addSubtopicRow}>+ Subtópico</Button>
          </div>
          <div className="flex flex-col gap-2">
            {subtopics.length === 0 ? (
              <p className="text-text-3 text-xs italic select-none py-1">Nenhum subtópico adicionado.</p>
            ) : (
              subtopics.map((sub, i) => (
                <div key={sub.id || i} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      value={sub.name}
                      onChange={e => setSubtopic(i, 'name', e.target.value)}
                      placeholder="Nome"
                      className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-text text-xs outline-none focus:border-text-2 placeholder:text-text-3"
                    />
                    <input
                      value={sub.url}
                      onChange={e => setSubtopic(i, 'url', e.target.value)}
                      placeholder="URL"
                      className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-text text-xs outline-none focus:border-text-2 placeholder:text-text-3"
                    />
                  </div>
                  <button
                    onClick={() => removeSubtopicRow(i)}
                    className="bg-transparent border-none cursor-pointer text-text-3 hover:text-danger text-lg leading-none select-none shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
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
        title="Excluir Tópico"
        message="Tem certeza que deseja excluir este tópico e todos os seus subtópicos correspondentes da Khan Academy?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </Modal>
  );
}
