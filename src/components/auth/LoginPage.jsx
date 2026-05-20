import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ marginBottom:32, textAlign:'center' }}>
          <div style={{ fontWeight:700, fontSize:28, letterSpacing:'-1px', marginBottom:4 }}>MAMUTE</div>
          <div style={{ color:'var(--text-3)', fontSize:14 }}>Sistema de Gestão de Ensino</div>
        </div>
        <div style={{ background:'var(--surface)', borderRadius:16, padding:32, border:'1px solid var(--border)', boxShadow:'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required />
            <Input label="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            {error && (
              <div style={{ padding:'10px 12px', borderRadius:8, background:'#FEF2F2', color:'#EF4444', fontSize:13 }}>
                {error}
              </div>
            )}
            <Button type="submit" size="lg" disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
