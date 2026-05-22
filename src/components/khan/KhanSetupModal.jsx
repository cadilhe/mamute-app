'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { khan as khanApi } from '../../lib/api';

export function KhanSetupModal({ open, onClose, studentId, profile, onSuccess }) {
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [streak, setStreak] = useState('');
  const [minutes, setMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setUsername(profile?.khan_username || '');
      setProfileUrl(profile?.profile_url || '');
      setStreak(profile?.streak_days ? String(profile.streak_days) : '');
      setMinutes(profile?.minutes_week ? String(profile.minutes_week) : '');
      setError('');
    }
  }, [open, profile]);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Username é obrigatório');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await khanApi.saveProfile({
      student_id: studentId,
      khan_username: username.trim(),
      profile_url: profileUrl || null,
      streak_days: streak ? parseInt(streak) : 0,
      minutes_week: minutes ? parseInt(minutes) : 0,
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
    <Modal open={open} onClose={onClose} title={profile ? 'Editar perfil Khan' : 'Configurar Khan Academy'}>
      <div className="flex flex-col gap-3.5">
        <Input
          label="Username Khan *"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="@khanuser"
        />
        <Input
          label="URL do perfil"
          value={profileUrl}
          onChange={e => setProfileUrl(e.target.value)}
          placeholder="https://pt.khanacademy.org/profile/..."
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Streak (dias)"
            type="number"
            value={streak}
            onChange={e => setStreak(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Minutos/semana"
            type="number"
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            placeholder="0"
          />
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
