'use client';

import { useEffect } from 'react';

export function Modal({ open, onClose, title, children, width = 560 }) {
  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-surface rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border flex flex-col"
        style={{ maxWidth: width }}
      >
        {title && (
          <div className="px-6 py-4 border-b border-border flex items-center justify-between select-none shrink-0">
            <h3 className="font-bold text-base text-text">{title}</h3>
            <button
              onClick={onClose}
              className="bg-transparent border-none cursor-pointer text-2xl text-text-3 hover:text-text leading-none transition-colors"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
