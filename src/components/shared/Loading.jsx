export function Loading({ text = 'Carregando...' }) {
  return (
    <div className="flex items-center justify-center p-12 text-text-3 gap-2.5 select-none">
      <div className="w-4 h-4 border-2 border-border border-t-text rounded-full animate-spin" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

export function EmptyState({ icon, title, description, className = '' }) {
  return (
    <div className={`text-center p-12 text-text-3 select-none ${className}`}>
      <div className="text-4xl mb-3">{icon || '📭'}</div>
      <div className="font-semibold text-text-2 mb-1">{title}</div>
      {description && <div className="text-xs">{description}</div>}
    </div>
  );
}
