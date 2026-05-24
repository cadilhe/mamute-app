'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Loading } from '../shared/Loading';
import { useToast } from '../shared/Toast';
import { payments as paymentsApi, students as studentsApi } from '@/lib/api';
import { EditPaymentModal } from '../finance/EditPaymentModal';

function formatCurrency(value) {
  if (value === undefined || value === null) return 'R$ 0,00';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function FinanceTab({ studentId, student, onStudentUpdate }) {
  const toast = useToast();
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Histórico de pagamentos
  const [history, setHistory] = useState([]);
  
  // Configurações do aluno
  const [monthlyFee, setMonthlyFee] = useState('');
  const [dueDay, setDueDay] = useState('');

  // Edição de cobrança
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Inicializar configurações do aluno
  useEffect(() => {
    if (student) {
      setMonthlyFee(student.monthly_fee || '0.00');
      setDueDay(student.due_day || '');
    }
  }, [student]);

  // Carregar histórico do aluno
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const { data, error } = await paymentsApi.listByStudent(studentId);
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      toast.error('Erro ao carregar histórico financeiro: ' + err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [studentId, toast]);

  useEffect(() => {
    if (studentId) {
      fetchHistory();
    }
  }, [studentId, fetchHistory]);

  // Salvar configurações de mensalidade
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (dueDay !== '' && (Number(dueDay) < 1 || Number(dueDay) > 31)) {
      toast.warning('O dia do vencimento deve ser entre 1 e 31.');
      return;
    }

    try {
      setLoadingConfig(true);
      const payload = {
        monthly_fee: monthlyFee ? Number(monthlyFee) : 0,
        due_day: dueDay ? Number(dueDay) : null,
      };

      const { data, error } = await studentsApi.update(studentId, payload);
      if (error) throw error;

      toast.success('Configurações financeiras salvas com sucesso!');
      if (onStudentUpdate) {
        onStudentUpdate(data);
      }
    } catch (err) {
      toast.error('Erro ao salvar configurações: ' + err.message);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Gerar cobrança automática do mês corrente
  const handleGeneratePayment = async () => {
    if (!student.monthly_fee || Number(student.monthly_fee) <= 0) {
      toast.warning('Defina e salve um valor de mensalidade válido antes de gerar cobranças.');
      return;
    }
    if (!student.due_day) {
      toast.warning('Defina e salve o dia de vencimento padrão antes de gerar cobranças.');
      return;
    }

    try {
      setGenerating(true);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(student.due_day).padStart(2, '0');
      const calculatedDueDate = `${year}-${month}-${day}`;

      // Verificar se já existe uma cobrança para este mesmo aluno com o mesmo vencimento
      const alreadyExists = history.some(p => p.due_date === calculatedDueDate);
      if (alreadyExists) {
        toast.warning(`Já existe uma cobrança lançada para ${formatDate(calculatedDueDate)}.`);
        setGenerating(false);
        return;
      }

      const payload = {
        student_id: studentId,
        due_date: calculatedDueDate,
        amount: Number(student.monthly_fee),
        status: 'pending',
        notes: `Mensalidade gerada automaticamente para o mês de ${today.toLocaleString('pt-BR', { month: 'long' })}.`,
      };

      const { error } = await paymentsApi.create(payload);
      if (error) throw error;

      toast.success('Cobrança do mês gerada com sucesso!');
      fetchHistory();
    } catch (err) {
      toast.error('Erro ao gerar cobrança: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleEditClick = (payment) => {
    // Injetar o objeto student atualizado para o modal de edição conseguir renderizar o nome do aluno corretamente
    const paymentWithStudent = {
      ...payment,
      students: student,
    };
    setSelectedPayment(paymentWithStudent);
    setEditOpen(true);
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setSelectedPayment(null);
    fetchHistory();
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Seção de Configuração Financeira do Aluno */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
          <span>⚙</span> Configuração de Faturamento
        </h3>
        
        <form onSubmit={handleSaveConfig} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-1/3">
            <Input
              label="Valor da Mensalidade (R$)"
              type="number"
              step="0.01"
              min="0"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              placeholder="Ex: 350.00"
              required
            />
          </div>
          
          <div className="w-full sm:w-1/3">
            <Input
              label="Dia de Vencimento Padrão"
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="Ex: 10"
              required
            />
          </div>

          <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
            <Button type="submit" disabled={loadingConfig} className="w-full sm:w-auto">
              {loadingConfig ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </div>
        </form>
      </div>

      {/* Seção de Histórico Financeiro */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 select-none">
          <div>
            <h3 className="text-sm font-bold text-text">Histórico de Cobranças</h3>
            <p className="text-[10px] text-text-3 mt-0.5">Todas as cobranças lançadas para este aluno.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGeneratePayment}
            disabled={generating || loadingHistory}
          >
            {generating ? 'Gerando...' : '⚡ Gerar Cobrança do Mês'}
          </Button>
        </div>

        {loadingHistory ? (
          <div className="py-8"><Loading /></div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-3 flex flex-col items-center gap-1.5 border border-dashed border-border rounded-xl">
            <span>📭</span>
            <span>Nenhuma cobrança registrada no histórico.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-text-2 bg-surface-2/30">
                  <th className="px-4 py-2 font-bold">Vencimento</th>
                  <th className="px-4 py-2 font-bold">Valor</th>
                  <th className="px-4 py-2 font-bold">Status</th>
                  <th className="px-4 py-2 font-bold">Pago Em</th>
                  <th className="px-4 py-2 font-bold">Valor Pago</th>
                  <th className="px-4 py-2 font-bold">Anotações</th>
                  <th className="px-4 py-2 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {history.map((p) => {
                  let statusBadge = '';
                  if (p.status === 'paid') {
                    statusBadge = 'bg-success-bg/40 text-success border-success/20';
                  } else if (p.status === 'pending') {
                    statusBadge = 'bg-warning-bg/40 text-warning border-warning/20';
                  } else {
                    statusBadge = 'bg-danger-bg/40 text-danger border-danger/20';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-surface-2/10">
                      <td className="px-4 py-2.5 font-semibold text-text whitespace-nowrap">
                        {formatDate(p.due_date)}
                      </td>
                      <td className="px-4 py-2.5 text-text-2 whitespace-nowrap font-medium">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold select-none capitalize ${statusBadge}`}>
                          {p.status === 'paid' ? 'pago' : p.status === 'pending' ? 'pendente' : 'atrasado'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-text-2 whitespace-nowrap">
                        {formatDate(p.paid_at)}
                      </td>
                      <td className="px-4 py-2.5 text-text-2 whitespace-nowrap">
                        {p.status === 'paid' ? formatCurrency(p.amount_paid || p.amount) : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-text-3 truncate max-w-[150px]" title={p.notes || ''}>
                        {p.notes || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          className="px-2.5 py-0.5 rounded bg-surface-2 hover:bg-surface-3 border border-border text-[10px] text-text-2 font-semibold transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditPaymentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        payment={selectedPayment}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
