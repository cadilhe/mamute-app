'use client';

import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { useToast } from '../shared/Toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DISCIPLINES } from '../../lib/constants';

export function ReportModal({ open, onClose, student, classHistory }) {
  const [loadingPDF, setLoadingPDF] = useState(false);
  const toast = useToast();

  if (!student) return null;
  const lastClass = classHistory?.[0];

  const handleDownloadPDF = async () => {
    setLoadingPDF(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 14;
      const contentWidth = pageWidth - 2 * margin; // 182mm

      // --- Header ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(23, 23, 26);
      doc.text('MAMUTE', margin, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(136, 136, 160);
      doc.text('SISTEMA DE GESTÃO DE ENSINO', margin, 24);

      doc.setDrawColor(42, 42, 48);
      doc.setLineWidth(0.5);
      doc.line(margin, 28, pageWidth - margin, 28);

      // Student Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 15, 16);
      doc.text(student.name, margin, 38);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(88, 88, 111);
      const details = [];
      if (student.age) details.push(`${student.age} anos`);
      if (student.school) details.push(student.school);
      details.push(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
      doc.text(details.join('  ·  '), margin, 43);

      let currentY = 52;

      // --- Section: Progresso por Disciplina ---
      const progressData = student.progress || [];
      if (progressData.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(23, 23, 26);
        doc.text('Progresso das Disciplinas', margin, currentY);
        
        const tableRows = progressData.map(p => {
          const disc = DISCIPLINES[p.discipline];
          const label = disc?.label || p.discipline;
          return [label, `${p.percent}%`, p.notes || '—'];
        });

        autoTable(doc, {
          startY: currentY + 3,
          head: [['Disciplina', 'Progresso', 'Observações / Metas']],
          body: tableRows,
          theme: 'striped',
          headStyles: { fillColor: [23, 23, 26], textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 8.5, cellPadding: 3.5, font: 'helvetica' },
          columnStyles: {
            0: { cellWidth: 35, fontStyle: 'bold' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: contentWidth - 60 }
          }
        });
        
        currentY = doc.lastAutoTable.finalY + 10;
      }

      // --- Section: Última Aula ---
      if (lastClass) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(23, 23, 26);
        doc.text('Última Aula Registrada', margin, currentY);

        const formattedClassDate = lastClass.date
          ? format(new Date(lastClass.date), "dd/MM/yyyy")
          : '—';
        const disciplineName = lastClass.modules?.name || '—';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text(`${disciplineName}  (${formattedClassDate})`, margin, currentY + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        
        const contentText = lastClass.content || 'Sem descrição cadastrada.';
        const splitContent = doc.splitTextToSize(`Conteúdo: ${contentText}`, contentWidth);
        doc.text(splitContent, margin, currentY + 10.5);
        
        let nextLineY = currentY + 10.5 + (splitContent.length * 4.5);

        if (lastClass.pending) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(245, 158, 11);
          const splitPending = doc.splitTextToSize(`Pendências: ${lastClass.pending}`, contentWidth);
          doc.text(splitPending, margin, nextLineY);
          nextLineY += (splitPending.length * 4.5);
        }

        if (lastClass.next_step) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129);
          const splitNext = doc.splitTextToSize(`Próximo Passo: ${lastClass.next_step}`, contentWidth);
          doc.text(splitNext, margin, nextLineY);
          nextLineY += (splitNext.length * 4.5);
        }

        currentY = nextLineY + 6;
      }

      // --- Section: Histórico Completo ---
      if (classHistory && classHistory.length > 0) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(23, 23, 26);
        doc.text(`Histórico Completo (${classHistory.length} aulas)`, margin, currentY);

        const historyRows = classHistory.map(c => [
          c.date ? format(new Date(c.date), 'dd/MM/yyyy') : '—',
          c.modules?.name || '—',
          c.content || '—',
          c.pending || '—'
        ]);

        autoTable(doc, {
          startY: currentY + 3,
          head: [['Data', 'Disciplina', 'Conteúdo da Aula', 'Pendências']],
          body: historyRows,
          theme: 'striped',
          headStyles: { fillColor: [23, 23, 26], textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 8.5, cellPadding: 3.5, font: 'helvetica' },
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 28 },
            2: { cellWidth: 82 },
            3: { cellWidth: 50 }
          }
        });
      }

      // Save PDF
      const sanitizedStudentName = student.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_');
      
      const formattedDate = format(new Date(), 'yyyy-MM-dd');
      doc.save(`Relatorio_${sanitizedStudentName}_${formattedDate}.pdf`);
      toast.success('Relatório PDF baixado com sucesso');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar relatório em PDF');
    } finally {
      setLoadingPDF(false);
    }
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
                {lastClass.date ? format(new Date(lastClass.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : '—'}
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
                  {c.date ? format(new Date(c.date), 'd/MM/yyyy') : '—'}
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
          <Button onClick={handleDownloadPDF} disabled={loadingPDF}>
            {loadingPDF ? 'Gerando...' : '📥 Baixar PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
