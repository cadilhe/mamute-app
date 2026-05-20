'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DisciplineProvider } from '@/hooks/useDisciplines';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-text-3 font-medium bg-bg">
        <div className="animate-pulse text-base">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Aguarda o redirecionamento
  }

  return (
    <DisciplineProvider>
      <div className="flex bg-bg min-h-screen w-full">
        <Sidebar />
        <main className="ml-[var(--sidebar-w)] flex-1 min-h-screen p-8 w-full max-w-7xl">
          {children}
        </main>
      </div>
    </DisciplineProvider>
  );
}
