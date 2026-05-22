'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/shared/Toast';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
