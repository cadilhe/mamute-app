'use client';

import { useDisciplines } from '../../hooks/useDisciplines';

export function DisciplineBadge({ discipline, size = 'sm', className = '' }) {
  const { disciplines } = useDisciplines();
  const d = (disciplines && disciplines[discipline]) || { label: discipline, color: '#6B7280', bg: 'transparent' };
  
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';
  
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full select-none border border-current/10 whitespace-nowrap ${sizeClass} ${className}`}
      style={{ backgroundColor: d.bg, color: d.color }}
    >
      {d.label}
    </span>
  );
}

export function AlertBadge({ type, className = '' }) {
  const configs = {
    danger: { label: 'Sem aula', classes: 'bg-danger-bg/40 text-danger border-danger/20' },
    warning: { label: 'Pendências', classes: 'bg-warning-bg/40 text-warning border-warning/20' },
    success: { label: 'Em dia', classes: 'bg-success-bg/40 text-success border-success/20' },
  };
  const c = configs[type || 'success'] || configs.success;
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold select-none ${c.classes} ${className}`}>
      {c.label}
    </span>
  );
}
