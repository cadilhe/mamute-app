export function Loading({ text='Carregando...' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48, color:'var(--text-3)', gap:10 }}>
      <div style={{ width:16, height:16, border:'2px solid var(--border)', borderTopColor:'var(--text)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      {text}
      <style>{'@keyframes spin { to { transform: rotate(360deg); }}'}</style>
    </div>
  );
}
export function EmptyState({ icon, title, description }) {
  return (
    <div style={{ textAlign:'center', padding:48, color:'var(--text-3)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon||'📭'}</div>
      <div style={{ fontWeight:600, color:'var(--text-2)', marginBottom:4 }}>{title}</div>
      {description && <div style={{ fontSize:13 }}>{description}</div>}
    </div>
  );
}
