'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { khan as khanApi } from '../../lib/api';
import { useToast } from '../shared/Toast';

export function AddTopicModal({ open, onClose, khanProfileId, onSuccess }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState('');
  const [subtopics, setSubtopics] = useState([{ name: '', url: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setUrl('');
      setProgress('');
      setSubtopics([{ name: '', url: '' }]);
      setError('');
    }
  }, [open]);

  const setSubtopic = (i, field, value) => {
    setSubtopics(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addSubtopicRow = () => {
    setSubtopics(prev => [...prev, { name: '', url: '' }]);
  };

  const removeSubtopicRow = (i) => {
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

    const { data: topic, error: topicErr } = await khanApi.addTopic({
      khan_profile_id: khanProfileId,
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
    for (const sub of subtopics) {
      if (sub.name.trim()) {
        const { error: subErr } = await khanApi.addSubtopic({
          khan_topic_id: topic.id,
          name: sub.name.trim(),
          url: sub.url || null,
        });
        if (subErr) subErrors = true;
      }
    }

    setLoading(false);
    if (subErrors) {
      toast.warning('Alguns subtópicos não puderam ser salvos.');
    } else {
      toast.success('Tópico adicionado com sucesso');
    }
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title="Adicionar Tópico" width={600}>
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
            {subtopics.map((sub, i) => (
              <div key={i} className="flex items-center gap-2">
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
                {subtopics.length > 1 && (
                  <button
                    onClick={() => removeSubtopicRow(i)}
                    className="bg-transparent border-none cursor-pointer text-text-3 hover:text-danger text-lg leading-none select-none shrink-0"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
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
            {loading ? 'Salvando...' : 'Adicionar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
