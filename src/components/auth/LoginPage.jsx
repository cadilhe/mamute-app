'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center select-none">
          <div className="font-bold text-3xl tracking-tight text-text mb-1">MAMUTE</div>
          <div className="text-xs text-text-3 font-medium">Sistema de Gestão de Ensino</div>
        </div>
        <div className="bg-surface rounded-2xl p-8 border border-border shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && (
              <div className="p-3 rounded-lg bg-danger-bg/40 border border-danger/30 text-danger text-xs font-medium">
                {error}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full mt-1.5 justify-center flex"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
