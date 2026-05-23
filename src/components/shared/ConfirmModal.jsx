'use client';

import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-2 leading-relaxed select-none">
          {message}
        </p>
        <div className="flex justify-end gap-2.5 pt-3.5 border-t border-border mt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
