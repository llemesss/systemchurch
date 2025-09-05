import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useRedirectListener } from '../hooks/useRedirectListener';
import { 
  Mic, 
  Users, 
  Calendar, 
  Heart, 
  DollarSign, 
  Briefcase,
  Baby,
  Radio, 
  Newspaper, 
  Play,
  Store,
  HandHeart,
  Shield,
  Crown,
  UserCheck,
  Building
} from 'lucide-react';

interface MenuCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Escutar comandos de redirecionamento via WebSocket
  useRedirectListener();
  const { 
    canAccessAdminPanel, 
    canAccessLeaderDashboard,
    canAccessPastorPanel,
    isPastor,
    isCoordinator,
    isSupervisor,
    isLeaderOrAbove
  } = usePermissions();


  const baseMenuItems: MenuCard[] = [
    {
      id: 'palavra-pastor',
      title: 'PALAVRA DO',
      subtitle: 'PASTOR',
      icon: <Mic size={32} />,
      path: '/palavra-pastor',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'atendimento-pastoral',
      title: 'ATENDIMENTO',
      subtitle: 'PASTORAL',
      icon: <Users size={32} />,
      path: '/atendimento-pastoral',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'cultos-eventos',
      title: 'CULTOS E',
      subtitle: 'EVENTOS',
      icon: <Calendar size={32} />,
      path: '/cultos-eventos',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'pedidos-oracao',
      title: 'PEDIDOS DE',
      subtitle: 'ORAÇÃO',
      icon: <Heart size={32} />,
      path: '/pedidos-oracao',
      color: 'from-red-400 to-red-600'
    },
    {
      id: 'ofertar',
      title: 'OFERTAR',
      subtitle: '',
      icon: <DollarSign size={32} />,
      path: '/ofertar',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'guia-servicos',
      title: 'GUIA DE',
      subtitle: 'SERVIÇOS',
      icon: <Store size={32} />,
      path: '/guia-servicos',
      color: 'from-teal-400 to-teal-600'
    },
    {
      id: 'guia-empregos',
      title: 'GUIA DE',
      subtitle: 'EMPREGOS',
      icon: <Briefcase size={32} />,
      path: '/guia-empregos',
      color: 'from-indigo-400 to-indigo-600'
    },
    {
      id: 'salinha-kids',
      title: 'SALINHA',
      subtitle: 'KIDS',
      icon: <Baby size={32} />,
      path: '/salinha-kids',
      color: 'from-pink-400 to-pink-600'
    },
    {
      id: 'ao-vivo',
      title: 'AO VIVO',
      subtitle: '',
      icon: <Radio size={32} />,
      path: '/ao-vivo',
      color: 'from-red-500 to-red-700'
    },
    {
      id: 'noticias',
      title: 'NOTÍCIAS',
      subtitle: '',
      icon: <Newspaper size={32} />,
      path: '/noticias',
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 'videos',
      title: 'VÍDEOS',
      subtitle: '',
      icon: <Play size={32} />,
      path: '/videos',
      color: 'from-cyan-400 to-cyan-600'
    },
    {
      id: 'oracao-diaria',
      title: 'ORAÇÃO',
      subtitle: 'DIÁRIA',
      icon: <HandHeart size={32} />,
      path: '/oracao-diaria',
      color: 'from-violet-400 to-violet-600'
    }
  ];

  // Adicionar painéis específicos baseados nas permissões do usuário
  const getMenuItems = () => {
    // Para membros, mostrar apenas Oração Diária
    if (user?.role === 'Membro') {
      return [{
        id: 'oracao-diaria',
        title: 'ORAÇÃO',
        subtitle: 'DIÁRIA',
        icon: <HandHeart size={32} />,
        path: '/oracao-diaria',
        color: 'from-violet-400 to-violet-600'
      }];
    }
    
    const items = [...baseMenuItems];
    
    // Painel do Pastor (acesso total)
    if (canAccessPastorPanel()) {
      items.unshift({
        id: 'pastor-panel',
        title: 'PAINEL',
        subtitle: 'DO PASTOR',
        icon: <Crown size={32} />,
        path: '/pastor-panel',
        color: 'from-purple-500 to-purple-700'
      });
    }
    
    // Dashboard Condicional (baseado no role)
    if (isLeaderOrAbove()) {
      let dashboardTitle = 'DASHBOARD';
      let dashboardSubtitle = '';
      let dashboardIcon = <Users size={32} />;
      let dashboardColor = 'from-emerald-400 to-emerald-600';
      
      if (isPastor()) {
        dashboardTitle = 'DASHBOARD';
        dashboardSubtitle = 'GERAL';
        dashboardIcon = <Crown size={32} />;
        dashboardColor = 'from-purple-400 to-purple-600';
      } else if (isCoordinator()) {
        dashboardTitle = 'DASHBOARD';
        dashboardSubtitle = 'COORDENADOR';
        dashboardIcon = <UserCheck size={32} />;
        dashboardColor = 'from-blue-400 to-blue-600';
      } else if (isSupervisor()) {
        dashboardTitle = 'DASHBOARD';
        dashboardSubtitle = 'SUPERVISOR';
        dashboardIcon = <Building size={32} />;
        dashboardColor = 'from-green-400 to-green-600';
      } else {
        dashboardTitle = 'DASHBOARD';
        dashboardSubtitle = 'DO LÍDER';
        dashboardIcon = <Users size={32} />;
        dashboardColor = 'from-emerald-400 to-emerald-600';
      }
      
      items.unshift({
        id: 'conditional-dashboard',
        title: dashboardTitle,
        subtitle: dashboardSubtitle,
        icon: dashboardIcon,
        path: '/conditional-dashboard',
        color: dashboardColor
      });
    }
    
    // Manter painel administrativo antigo para compatibilidade
    if (canAccessAdminPanel()) {
      items.unshift({
        id: 'admin-panel',
        title: 'PAINEL',
        subtitle: 'ADMINISTRATIVO',
        icon: <Shield size={32} />,
        path: '/admin',
        color: 'from-orange-400 to-orange-600'
      });
    }
    
    // Manter dashboard do líder antigo para compatibilidade
    if (canAccessLeaderDashboard() && !isLeaderOrAbove()) {
      items.unshift({
        id: 'leader-dashboard',
        title: 'DASHBOARD',
        subtitle: 'DO LÍDER',
        icon: <Users size={32} />,
        path: '/leader',
        color: 'from-emerald-400 to-emerald-600'
      });
    }
    
    return items;
  };
  
  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">IDPB</h1>
                {user && (
                  <p className="text-white/70 text-sm">Bem-vindo, {user.name}!</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pb-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Bem-vindo à IDPB
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Escolha uma das opções abaixo para navegar pelo nosso aplicativo
            </p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="glass-card p-6 md:p-8 text-center group hover:scale-105 transition-all duration-300 min-h-[140px] md:min-h-[160px] flex flex-col items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                {/* Icon Container */}
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>

                {/* Text */}
                <div className="text-white">
                  <h3 className="font-bold text-sm md:text-base leading-tight">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="font-bold text-sm md:text-base leading-tight">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Acesso Rápido</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/ao-vivo" 
                className="btn btn-primary px-6 py-3 group"
              >
                <Radio size={20} />
                Assistir Culto ao Vivo
              </Link>
              <Link 
                to="/ofertar" 
                className="btn btn-secondary px-6 py-3 group"
              >
                <Heart size={20} />
                Fazer uma Oferta
              </Link>
              <Link 
                to="/pedidos-oracao" 
                className="btn btn-secondary px-6 py-3 group"
              >
                <Heart size={20} />
                Pedir Oração
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;