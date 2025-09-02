import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Music, Heart, Star, Filter } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  type: 'culto' | 'evento' | 'conferencia' | 'retiro';
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  featured: boolean;
}

const CultosEventos: React.FC = () => {
  const [filter, setFilter] = useState<string>('todos');
  
  const events: Event[] = [
    {
      id: 1,
      title: 'Culto de Domingo',
      type: 'culto',
      date: '2024-01-21',
      time: '09:00',
      location: 'Templo Principal',
      description: 'Culto dominical com pregação da Palavra e adoração.',
      image: '/api/placeholder/300/200',
      featured: true
    },
    {
      id: 2,
      title: 'Culto de Domingo - Noite',
      type: 'culto',
      date: '2024-01-21',
      time: '19:00',
      location: 'Templo Principal',
      description: 'Culto noturno com foco na juventude e adoração contemporânea.',
      image: '/api/placeholder/300/200',
      featured: true
    },
    {
      id: 3,
      title: 'Conferência de Avivamento',
      type: 'conferencia',
      date: '2024-01-25',
      time: '19:30',
      location: 'Auditório Central',
      description: 'Três noites de ministração com pregadores convidados.',
      image: '/api/placeholder/300/200',
      featured: true
    },
    {
      id: 4,
      title: 'Culto de Oração',
      type: 'culto',
      date: '2024-01-24',
      time: '19:30',
      location: 'Sala de Oração',
      description: 'Momento especial de oração e intercessão.',
      image: '/api/placeholder/300/200',
      featured: false
    },
    {
      id: 5,
      title: 'Retiro de Casais',
      type: 'retiro',
      date: '2024-02-10',
      time: '08:00',
      location: 'Chácara Bethel',
      description: 'Fim de semana especial para fortalecimento matrimonial.',
      image: '/api/placeholder/300/200',
      featured: false
    },
    {
      id: 6,
      title: 'Noite de Adoração',
      type: 'evento',
      date: '2024-01-27',
      time: '20:00',
      location: 'Templo Principal',
      description: 'Noite especial de louvor e adoração com bandas convidadas.',
      image: '/api/placeholder/300/200',
      featured: false
    }
  ];

  const filteredEvents = filter === 'todos' 
    ? events 
    : events.filter(event => event.type === filter);

  const featuredEvents = events.filter(event => event.featured);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'culto': return 'bg-blue-500';
      case 'evento': return 'bg-green-500';
      case 'conferencia': return 'bg-purple-500';
      case 'retiro': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'culto': return 'Culto';
      case 'evento': return 'Evento';
      case 'conferencia': return 'Conferência';
      case 'retiro': return 'Retiro';
      default: return 'Outro';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="min-h-screen text-white p-4"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/dashboard" className="flex items-center text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6 mr-2" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Cultos e Eventos</h1>
        <div className="w-20"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Eventos em Destaque */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Star className="w-6 h-6 mr-3 text-yellow-400" />
            <h2 className="text-xl font-semibold">Eventos em Destaque</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <div key={event.id} className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <div className="flex items-center text-sm text-white/80 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-white/80">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.time}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-sm text-white/70 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <p className="text-white/80 text-sm">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 mr-3" />
            <h3 className="font-semibold">Filtrar Eventos</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'todos', label: 'Todos' },
              { value: 'culto', label: 'Cultos' },
              { value: 'evento', label: 'Eventos' },
              { value: 'conferencia', label: 'Conferências' },
              { value: 'retiro', label: 'Retiros' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-6">Próximos Eventos</h2>
          
          {filteredEvents.map(event => (
            <div key={event.id} className="glass-card p-6 hover:bg-white/10 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white mr-3 ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                    {event.featured && (
                      <Star className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                  <p className="text-white/80 mb-3">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-white/70">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                    Mais Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informações dos Cultos Regulares */}
        <div className="glass-card p-8 mt-8">
          <div className="flex items-center mb-6">
            <Music className="w-6 h-6 mr-3 text-purple-400" />
            <h2 className="text-xl font-semibold">Cultos Regulares</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-lg">Programação Semanal</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span>Domingo - Manhã</span>
                  <span className="text-white/70">09:00h</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span>Domingo - Noite</span>
                  <span className="text-white/70">19:00h</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span>Quarta - Oração</span>
                  <span className="text-white/70">19:30h</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span>Sexta - Juventude</span>
                  <span className="text-white/70">19:30h</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Informações Importantes</h3>
              <div className="space-y-3 text-white/80">
                <p>• Chegue com 15 minutos de antecedência</p>
                <p>• Estacionamento gratuito disponível</p>
                <p>• Ministério infantil durante os cultos</p>
                <p>• Transmissão ao vivo disponível</p>
                <p>• Tradução em libras nos cultos dominicais</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CultosEventos;