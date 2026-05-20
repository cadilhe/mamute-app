export function Input({ label, type='text', value, onChange, placeholder, required }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:500, color:'var(--text-2)' }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, outline:'none' }}
        onFocus={e=>e.target.style.borderColor='#1A1916'}
        onBlur={e=>e.target.style.borderColor='var(--border)'} />
    </div>
  );
}
export function Textarea({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:500, color:'var(--text-2)' }}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, outline:'none', resize:'vertical' }}
        onFocus={e=>e.target.style.borderColor='#1A1916'}
        onBlur={e=>e.target.style.borderColor='var(--border)'} />
    </div>
  );
}
export function Select({ label, value, onChange, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:500, color:'var(--text-2)' }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, outline:'none' }}>
        {children}
      </select>
    </div>
  );
}
