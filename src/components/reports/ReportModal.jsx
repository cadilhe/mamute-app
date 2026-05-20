import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { DISCIPLINES } from '../../lib/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ReportModal({ open, onClose, student, classHistory }) {
  if (!student) return null;
  const lastClass = classHistory?.[0];
  const pendencies = classHistory?.filter(c => c.pending?.trim()) || [];

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>Relatório - ' + student.name + '</title>');
    win.document.write('<style>body{font-family:sans-serif;padding:32px;max-width:800px;margin:0 auto}h1{font-size:24px;margin-bottom:4px}table{width:100%;border-collapse:collapse}td,th{padding:8px 12px;border:1px solid #ddd;font-size:13px}.badge{padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}</style>');
    win.document.write('</head><body>');
    win.document.write('<h1>' + student.name + '</h1>');
    win.document.write('<p style="color:#888;margin-bottom:24px">' + (student.age ? student.age+' anos' : '') + (student.school ? ' · ' + student.school : '') + '</p>');
    if (lastClass) {
      win.document.write('<h2>Última Aula</h2><p>' + lastClass.content + '</p>');
      if (lastClass.pending) win.document.write('<p><strong>Pendências:</strong> ' + lastClass.pending + '</p>');
      if (lastClass.next_step) win.document.write('<p><strong>Próximo passo:</strong> ' + lastClass.next_step + '</p>');
    }
    win.document.write('<h2>Histórico (' + classHistory.length + ' aulas)</h2>');
    win.document.write('<table><tr><th>Data</th><th>Disciplina</th><th>Conteúdo</th></tr>');
    classHistory.forEach(c => {
      win.document.write('<tr><td>' + format(new Date(c.date), "d/MM/yyyy") + '</td><td>' + (c.modules?.name||'—') + '</td><td>' + (c.content||'—') + '</td></tr>');
    });
    win.document.write('</table></body></html>');
    win.document.close();
    win.print();
  };

  return (
    <Modal open={open} onClose={onClose} title={"Relatório — " + student.name} width={640}>
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {/* Info */}
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:22 }}>
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>{student.name}</div>
            <div style={{ color:'var(--text-3)', fontSize:13 }}>
              {student.age && `${student.age} anos`}{student.school && ` · ${student.school}`}
            </div>
          </div>
        </div>

        {/* Last class */}
        {lastClass && (
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Última Aula</div>
            <div style={{ background:'var(--surface-2)', borderRadius:10, padding:14 }}>
              <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:6 }}>
                {format(new Date(lastClass.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <p style={{ fontSize:14, lineHeight:1.6 }}>{lastClass.content}</p>
              {lastClass.pending && <p style={{ color:'#F59E0B', fontSize:13, marginTop:8 }}>⚠ {lastClass.pending}</p>}
              {lastClass.next_step && <p style={{ color:'#10B981', fontSize:13, marginTop:4 }}>→ {lastClass.next_step}</p>}
            </div>
          </div>
        )}

        {/* History summary */}
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>
            Histórico ({classHistory.length} aulas)
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:200, overflow:'auto' }}>
            {classHistory.map(c => (
              <div key={c.id} style={{ display:'flex', gap:10, alignItems:'center', fontSize:13, padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--text-3)', minWidth:80, fontSize:12 }}>{format(new Date(c.date), 'd/MM/yyyy')}</span>
                <span style={{ color:'var(--text-2)' }}>{c.content?.substring(0,80) || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          <Button onClick={handlePrint}>🖨 Imprimir / PDF</Button>
        </div>
      </div>
    </Modal>
  );
}
