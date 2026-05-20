import { DISCIPLINES } from '../../lib/constants';
export function DisciplineBadge({ discipline, size = 'sm' }) {
  const d = DISCIPLINES[discipline] || { label: discipline, color: '#6B7280', bg: '#F9FAFB' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4,
      padding: size==='sm'?'2px 8px':'4px 12px', borderRadius:20,
      background:d.bg, color:d.color, fontWeight:600,
      fontSize:size==='sm'?11:13, whiteSpace:'nowrap' }}>
      {d.label}
    </span>
  );
}
export function AlertBadge({ type }) {
  const c = {
    danger: { label:'Sem aula', bg:'#FEF2F2', color:'#EF4444' },
    warning: { label:'Pendências', bg:'#FFFBEB', color:'#F59E0B' },
    success: { label:'Em dia', bg:'#ECFDF5', color:'#10B981' },
  }[type || 'success'];
  return <span style={{ padding:'2px 10px', borderRadius:20, background:c.bg, color:c.color, fontWeight:600, fontSize:11 }}>{c.label}</span>;
}
