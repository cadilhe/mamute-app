'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
};

const STYLES = {
  success: 'border-success/30 bg-success-bg/60 text-success',
  error: 'border-danger/30 bg-danger-bg/60 text-danger',
  warning: 'border-warning/30 bg-warning-bg/60 text-warning',
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((type, message, duration = 5000) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => add('success', msg),
    error: (msg) => add('error', msg, 7000),
    warning: (msg) => add('warning', msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map(t => (
              <div
                key={t.id}
                className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-medium animate-slide-up ${STYLES[t.type]}`}
                style={{ animation: 'toast-in 0.3s ease-out' }}
              >
                <span className="text-sm font-bold shrink-0">{ICONS[t.type]}</span>
                <span className="flex-1">{t.message}</span>
                <button
                  onClick={() => remove(t.id)}
                  className="bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100 text-current text-sm leading-none shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
