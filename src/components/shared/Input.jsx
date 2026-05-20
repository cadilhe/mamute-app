export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-text-2 select-none">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3.5 py-2 rounded-lg border border-border bg-surface text-text text-sm outline-none transition-colors focus:border-text-2 placeholder:text-text-3 ${className}`}
        {...props}
      />
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-text-2 select-none">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3.5 py-2 rounded-lg border border-border bg-surface text-text text-sm outline-none resize-y transition-colors focus:border-text-2 placeholder:text-text-3 ${className}`}
        {...props}
      />
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  children,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-text-2 select-none">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3.5 py-2 rounded-lg border border-border bg-surface text-text text-sm outline-none transition-colors focus:border-text-2 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
