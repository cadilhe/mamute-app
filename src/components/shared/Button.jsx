export function Button({ children, variant='primary', size='md', onClick, disabled, type='button', style }) {
  const vs = {
    primary: { background:'#1A1916', color:'#fff' },
    secondary: { background:'var(--surface-2)', color:'var(--text)' },
    ghost: { background:'transparent', color:'var(--text-2)' },
    danger: { background:'#FEF2F2', color:'#EF4444' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', gap:6, fontWeight:500,
      borderRadius:8, cursor:disabled?'not-allowed':'pointer', transition:'all 0.15s',
      border:'none', fontFamily:'inherit', opacity:disabled?0.5:1,
      fontSize:size==='sm'?12:size==='lg'?15:13,
      padding:size==='sm'?'5px 12px':size==='lg'?'11px 20px':'7px 16px',
      ...vs[variant], ...style }}>
      {children}
    </button>
  );
}
