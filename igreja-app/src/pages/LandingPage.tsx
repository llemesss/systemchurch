import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/globals.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };



  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };



  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom right, #f8fafc, #e7eaf0)'
    }}>
      {/* Navbar */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src="/logo.png" alt="IDPB" />
          </div>
          
          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
            <a href="#quem-somos" onClick={() => scrollToSection('quem-somos')}>QUEM SOMOS</a>
            <a href="#agenda" onClick={() => scrollToSection('agenda')}>AGENDA</a>
            <a href="#pequenos-grupos" onClick={() => scrollToSection('pequenos-grupos')}>CÉLULAS</a>
            <a href="#contato" onClick={() => scrollToSection('contato')}>CONTATO</a>
          </div>
          
          <div className="navbar-actions">
            <div className="social-icons">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            <button 
              className="navbar-cta"
              onClick={handleLogin}
            >
              Área de Membros
            </button>
          </div>
          
          <button 
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <div className="main-content">

        {/* Seção Hero */}
        <section id="inicio" className="hero-container">
          <div className="hero-background"></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">BEM-VINDO AO NOVO!</h1>
            <p className="hero-subtitle">Uma igreja para toda família</p>
            <div className="hero-buttons">
              <button 
                className="btn-primary"
                onClick={() => window.open('https://youtube.com/live', '_blank')}
              >
                ASSISTA AO VIVO
              </button>
              <button 
                className="btn-secondary"
                onClick={() => scrollToSection('agenda')}
              >
                VEJA A AGENDA
              </button>
            </div>
          </div>
        </section>

        {/* Seção Nossos Cultos */}
        <section id="agenda" className="cultos-section">
          <div className="container">
            <h2 className="section-title">NOSSOS CULTOS</h2>
            <div className="cultos-grid">
              <div className="culto-card">
                <div className="culto-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                  🙏
                </div>
                <div className="culto-time">Domingo 10h00</div>
                <h3 className="culto-title">Culto de Celebração</h3>
                <p className="culto-description">Nosso principal momento de adoração e ensino da Palavra de Deus.</p>
                <a href="#" className="culto-button">Saiba Mais</a>
              </div>
              
              <div className="culto-card">
                <div className="culto-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                  👥
                </div>
                <div className="culto-time">Quarta 19h30</div>
                <h3 className="culto-title">Culto de Oração</h3>
                <p className="culto-description">Momento especial de intercessão e busca pela presença de Deus.</p>
                <a href="#" className="culto-button">Saiba Mais</a>
              </div>
              
              <div className="culto-card">
                <div className="culto-icon" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
                  🎵
                </div>
                <div className="culto-time">Sexta 19h30</div>
                <h3 className="culto-title">Culto de Jovens</h3>
                <p className="culto-description">Encontro especial para jovens com louvor e mensagem direcionada.</p>
                <a href="#" className="culto-button">Saiba Mais</a>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Sobre Nós */}
        <section id="quem-somos" className="about-section">
          <div className="about-content">
            <h2 className="about-title">UMA IGREJA PARA PERTENCER</h2>
            <p className="about-text">
              Somos uma igreja que acredita em um evangelho que se aproxima, 
              pensamos em um evangelho que não desiste das pessoas. Somos um lugar 
              de encorajadores. Deus nos disse segurar as mãos uns dos outros e 
              falar "bora", vamos chegar até o final juntos, ninguém irá ficar pra trás.
            </p>
            <a href="#" className="about-button">NOSSA HISTÓRIA</a>
          </div>
        </section>

        {/* Seção Pequenos Grupos */}
        <section id="pequenos-grupos" className="grupos-section">
          <div className="grupos-content">
            <div className="grupos-image">
              <img 
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Pequenos Grupos" 
              />
            </div>
            <div className="grupos-text">
              <h2 className="grupos-title">CONECTE-SE EM UM PEQUENO GRUPO</h2>
              <p className="grupos-description">
                Os pequenos grupos são o coração da nossa igreja. É onde acontecem 
                os relacionamentos mais profundos, onde crescemos juntos na fé e 
                onde experimentamos o verdadeiro sentido de comunidade cristã.
              </p>
              <p className="grupos-description">
                Encontre pessoas que caminharão ao seu lado, compartilhando alegrias, 
                desafios e descobrindo juntos o que significa viver como Jesus viveu.
              </p>
              <a href="#" className="grupos-button">ENCONTRE UM GRUPO</a>
            </div>
          </div>
        </section>

        {/* Seção Contato */}
        <section id="contato" className="section-padding">
          <div className="container mx-auto px-6">
            <h2 className="section-title">Entre em Contato</h2>
            <div className="glass-card p-8 max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-6">Venha nos visitar!</h3>
              <div className="space-y-4 text-lg">
                <p><strong>Endereço:</strong> Rua da Igreja, 123 - Centro</p>
                <p><strong>Telefone:</strong> (11) 1234-5678</p>
                <p><strong>Email:</strong> contato@idpb.com.br</p>
                <p><strong>Horários de Culto:</strong></p>
                <p>Domingos: 10h00 e 18h00</p>
                <p>Quintas: 20h00</p>
              </div>
              <div className="mt-8">
                <button 
                  onClick={handleLogin}
                  className="btn btn-primary"
                >
                  Fale Conosco
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo-section">
            <div className="footer-logo">IDPB</div>
            <p className="footer-description">
              Somos uma igreja que acredita em um evangelho que se aproxima, 
              pensamos em um evangelho que não desiste das pessoas. 
              Venha fazer parte da nossa família!
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Mapa do Site</h3>
            <ul>
              <li><a href="#inicio" onClick={() => scrollToSection('inicio')}>Início</a></li>
              <li><a href="#quem-somos" onClick={() => scrollToSection('quem-somos')}>Quem Somos</a></li>
              <li><a href="#agenda" onClick={() => scrollToSection('agenda')}>Agenda</a></li>
              <li><a href="#pequenos-grupos" onClick={() => scrollToSection('pequenos-grupos')}>Pequenos Grupos</a></li>
              <li><a href="#contato" onClick={() => scrollToSection('contato')}>Contato</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contato</h3>
            <div className="footer-contact">
              <p>📍 Rua das Flores, 123 - Centro</p>
              <p>📞 (11) 1234-5678</p>
              <p>✉️ contato@idpb.org.br</p>
              <p>🕐 Dom: 10h | Qua: 19h30 | Sex: 19h30</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Redes Sociais</h3>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">📘</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">📺</a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Igreja Presbiteriana do Brasil. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;