import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || '/dashboard';

  // Função para validar email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validações frontend
    if (!formData.email.trim()) {
      setError('Por favor, digite seu e-mail.');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }
    
    if (!formData.password) {
      setError('Por favor, digite sua senha.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(formData.email, formData.password, formData.rememberMe);
      
      if (success) {
        // O redirecionamento será tratado pelo useEffect no App.tsx
        // mas também fazemos um redirecionamento explícito aqui como fallback
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        setError('E-mail ou senha incorretos. Tente novamente.');
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(to bottom right, #f8fafc, #e7eaf0)'
    }}>

      {/* Header Minimalista */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="font-bold text-xl" style={{color: '#1a202c'}}>IDPB</span>
          </div>
          <Link 
            to="/" 
            className="hover:opacity-80 transition-colors font-medium"
            style={{color: '#1a202c'}}
          >
            Início
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full" style={{maxWidth: '400px'}}>
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 mb-8 transition-colors font-medium hover:opacity-80"
            style={{color: '#1a202c'}}
          >
            <ArrowLeft size={20} />
            Voltar ao início
          </Link>

          {/* Login Card com Glassmorphism Exato */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            padding: '40px'
          }}>
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2L20 10H12L16 2Z" fill="white"/>
                  <rect x="10" y="10" width="12" height="14" fill="white"/>
                  <path d="M16 24L18 28H14L16 24Z" fill="white"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-3 font-['Montserrat']" style={{color: '#1a202c'}}>Área de Membros</h1>
              <p className="text-lg" style={{color: '#1a202c', opacity: 0.8}}>Entre com suas credenciais</p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-3" style={{color: '#dc2626'}} />
                  <p className="font-medium" style={{color: '#dc2626'}}>{error}</p>
                </div>
              </div>
            )}
              
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{color: '#1a202c'}}>
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Mail size={20} style={{color: '#9ca3af'}} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      paddingLeft: '48px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1a202c',
                      fontSize: '16px'
                    }}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{color: '#1a202c'}}>
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Lock size={20} style={{color: '#9ca3af'}} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      paddingLeft: '48px',
                      paddingRight: '48px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1a202c',
                      fontSize: '16px'
                    }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors hover:opacity-80"
                    style={{color: '#9ca3af'}}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="font-medium" style={{color: '#1a202c'}}>Lembrar-me</span>
                </label>
                <a href="#" className="font-medium transition-colors hover:opacity-80" style={{color: '#00d4aa'}}>
                  Esqueci minha senha
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #00d4aa, #00a693)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || isLoading ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  marginTop: '8px'
                }}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="small" message="" fullScreen={false} />
                ) : (
                  'Entrar'
                )}
              </button>
              </form>

            {/* Divider */}
            <div className="flex items-center" style={{margin: '24px 0'}}>
              <div className="flex-1" style={{borderTop: '1px solid #d1d5db'}}></div>
              <span className="px-4 font-medium" style={{color: '#6b7280'}}>ou</span>
              <div className="flex-1" style={{borderTop: '1px solid #d1d5db'}}></div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p style={{color: '#1a202c', opacity: 0.8}}>
                Não tem uma conta?{' '}
                <Link to="/register" className="font-semibold transition-colors hover:opacity-80" style={{color: '#00d4aa'}}>
                  Cadastre-se aqui
                </Link>
              </p>
            </div>

            {/* Guest Access */}
            <div className="text-center" style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #d1d5db'}}>
              <Link 
                to="/dashboard" 
                className="font-medium transition-colors hover:opacity-80"
                style={{color: '#6b7280'}}
              >
                Continuar como visitante
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;