'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Select } from '../shared/Input';
import { Button } from '../shared/Button';
import { parents as parentsApi } from '../../lib/api';
import { useToast } from '../shared/Toast';

export function LinkParentModal({ open, onClose, student, onSuccess }) {
  const toast = useToast();
  const [parentList, setParentList] = useState([]);
  const [linkedParentIds, setLinkedParentIds] = useState(new Set());
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && student) {
      setParentId('');
      setError('');
      Promise.all([
        parentsApi.list(),
        parentsApi.getByStudent(student.id),
      ]).then(([listRes, linkedRes]) => {
        setParentList(listRes.data || []);
        setLinkedParentIds(new Set((linkedRes.data || []).map(r => r.parent_id)));
      });
    }
  }, [open, student]);

  const available = parentList.filter(p => !linkedParentIds.has(p.id));

  const handleSubmit = async () => {
    if (!parentId) {
      setError('Selecione um responsável');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await parentsApi.link(parentId, student.id);
    if (err) {
      if (err.code === '23505') {
        toast.error('Este responsável já está vinculado a este aluno.');
      } else {
        toast.error(err.message);
      }
      setLoading(false);
      return;
    }
    setLoading(false);
    toast.success('Responsável vinculado com sucesso');
    onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Vincular Responsável — ${student?.name}`}>
      <div className="flex flex-col gap-3.5">
        <Select label="Responsável *" value={parentId} onChange={e => setParentId(e.target.value)}>
          <option value="">Selecione...</option>
          {available.map(p => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </Select>

        {parentList.length === 0 && (
          <p className="text-text-3 text-xs">
            Nenhum responsável cadastrado. Crie um usuário com role "parent" no Supabase.
          </p>
        )}

        {available.length === 0 && parentList.length > 0 && (
          <p className="text-text-3 text-xs">
            Todos os responsáveis já estão vinculados a este aluno.
          </p>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-danger-bg/40 border border-danger/20 text-danger text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading || !parentId}>
            {loading ? 'Vinculando...' : 'Vincular'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
