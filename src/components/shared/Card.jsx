export function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-xl border border-border p-5 shadow-sm transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-text-3' : 'cursor-default'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
