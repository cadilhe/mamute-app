import { useEffect } from 'react';
export function Modal({ open, onClose, title, children, width=560 }) {
  useEffect(() => {
    const h = (e) => e.key==='Escape' && onClose();
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'var(--surface)', borderRadius:16, width:'100%', maxWidth:width, maxHeight:'90vh', overflow:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        {title && (
          <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h3 style={{ fontWeight:600, fontSize:16 }}>{title}</h3>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--text-3)', lineHeight:1 }}>×</button>
          </div>
        )}
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}
