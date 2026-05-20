import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudentsList } from './components/students/StudentsList';
import { StudentDetail } from './components/students/StudentDetail';
import { SchedulePage } from './components/schedule/SchedulePage';
import { OverviewPage } from './components/overview/OverviewPage';
import { ParentsPage } from './components/parents/ParentsPage';
import './styles/globals.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:'var(--text-3)' }}>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/alunos" element={<ProtectedRoute><StudentsList /></ProtectedRoute>} />
      <Route path="/alunos/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
      <Route path="/agenda" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
      <Route path="/visao-geral" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
      <Route path="/pais" element={<ProtectedRoute><ParentsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
