'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../shared/Button';
import { Loading } from '../shared/Loading';
import { useToast } from '../shared/Toast';
import { payments as paymentsApi, students as studentsApi } from '@/lib/api';
import { AddPaymentModal } from './AddPaymentModal';
import { EditPaymentModal } from './EditPaymentModal';

// Funções Utilitárias Locais
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

const MONTHS = [
  { value: 'all', label: 'Todos os meses' },
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export function FinancePage() {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Modais
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Carregar dados do Banco
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsRes, studentsRes] = await Promise.all([
        paymentsApi.listAll(),
        studentsApi.list(),
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      if (studentsRes.error) throw studentsRes.error;

      setPayments(paymentsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      toast.error('Erro ao carregar dados financeiros: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lista de Anos disponíveis nos pagamentos para filtrar
  const availableYears = ['all', ...new Set(payments.map(p => p.due_date.split('-')[0]))].sort().reverse();

  // Filtragem dos lançamentos no client
  const filteredPayments = payments.filter((p) => {
    // Busca por nome do aluno
    const studentName = p.students?.name || '';
    const matchSearch = studentName.toLowerCase().includes(search.toLowerCase());

    // Filtro por status
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;

    // Filtro por mês
    const paymentMonth = p.due_date.split('-')[1];
    const matchMonth = monthFilter === 'all' || paymentMonth === monthFilter;

    // Filtro por ano
    const paymentYear = p.due_date.split('-')[0];
    const matchYear = yearFilter === 'all' || paymentYear === yearFilter;

    return matchSearch && matchStatus && matchMonth && matchYear;
  });

  // Cálculos do Resumo Geral (baseado em todos os pagamentos carregados, ou nos filtrados?
  // O faturamento global do painel de resumo normalmente é calculado com base no total do ano/filtro atual ou global.
  // Vamos calcular com base nos pagamentos gerais para dar uma visão do caixa geral, ou baseado no ano selecionado se houver.
  // Vamos basear no ano selecionado para fazer sentido financeiro (ex: ano atual).
  const statsPayments = yearFilter === 'all' 
    ? payments 
    : payments.filter(p => p.due_date.startsWith(yearFilter));

  const totalPaid = statsPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount_paid || p.amount || 0), 0);

  const totalPending = statsPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalOverdue = statsPayments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const handleEditClick = (payment) => {
    setSelectedPayment(payment);
    setEditOpen(true);
  };

  const handleModalSuccess = () => {
    setAddOpen(false);
    setEditOpen(false);
    setSelectedPayment(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Financeiro</h1>
          <p className="text-xs text-text-3 mt-1">
            Gestão de mensalidades, histórico de pagamentos e controle de faturamento.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>+ Novo Lançamento</Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Faturado (Recebido) */}
        <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col gap-1.5 transition-all hover:border-success/20 hover:shadow-lg">
          <div className="text-[10px] font-bold tracking-wider text-text-3 uppercase select-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            Faturado (Recebido) {yearFilter !== 'all' && `(${yearFilter})`}
          </div>
          <div className="text-2xl font-black text-success tracking-tight">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[10px] text-text-3">Valores confirmados no caixa</div>
        </div>

        {/* A receber (Pendente) */}
        <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col gap-1.5 transition-all hover:border-warning/20 hover:shadow-lg">
          <div className="text-[10px] font-bold tracking-wider text-text-3 uppercase select-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            A Receber (Pendente) {yearFilter !== 'all' && `(${yearFilter})`}
          </div>
          <div className="text-2xl font-black text-warning tracking-tight">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-[10px] text-text-3">Cobranças em aberto dentro do prazo</div>
        </div>

        {/* Atrasado */}
        <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col gap-1.5 transition-all hover:border-danger/20 hover:shadow-lg">
          <div className="text-[10px] font-bold tracking-wider text-text-3 uppercase select-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-danger" />
            Atrasado (Inadimplência) {yearFilter !== 'all' && `(${yearFilter})`}
          </div>
          <div className="text-2xl font-black text-danger tracking-tight">
            {formatCurrency(totalOverdue)}
          </div>
          <div className="text-[10px] text-text-3">Cobranças vencidas não pagas</div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome do aluno..."
          className="w-full md:flex-1 px-4 py-2 rounded-lg border border-border bg-surface text-text text-sm outline-none focus:border-text-2 transition-colors placeholder:text-text-3"
        />
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-border bg-surface text-text text-xs font-semibold outline-none cursor-pointer hover:border-text-3 transition-colors"
          >
            <option value="all">Todos os status</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="overdue">Atrasado</option>
          </select>

          {/* Month Filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-border bg-surface text-text text-xs font-semibold outline-none cursor-pointer hover:border-text-3 transition-colors"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-border bg-surface text-text text-xs font-semibold outline-none cursor-pointer hover:border-text-3 transition-colors"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year === 'all' ? 'Todos os anos' : year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center select-none">
            <span className="text-4xl mb-3 text-text-3">💳</span>
            <div className="font-bold text-sm text-text-2">Nenhum lançamento encontrado</div>
            <div className="text-xs text-text-3 mt-1">Experimente ajustar os filtros ou lançar uma nova mensalidade.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-2/30 select-none">
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Aluno</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Vencimento</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Valor Cobrado</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Data Pgto</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Valor Pago</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Observações</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayments.map((p) => {
                  let statusBadge = '';
                  if (p.status === 'paid') {
                    statusBadge = 'bg-success-bg/40 text-success border-success/20';
                  } else if (p.status === 'pending') {
                    statusBadge = 'bg-warning-bg/40 text-warning border-warning/20';
                  } else {
                    statusBadge = 'bg-danger-bg/40 text-danger border-danger/20';
                  }

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-surface-2/15 transition-all group"
                    >
                      <td className="px-5 py-3.5 text-sm font-semibold text-text truncate max-w-[200px]">
                        {p.students?.name || 'Aluno Excluído'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-2 whitespace-nowrap">
                        {formatDate(p.due_date)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text font-medium whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold select-none capitalize ${statusBadge}`}>
                          {p.status === 'paid' ? 'pago' : p.status === 'pending' ? 'pendente' : 'atrasado'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-2 whitespace-nowrap">
                        {formatDate(p.paid_at)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-2 font-medium whitespace-nowrap">
                        {p.status === 'paid' ? formatCurrency(p.amount_paid || p.amount) : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-3 max-w-[180px] truncate" title={p.notes || ''}>
                        {p.notes || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="px-3 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-2 font-medium transition-colors"
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

      {/* Modais */}
      <AddPaymentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        students={students}
        onSuccess={handleModalSuccess}
      />

      <EditPaymentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        payment={selectedPayment}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
