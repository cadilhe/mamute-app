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

export function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center p-12 select-none">
      <div className="text-4xl mb-3">⚠</div>
      <div className="font-semibold text-danger mb-1">Erro ao carregar dados</div>
      <div className="text-xs text-text-3 mb-4 max-w-md mx-auto">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-text text-sm font-medium hover:bg-surface cursor-pointer transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
