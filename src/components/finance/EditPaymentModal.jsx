'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input, Select, Textarea } from '../shared/Input';
import { ConfirmModal } from '../shared/ConfirmModal';
import { useToast } from '../shared/Toast';
import { payments as paymentsApi } from '@/lib/api';

export function EditPaymentModal({ open, onClose, payment, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('pending');
  const [paidAt, setPaidAt] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  // Carregar os valores do pagamento quando ele mudar ou abrir o modal
  useEffect(() => {
    if (open && payment) {
      setDueDate(payment.due_date || '');
      setAmount(payment.amount || '');
      setStatus(payment.status || 'pending');
      setPaidAt(payment.paid_at || '');
      setAmountPaid(payment.amount_paid || '');
      setNotes(payment.notes || '');
    }
  }, [open, payment]);

  // Se alterar o status para pago, preenche automaticamente data e valor pago se estiverem vazios
  useEffect(() => {
    if (status === 'paid') {
      if (!paidAt) {
        setPaidAt(new Date().toISOString().split('T')[0]);
      }
      if (!amountPaid && amount) {
        setAmountPaid(amount);
      }
    } else {
      setPaidAt('');
      setAmountPaid('');
    }
  }, [status, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dueDate) {
      toast.warning('Informe a data de vencimento.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.warning('O valor deve ser maior que zero.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        due_date: dueDate,
        amount: Number(amount),
        status,
        notes: notes || null,
      };

      if (status === 'paid') {
        payload.paid_at = paidAt || new Date().toISOString().split('T')[0];
        payload.amount_paid = amountPaid ? Number(amountPaid) : Number(amount);
      } else {
        payload.paid_at = null;
        payload.amount_paid = null;
      }

      const { error } = await paymentsApi.update(payment.id, payload);
      if (error) throw error;

      toast.success('Cobrança atualizada com sucesso!');
      onSuccess();
    } catch (err) {
      toast.error('Erro ao atualizar cobrança: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const { error } = await paymentsApi.remove(payment.id);
      if (error) throw error;

      toast.success('Lançamento excluído com sucesso!');
      setDeleteConfirmOpen(false);
      onSuccess();
    } catch (err) {
      toast.error('Erro ao excluir lançamento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <>
      <Modal open={open} onClose={onClose} title={`Editar Lançamento — ${payment.students?.name || 'Aluno'}`} width={480}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de Vencimento"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <Input
              label="Valor Cobrado (R$)"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="overdue">Atrasado</option>
          </Select>

          {status === 'paid' && (
            <div className="grid grid-cols-2 gap-4 border border-border bg-surface-2/45 p-3 rounded-xl animate-fade-in">
              <Input
                label="Data do Pagamento"
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                required
              />
              <Input
                label="Valor Pago (R$)"
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                required
              />
            </div>
          )}

          <Textarea
            label="Observações / Anotações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Pagamento parcelado ou observações."
          />

          <div className="flex justify-between items-center pt-4 border-t border-border mt-2">
            <Button
              variant="danger"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={loading}
            >
              Excluir
            </Button>
            <div className="flex gap-2.5">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o lançamento financeiro de ${payment.students?.name || 'aluno'} no valor de R$ ${Number(payment.amount).toFixed(2)}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Lançamento"
        cancelText="Voltar"
        loading={loading}
      />
    </>
  );
}
