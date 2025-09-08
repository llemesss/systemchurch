import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CelulaProvider } from './contexts/CelulaContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/globals.css';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PalavraPastor = lazy(() => import('./pages/PalavraPastor'));
const AtendimentoPastoral = lazy(() => import('./pages/AtendimentoPastoral'));
const CultosEventos = lazy(() => import('./pages/CultosEventos'));
const PedidosOracao = lazy(() => import('./pages/PedidosOracao'));
const Ofertar = lazy(() => import('./pages/Ofertar'));
const OracaoDiaria = lazy(() => import('./pages/OracaoDiaria'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const LeaderDashboard = lazy(() => import('./pages/LeaderDashboard'));
const PastorPanel = lazy(() => import('./pages/PastorPanel'));
const ConditionalDashboard = lazy(() => import('./pages/ConditionalDashboard'));
const CellDetails = lazy(() => import('./pages/CellDetails'));
const MeuPerfil = lazy(() => import('./pages/MeuPerfil'));

// Componente interno que tem acesso ao contexto de autenticação
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lógica de redirecionamento pós-login
  useEffect(() => {
    // Apenas redireciona se o carregamento inicial da autenticação já terminou
    if (!isLoading && isAuthenticated) {
      // Se o usuário está logado e está na página de login ou landing, redirecione para a dashboard
      if (location.pathname === '/login' || location.pathname === '/') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  return (
    <div className="App">
      <Suspense fallback={<LoadingSpinner message="Carregando página..." />}>
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
        </Suspense>
        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <UserManagementProvider>
          <DashboardProvider>
            <CelulaProvider>
              <Router>
                <AppRoutes />
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
              </Router>
            </CelulaProvider>
          </DashboardProvider>
        </UserManagementProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
