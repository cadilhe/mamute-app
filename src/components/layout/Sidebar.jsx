'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useConnection } from '@/hooks/useConnection';

const NAV = [
  { href: '/', icon: '⬡', label: 'Dashboard' },
  { href: '/alunos', icon: '◈', label: 'Alunos' },
  { href: '/agenda', icon: '◎', label: 'Agenda' },
  { href: '/visao-geral', icon: '◉', label: 'Visão Geral' },
  { href: '/financeiro', icon: '¤', label: 'Financeiro' },
  { href: '/disciplinas', icon: '◆', label: 'Disciplinas' },
];

import { useUnits } from '@/hooks/useUnits';

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const { units, activeUnitId, setActiveUnitId } = useUnits();
  const pathname = usePathname();
  const isOnline = useConnection();

  return (
    <aside className="w-[var(--sidebar-w)] min-h-screen bg-surface border-r border-border flex flex-col fixed top-0 left-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MAMUTE Logo" className="w-8 h-8 object-contain" />
          <div>
            <div className="font-bold text-base tracking-tight text-text leading-none">MAMUTE</div>
            <div className="text-[10px] text-text-3 mt-1">Sistema de ensino</div>
          </div>
        </div>

        {/* Unidade do Professor / Seletor de Unidades */}
        {profile?.role === 'teacher' && (
          <div className="mt-0.5">
            {profile.unit_id ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 border border-border text-[10px] font-bold text-text-2 uppercase tracking-wide">
                🏢 {units.find(u => u.id === profile.unit_id)?.name || 'Carregando...'}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-3 uppercase tracking-wider select-none">Unidade Ativa</label>
                <select
                  value={activeUnitId}
                  onChange={(e) => setActiveUnitId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface-2 text-text text-xs outline-none cursor-pointer hover:border-text-3 transition-colors font-medium"
                >
                  <option value="all">Todas as Unidades</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5">
        {profile?.role === 'teacher' && NAV.map(({ href, icon, label, alert }) => {
          const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all relative ${
                isActive
                  ? 'text-text bg-surface-2 font-semibold'
                  : 'text-text-2 hover:bg-surface-2/40 font-normal'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
              {alert && (
                <span className="w-1.5 h-1.5 rounded-full bg-danger ml-auto" />
              )}
            </Link>
          );
        })}
        {profile?.role === 'teacher' && !profile.unit_id && (
          <Link
            href="/usuarios"
            className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all relative ${
              pathname === '/usuarios' || pathname?.startsWith('/usuarios')
                ? 'text-text bg-surface-2 font-semibold'
                : 'text-text-2 hover:bg-surface-2/40 font-normal'
            }`}
          >
            <span className="text-base">👥</span>
            Usuários
          </Link>
        )}
        {profile?.role === 'teacher' && <div className="h-px bg-border my-2 mx-5" />}
        
        {/* Portal dos Pais */}
        {profile?.role === 'parent' && (
          <Link
            href="/pais"
            className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${
              pathname === '/pais'
                ? 'text-text bg-surface-2 font-semibold'
                : 'text-text-2 hover:bg-surface-2/40 font-normal'
            }`}
          >
            <span className="text-base">♡</span>
            Portal dos Pais
          </Link>
        )}
      </nav>

      {/* Offline Status */}
      {!isOnline && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-2.5 text-danger text-xs animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-danger block" />
          <span className="font-semibold">Você está offline</span>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-border flex flex-col gap-1.5">
        <div className="text-xs text-text-3 truncate font-medium">
          {profile?.full_name || 'Professor'}
        </div>
        <button
          onClick={signOut}
          className="text-xs text-text-3 text-left bg-transparent border-none cursor-pointer p-0 hover:text-text-2 transition-colors"
        >
          Sair →
        </button>
      </div>
    </aside>
  );
}
