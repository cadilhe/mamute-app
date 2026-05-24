'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input, Select } from '../shared/Input';
import { useToast } from '../shared/Toast';
import { supabase } from '@/lib/supabase';

export function AddUserModal({ open, onClose, units, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('teacher-local'); // teacher-local, teacher-global, parent
  const [unitId, setUnitId] = useState('');

  useEffect(() => {
    if (open) {
      setFullName('');
      setEmail('');
      setPassword('');
      setUserType('teacher-local');
      setUnitId('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.warning('Informe o nome completo.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning('Informe um e-mail válido.');
      return;
    }
    if (!password || password.length < 6) {
      toast.warning('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (userType === 'teacher-local' && !unitId) {
      toast.warning('Selecione a unidade do professor.');
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');

      const role = userType === 'parent' ? 'parent' : 'teacher';
      const unit = userType === 'teacher-local' ? unitId : null;

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
          unit_id: unit
        })
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      toast.success('Usuário criado com sucesso!');
      onSuccess();
    } catch (err) {
      toast.error('Erro ao criar usuário: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo Usuário" width={480}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome Completo *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ex: Ana Souza"
          required
        />
        
        <Input
          label="E-mail *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ana@email.com"
          required
        />

        <Input
          label="Senha Provisória *"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 caracteres"
          required
        />

        <Select
          label="Nível / Função *"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          required
        >
          <option value="teacher-local">Professor (Unidade Específica)</option>
          <option value="teacher-global">Administrador Global (Coordenador)</option>
          <option value="parent">Responsável (Pai / Mãe)</option>
        </Select>

        {userType === 'teacher-local' && (
          <Select
            label="Unidade do Professor *"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            required
          >
            <option value="">Selecione a unidade...</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
