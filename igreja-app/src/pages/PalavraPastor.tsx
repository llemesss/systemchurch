import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Download, Calendar, Clock } from 'lucide-react';
import Header from '../components/Header';

interface Devocional {
  id: string;
  titulo: string;
  data: string;
  duracao: string;
  descricao: string;
  tipo: 'audio' | 'video' | 'texto';
  thumbnail?: string;
}

const PalavraPastor: React.FC = () => {
  const devocionais: Devocional[] = [
    {
      id: '1',
      titulo: 'A Força da Oração',
      data: '2024-01-15',
      duracao: '15 min',
      descricao: 'Uma reflexão sobre o poder transformador da oração em nossas vidas.',
      tipo: 'audio'
    },
    {
      id: '2',
      titulo: 'Caminhando na Fé',
      data: '2024-01-08',
      duracao: '12 min',
      descricao: 'Como manter a fé firme mesmo nos momentos de dificuldade.',
      tipo: 'video'
    },
    {
      id: '3',
      titulo: 'O Amor de Deus',
      data: '2024-01-01',
      duracao: '8 min',
      descricao: 'Compreendendo a profundidade do amor incondicional de Deus.',
      tipo: 'texto'
    }
  ];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'audio':
        return <Play size={20} />;
      case 'video':
        return <Play size={20} />;
      case 'texto':
        return <Download size={20} />;
      default:
        return <Play size={20} />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'audio':
        return 'from-green-400 to-green-600';
      case 'video':
        return 'from-red-400 to-red-600';
      case 'texto':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <Header />

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar ao Menu
          </Link>

          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Play size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Palavra do Pastor
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Mensagens, devocionais e reflexões para fortalecer sua caminhada espiritual
            </p>
          </div>

          {/* Featured Message */}
          <div className="glass-card p-8 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Play size={48} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">Mensagem da Semana</h2>
                <h3 className="text-xl text-gray-300 mb-3">"Renovando a Esperança"</h3>
                <p className="text-gray-400 mb-4">
                  Uma palavra especial sobre como encontrar esperança renovada em meio aos desafios da vida.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button className="btn btn-primary px-6 py-3">
                    <Play size={20} />
                    Assistir Agora
                  </button>
                  <button className="btn btn-secondary px-6 py-3">
                    <Download size={20} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Devocionais List */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Devocionais Recentes</h2>
            <div className="grid gap-6">
              {devocionais.map((devocional) => (
                <div key={devocional.id} className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getTipoColor(devocional.tipo)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {getTipoIcon(devocional.tipo)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{devocional.titulo}</h3>
                      <p className="text-gray-300 mb-3">{devocional.descricao}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(devocional.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {devocional.duracao}
                        </div>
                        <div className="px-2 py-1 bg-white/10 rounded-full text-xs uppercase">
                          {devocional.tipo}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="btn btn-primary px-4 py-2 text-sm">
                          {getTipoIcon(devocional.tipo)}
                          {devocional.tipo === 'texto' ? 'Ler' : 'Reproduzir'}
                        </button>
                        <button className="btn btn-secondary px-4 py-2 text-sm">
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Receba as Mensagens</h3>
              <p className="text-gray-300 mb-6">
                Inscreva-se para receber as mensagens do pastor diretamente no seu e-mail.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="btn btn-primary px-6 py-3 whitespace-nowrap">
                  Inscrever-se
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PalavraPastor;