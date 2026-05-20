'use client';

import { useState, useEffect, useCallback } from 'react';
import { disciplines as disciplinesApi } from '../../lib/api';
import { useDisciplines } from '../../hooks/useDisciplines';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Loading } from '../shared/Loading';

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316',
  '#EF4444', '#06B6D4', '#84CC16', '#6366F1', '#14B8A6', '#E11D48',
];

const PRESET_BGS = {
  '#3B82F6': '#EFF6FF', '#10B981': '#ECFDF5', '#F59E0B': '#FFFBEB',
  '#8B5CF6': '#F5F3FF', '#EC4899': '#FDF2F8', '#F97316': '#FFF7ED',
  '#EF4444': '#FEE2E2', '#06B6D4': '#ECFEFF', '#84CC16': '#F7FEE7',
  '#6366F1': '#EEF2FF', '#14B8A6': '#CCFBF1', '#E11D48': '#FFE4E6',
};

function getBgColor(color) {
  return PRESET_BGS[color] || `${color}1A`;
}

function DisciplineItem({ disc, onEdit, onToggle }) {
  return (
    <div className="bg-surface rounded-xl border border-border px-5 py-3.5 flex items-center gap-4 transition-all hover:shadow-md">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 select-none text-xs font-bold text-white"
        style={{ backgroundColor: disc.color }}
      >
        {disc.label.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text truncate">{disc.label}</div>
        <div className="text-xs text-text-3 mt-0.5 font-mono">
          chave: {disc.key}
          {!disc.active && <span className="text-danger ml-2">(inativa)</span>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onEdit(disc)}
          className="bg-transparent border-none cursor-pointer text-text-3 hover:text-text text-sm font-medium transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onToggle(disc)}
          className={`bg-transparent border-none cursor-pointer text-sm font-medium transition-colors ${
            disc.active ? 'text-danger hover:text-danger/80' : 'text-success hover:text-success/80'
          }`}
        >
          {disc.active ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </div>
  );
}

export function DisciplinasPage() {
  const { refetch: refetchContext } = useDisciplines();
  const [discs, setDiscs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ key: '', label: '', color: '#3B82F6', bg_color: '#EFF6FF' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await disciplinesApi.listAll();
    setDiscs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    if (k === 'color') {
      next.bg_color = getBgColor(v);
    }
    setForm(next);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ key: '', label: '', color: '#3B82F6', bg_color: '#EFF6FF' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (disc) => {
    setEditing(disc);
    setForm({ key: disc.key, label: disc.label, color: disc.color, bg_color: disc.bg_color });
    setError('');
    setShowModal(true);
  };

  const handleToggle = async (disc) => {
    await disciplinesApi.update(disc.id, { active: !disc.active });
    await refetchContext();
    fetch();
  };

  const handleSubmit = async () => {
    if (!form.label.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!form.key.trim()) {
      setError('Chave é obrigatória');
      return;
    }
    if (!editing && !/^[a-z0-9_]+$/.test(form.key.trim())) {
      setError('Chave deve conter apenas letras minúsculas, números e _');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      key: form.key.trim().toLowerCase(),
      label: form.label.trim(),
      color: form.color,
      bg_color: form.bg_color,
    };

    if (editing) {
      const { error: err } = await disciplinesApi.update(editing.id, payload);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await disciplinesApi.create(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowModal(false);
    await refetchContext();
    fetch();
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Disciplinas</h1>
          <p className="text-xs text-text-3 mt-0.5">Gerencie as disciplinas do sistema</p>
        </div>
        <Button onClick={openNew}>+ Nova disciplina</Button>
      </div>

      <div className="flex flex-col gap-2">
        {discs.map(d => (
          <DisciplineItem key={d.id} disc={d} onEdit={openEdit} onToggle={handleToggle} />
        ))}
        {discs.length === 0 && (
          <Card>
            <p className="text-text-3 text-sm text-center py-4">Nenhuma disciplina cadastrada.</p>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Disciplina' : 'Nova Disciplina'}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome *"
            value={form.label}
            onChange={e => set('label', e.target.value)}
            placeholder="Piano"
          />
          <Input
            label="Chave *"
            value={form.key}
            onChange={e => set('key', e.target.value)}
            placeholder="piano"
            disabled={!!editing}
          />
          {editing && (
            <div className="p-3 rounded-lg bg-warning-bg/40 border border-warning/20 text-warning text-xs">
              A chave não pode ser alterada após criar a disciplina.
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-text-2 mb-2 select-none">Cor</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => set('color', c)}
                  className={`w-8 h-8 rounded-lg border-2 cursor-pointer transition-all ${
                    form.color === c ? 'border-text scale-110 shadow-md' : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={e => set('color', e.target.value)}
                className="w-9 h-9 rounded cursor-pointer border-none bg-transparent"
              />
              <span className="text-xs text-text-3 font-mono">{form.color}</span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-surface-2">
            <div className="text-[10px] font-bold text-text-3 tracking-wider mb-2 select-none">
              PREVIEW
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 font-bold rounded-full select-none border text-[10px] px-2 py-0.5"
                style={{ backgroundColor: form.bg_color, color: form.color, borderColor: `${form.color}33` }}
              >
                {form.label || 'Disciplina'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger-bg/40 border border-danger/20 text-danger text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar disciplina'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
