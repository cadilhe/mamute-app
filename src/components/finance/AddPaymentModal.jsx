'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input, Select, Textarea } from '../shared/Input';
import { useToast } from '../shared/Toast';
import { payments as paymentsApi } from '@/lib/api';

export function AddPaymentModal({ open, onClose, students, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [studentId, setStudentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('pending');
  const [paidAt, setPaidAt] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  // Resetar campos ao abrir o modal
  useEffect(() => {
    if (open) {
      setStudentId('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setStatus('pending');
      setPaidAt('');
      setAmountPaid('');
      setNotes('');
    }
  }, [open]);

  // Se o status for alterado para 'paid', preenchemos automaticamente a data e valor pago
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

  const handleStudentChange = (e) => {
    const id = e.target.value;
    setStudentId(id);
    const student = students.find(s => s.id === id);
    if (student) {
      setAmount(student.monthly_fee || 0);
      if (student.due_day) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(student.due_day).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}`);
      } else {
        setDueDate(new Date().toISOString().split('T')[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.warning('Selecione um aluno.');
      return;
    }
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
        student_id: studentId,
        due_date: dueDate,
        amount: Number(amount),
        status,
        notes: notes || null,
      };

      if (status === 'paid') {
        payload.paid_at = paidAt || new Date().toISOString().split('T')[0];
        payload.amount_paid = amountPaid ? Number(amountPaid) : Number(amount);
      }

      const { error } = await paymentsApi.create(payload);
      if (error) throw error;

      toast.success('Cobrança lançada com sucesso!');
      onSuccess();
    } catch (err) {
      toast.error('Erro ao lançar cobrança: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo Lançamento Financeiro" width={480}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Aluno"
          value={studentId}
          onChange={handleStudentChange}
          required
        >
          <option value="">Selecione um aluno...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

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
          placeholder="Ex: Pagamento referente a material didático ou desconto concedido."
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Lançar Cobrança'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
