export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyle = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all duration-150 justify-center select-none";
  
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5",
  };
  
  const variants = {
    primary: "bg-text text-bg hover:bg-text/90 active:scale-[0.98]",
    secondary: "bg-surface-2 border border-border text-text hover:bg-surface-2/80 active:scale-[0.98]",
    ghost: "bg-transparent text-text-2 hover:bg-surface-2/40 hover:text-text",
    danger: "bg-danger-bg border border-danger/20 text-danger hover:bg-danger-bg/80 active:scale-[0.98]",
  };
  
  const disabledStyle = "opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${disabled ? disabledStyle : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
