import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
  { to: '/', icon: '⬡', label: 'Dashboard' },
  { to: '/alunos', icon: '◈', label: 'Alunos' },
  { to: '/agenda', icon: '◎', label: 'Agenda' },
  { to: '/visao-geral', icon: '◉', label: 'Visão Geral', alert: true },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  return (
    <aside style={{
      width: 'var(--sidebar-w)', minHeight:'100vh', background:'var(--surface)',
      borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column',
      position:'fixed', top:0, left:0, zIndex:100,
    }}>
      {/* Logo */}
      <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontWeight:700, fontSize:18, letterSpacing:'-0.5px' }}>MAMUTE</div>
        <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>Sistema de ensino</div>
      </div>
      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 0' }}>
        {NAV.map(({ to, icon, label, alert }) => (
          <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => ({
            display:'flex', alignItems:'center', gap:10, padding:'10px 20px',
            color: isActive ? 'var(--text)' : 'var(--text-2)',
            background: isActive ? 'var(--surface-2)' : 'transparent',
            fontWeight: isActive ? 600 : 400, fontSize:14,
            transition:'all 0.15s', position:'relative',
          })}>
            <span style={{ fontSize:16 }}>{icon}</span>
            {label}
            {alert && <span style={{ width:6, height:6, borderRadius:'50%', background:'#EF4444', marginLeft:'auto' }} />}
          </NavLink>
        ))}
        <div style={{ height:1, background:'var(--border)', margin:'8px 20px' }} />
        <NavLink to="/pais" style={({ isActive }) => ({
          display:'flex', alignItems:'center', gap:10, padding:'10px 20px',
          color: isActive ? 'var(--text)' : 'var(--text-2)',
          background: isActive ? 'var(--surface-2)' : 'transparent',
          fontWeight: isActive ? 600 : 400, fontSize:14, transition:'all 0.15s',
        })}>
          <span style={{ fontSize:16 }}>♡</span>
          Portal dos Pais
        </NavLink>
      </nav>
      {/* User */}
      <div style={{ padding:16, borderTop:'1px solid var(--border)' }}>
        <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:4 }}>
          {profile?.full_name || 'Professor'}
        </div>
        <button onClick={signOut} style={{
          fontSize:12, color:'var(--text-3)', background:'none', border:'none',
          cursor:'pointer', padding:0,
        }}>
          Sair →
        </button>
      </div>
    </aside>
  );
}
