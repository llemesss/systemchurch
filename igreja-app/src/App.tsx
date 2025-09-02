import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CelulaProvider } from './contexts/CelulaContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import PalavraPastor from './pages/PalavraPastor';
import AtendimentoPastoral from './pages/AtendimentoPastoral';
import CultosEventos from './pages/CultosEventos';
import PedidosOracao from './pages/PedidosOracao';
import Ofertar from './pages/Ofertar';
import OracaoDiaria from './pages/OracaoDiaria';
import AdminPanel from './pages/AdminPanel';
import LeaderDashboard from './pages/LeaderDashboard';
import RegisterPage from './pages/RegisterPage';
import PastorPanel from './pages/PastorPanel';
import ConditionalDashboard from './pages/ConditionalDashboard';
import CellDetails from './pages/CellDetails';
import MeuPerfil from './pages/MeuPerfil';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <UserManagementProvider>
          <DashboardProvider>
            <CelulaProvider>
            <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <RegisterPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes with AppLayout - require authentication */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="palavra-pastor" element={<PalavraPastor />} />
              <Route path="atendimento-pastoral" element={<AtendimentoPastoral />} />
              <Route path="cultos-eventos" element={<CultosEventos />} />
              <Route path="pedidos-oracao" element={<PedidosOracao />} />
              <Route path="ofertar" element={<Ofertar />} />
              <Route path="oracao-diaria" element={<OracaoDiaria />} />
              <Route path="meu-perfil" element={<MeuPerfil />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="leader" element={<LeaderDashboard />} />
              <Route 
                path="pastor-panel" 
                element={
                  <ProtectedRoute allowedRoles={['Pastor', 'Admin']}>
                    <PastorPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="pastor/celulas/:cellId" 
                element={
                  <ProtectedRoute allowedRoles={['Pastor', 'Admin']}>
                    <CellDetails />
                  </ProtectedRoute>
                } 
              />
              <Route path="conditional-dashboard" element={<ConditionalDashboard />} />
              
              {/* Placeholder routes - redirect to dashboard for now */}
              <Route path="guia-servicos" element={<Navigate to="/dashboard" replace />} />
              <Route path="guia-empregos" element={<Navigate to="/dashboard" replace />} />
              <Route path="salinha-kids" element={<Navigate to="/dashboard" replace />} />
              <Route path="ache-igreja" element={<Navigate to="/dashboard" replace />} />
              <Route path="ao-vivo" element={<Navigate to="/dashboard" replace />} />
              <Route path="noticias" element={<Navigate to="/dashboard" replace />} />
              <Route path="videos" element={<Navigate to="/dashboard" replace />} />
            </Route>

            
            {/* Default route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
            </Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            </CelulaProvider>
          </DashboardProvider>
        </UserManagementProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
