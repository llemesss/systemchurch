import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCelula } from '../contexts/CelulaContext';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cell_id: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isLoading } = useAuth();
  const { getPublicCells } = useCelula();
  const navigate = useNavigate();
  
  const availableCells = getPublicCells();

  // Função para validar email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validações
    if (!formData.name.trim()) {
      setError('Por favor, digite seu nome completo.');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Por favor, digite seu e-mail.');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }
    
    if (!formData.password) {
      setError('Por favor, digite uma senha.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    if (!formData.confirmPassword) {
      setError('Por favor, confirme sua senha.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('Por favor, digite seu telefone.');
      return;
    }
    
    if (!formData.cell_id) {
      setError('Por favor, selecione uma célula.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        cell_id: formData.cell_id
      });
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        <div className="w-full" style={{maxWidth: '500px'}}>
          {/* Back Button */}
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 mb-8 transition-colors font-medium hover:opacity-80"
            style={{color: '#1a202c'}}
          >
            <ArrowLeft size={20} />
            Voltar ao login
          </Link>

          {/* Register Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            padding: '40px'
          }}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User size={40} color="white" />
              </div>
              <h1 className="text-3xl font-bold mb-3 font-['Montserrat']" style={{color: '#1a202c'}}>Criar Conta</h1>
              <p className="text-lg" style={{color: '#1a202c', opacity: 0.8}}>Junte-se à nossa comunidade</p>
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
                  <span style={{color: '#dc2626', fontWeight: '500'}}>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nome Completo */}
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>Nome Completo</label>
                <div style={{position: 'relative'}}>
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{color: '#9ca3af'}} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite seu nome completo"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 50px',
                      border: '2px solid rgba(209, 213, 219, 0.3)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>E-mail</label>
                <div style={{position: 'relative'}}>
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{color: '#9ca3af'}} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite seu e-mail"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 50px',
                      border: '2px solid rgba(209, 213, 219, 0.3)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Telefone */}
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>Telefone/WhatsApp</label>
                <div style={{position: 'relative'}}>
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{color: '#9ca3af'}} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="(11) 99999-9999"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 50px',
                      border: '2px solid rgba(209, 213, 219, 0.3)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Escolha sua Célula */}
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>Escolha sua Célula *</label>
                <div style={{position: 'relative'}}>
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{color: '#9ca3af'}} />
                  <select
                    name="cell_id"
                    value={formData.cell_id}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 50px',
                      border: '2px solid rgba(209, 213, 219, 0.3)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease',
                      appearance: 'none'
                    }}
                  >
                    <option value="">Selecione uma célula *</option>
                    {availableCells.map((cell) => (
                      <option key={cell.id} value={cell.id}>
                        Célula {cell.cell_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>



              {/* Senha */}
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>Senha</label>
                <div style={{position: 'relative'}}>
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{color: '#9ca3af'}} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite sua senha"
                    style={{
                      width: '100%',
                      padding: '16px 50px 16px 50px',
                      border: '2px solid rgba(209, 213, 219, 0.3)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div style={{marginBottom: '24px'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>Confirmar Senha</label>
                <div style={{position: 'relative'}}>
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{color: '#9ca3af'}} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Confirme sua senha"
                    style={{
                      width: '100%',
                      padding: '16px 50px 16px 50px',
                      border: '2px solid rgba(209, 213, 219, 0.3)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                  'Criar Conta'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center" style={{margin: '24px 0'}}>
              <div className="flex-1" style={{borderTop: '1px solid #d1d5db'}}></div>
              <span className="px-4 font-medium" style={{color: '#6b7280'}}>ou</span>
              <div className="flex-1" style={{borderTop: '1px solid #d1d5db'}}></div>
            </div>

            {/* Social Login Buttons */}
            <div style={{marginBottom: '24px'}}>
              {/* Google Button */}
              <button
                type="button"
                disabled
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid rgba(209, 213, 219, 0.3)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: '#374151',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              {/* Apple Button */}
              <button
                type="button"
                disabled
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid rgba(209, 213, 219, 0.3)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: '#374151',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continuar com Apple
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center" style={{marginTop: '24px'}}>
              <p style={{color: '#1a202c', opacity: 0.8}}>
                Já tem uma conta?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold transition-colors hover:opacity-80" 
                  style={{color: '#00d4aa'}}
                >
                  Faça login aqui
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;