import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ReportModal({ open, onClose, student, classHistory }) {
  if (!student) return null;
  const lastClass = classHistory?.[0];

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
      <div className="flex flex-col gap-5">
        {/* Info */}
        <div className="flex gap-3 items-center">
          <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center font-bold text-2xl text-text select-none shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-base text-text">{student.name}</div>
            <div className="text-xs text-text-3 mt-0.5">
              {student.age && `${student.age} anos`}{student.school && ` · ${student.school}`}
            </div>
          </div>
        </div>

        {/* Last class */}
        {lastClass && (
          <div>
            <div className="text-[10px] font-bold text-text-3 tracking-wider uppercase mb-2 select-none">
              Última Aula
            </div>
            <div className="bg-surface-2 rounded-xl p-4 border border-border/30">
              <div className="text-xs text-text-3 mb-1.5 font-medium">
                {format(new Date(lastClass.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <p className="text-sm leading-relaxed text-text-2">{lastClass.content}</p>
              {lastClass.pending && <p className="text-xs text-warning mt-2 font-medium">⚠ {lastClass.pending}</p>}
              {lastClass.next_step && <p className="text-xs text-success mt-1 font-medium">→ {lastClass.next_step}</p>}
            </div>
          </div>
        )}

        {/* History summary */}
        <div>
          <div className="text-[10px] font-bold text-text-3 tracking-wider uppercase mb-2 select-none">
            Histórico ({classHistory.length} aulas)
          </div>
          <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
            {classHistory.map(c => (
              <div key={c.id} className="flex gap-3 items-center text-xs py-1.5 border-b border-border/50 last:border-0">
                <span className="text-text-3 font-semibold min-w-[70px] shrink-0">
                  {format(new Date(c.date), 'd/MM/yyyy')}
                </span>
                <span className="text-text-2 truncate flex-1">
                  {c.content?.substring(0, 80) || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-1">
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          <Button onClick={handlePrint}>🖨 Imprimir / PDF</Button>
        </div>
      </div>
    </Modal>
  );
}
