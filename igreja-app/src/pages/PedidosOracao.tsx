import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Send, Users, Clock, Lock, Globe, Plus, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall, ENDPOINTS } from '../utils/api';
import toast from 'react-hot-toast';

interface PrayerRequest {
  id: number;
  title: string;
  description: string;
  author_name: string;
  created_at: string;
  category: 'saude' | 'familia' | 'trabalho' | 'espiritual' | 'financeiro' | 'outros';
  is_anonymous: boolean;
  is_public: boolean;
  prayer_count: number;
  urgency: 'baixa' | 'normal' | 'alta' | 'urgente';
  status: 'ativo' | 'respondido' | 'cancelado';
  user_id?: number;
}

const PedidosOracao: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'enviar' | 'publicos' | 'meus'>('enviar');
  const [publicRequests, setPublicRequests] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'espiritual',
    name: '',
    email: '',
    is_anonymous: false,
    is_public: false,
    urgency: 'normal'
  });

  // Função para buscar pedidos públicos
  const fetchPublicRequests = async () => {
    try {
      setLoading(true);
      const data = await apiCall(ENDPOINTS.prayerRequests.public);
      setPublicRequests(data);
    } catch (error) {
      console.error('Erro ao buscar pedidos públicos:', error);
      toast.error('Erro ao carregar pedidos públicos');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar meus pedidos
  const fetchMyRequests = async () => {
    try {
      const data = await apiCall(ENDPOINTS.prayerRequests.myRequests);
      setMyRequests(data);
    } catch (error) {
      console.error('Erro ao buscar meus pedidos:', error);
      toast.error('Erro ao carregar meus pedidos');
    }
  };

  // Função para criar/atualizar pedido
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
      
      const url = editingRequest 
        ? `http://localhost:3001/api/prayer-requests/${editingRequest.id}`
        : 'http://localhost:3001/api/prayer-requests';
      
      const method = editingRequest ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success(editingRequest ? 'Pedido atualizado com sucesso!' : 'Pedido enviado com sucesso!');
        setFormData({
          title: '',
          description: '',
          category: 'espiritual',
          name: '',
          email: '',
          is_anonymous: false,
          is_public: false,
          urgency: 'normal'
        });
        setEditingRequest(null);
        fetchMyRequests();
        if (formData.is_public) {
          fetchPublicRequests();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao processar pedido');
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error('Erro ao enviar pedido');
    } finally {
      setLoading(false);
    }
  };

  // Função para orar por um pedido
  const handlePray = async (requestId: number) => {
    try {
      await apiCall(ENDPOINTS.prayerRequests.pray(requestId), {
        method: 'POST'
      });
      
      toast.success('Oração registrada! Obrigado por orar.');
      fetchPublicRequests();
    } catch (error) {
      console.error('Erro ao orar:', error);
      toast.error('Erro ao registrar oração');
    }
  };

  // Função para deletar pedido
  const handleDelete = async (requestId: number) => {
    if (!confirm('Tem certeza que deseja deletar este pedido?')) return;
    
    try {
      await apiCall(ENDPOINTS.prayerRequests.delete(requestId), {
        method: 'DELETE'
      });
      
      toast.success('Pedido deletado com sucesso');
       fetchMyRequests();
       fetchPublicRequests();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar pedido');
    }
  };

  // Função para editar pedido
  const handleEdit = (request: PrayerRequest) => {
    setEditingRequest(request);
    setFormData({
      title: request.title,
      description: request.description,
      category: request.category,
      name: request.author_name || '',
      email: '',
      is_anonymous: request.is_anonymous,
      is_public: request.is_public,
      urgency: request.urgency
    });
    setActiveTab('enviar');
  };

  useEffect(() => {
    fetchPublicRequests();
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'espiritual': return 'Espiritual';
      case 'saude': return 'Saúde';
      case 'familia': return 'Família';
      case 'trabalho': return 'Trabalho';
      case 'financeiro': return 'Financeiro';
      case 'outros': return 'Outros';
      default: return 'Outros';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'espiritual': return 'bg-purple-500';
      case 'saude': return 'bg-red-500';
      case 'familia': return 'bg-green-500';
      case 'trabalho': return 'bg-blue-500';
      case 'financeiro': return 'bg-yellow-500';
      case 'outros': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
        <h1 className="text-2xl font-bold">Pedidos de Oração</h1>
        <div className="w-20"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="glass-card p-2 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('enviar')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                activeTab === 'enviar'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              {editingRequest ? 'Editar Pedido' : 'Enviar Pedido'}
            </button>
            <button
              onClick={() => setActiveTab('publicos')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                activeTab === 'publicos'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Pedidos Públicos
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('meus')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  activeTab === 'meus'
                    ? 'bg-blue-600 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <MessageCircle className="w-5 h-5 inline mr-2" />
                Meus Pedidos
              </button>
            )}
          </div>
        </div>

        {/* Enviar Pedido Tab */}
        {activeTab === 'enviar' && (
          <div className="glass-card p-8">
            <div className="flex items-center mb-6">
              <Heart className="w-6 h-6 mr-3 text-red-400" />
              <h2 className="text-xl font-semibold">Compartilhe seu Pedido de Oração</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título do Pedido
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                  placeholder="Ex: Oração pela cura, Direção de Deus..."
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categoria
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="espiritual" className="bg-gray-800">Espiritual</option>
                    <option value="saude" className="bg-gray-800">Saúde</option>
                    <option value="familia" className="bg-gray-800">Família</option>
                    <option value="trabalho" className="bg-gray-800">Trabalho</option>
                    <option value="financeiro" className="bg-gray-800">Financeiro</option>
                    <option value="outros" className="bg-gray-800">Outros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Urgência
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="baixa" className="bg-gray-800">Baixa</option>
                    <option value="normal" className="bg-gray-800">Normal</option>
                    <option value="alta" className="bg-gray-800">Alta</option>
                    <option value="urgente" className="bg-gray-800">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição do Pedido
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 resize-none"
                  placeholder="Compartilhe seu pedido de oração. Seja específico para que possamos orar de forma direcionada."
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {!formData.is_anonymous && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Seu Nome
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                        placeholder="Seu nome completo"
                        required={!formData.is_anonymous}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        E-mail (opcional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4"
                  />
                  <label className="flex items-center text-sm">
                    <Lock className="w-4 h-4 mr-2" />
                    Enviar anonimamente
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4"
                  />
                  <label className="flex items-center text-sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Permitir que outros membros vejam e orem por este pedido
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Enviando...' : (editingRequest ? 'Atualizar Pedido' : 'Enviar Pedido')}
                </button>
                
                {editingRequest ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRequest(null);
                      setFormData({
                        title: '',
                        description: '',
                        category: 'espiritual',
                        name: '',
                        email: '',
                        is_anonymous: false,
                        is_public: false,
                        urgency: 'normal'
                      });
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20"
                  >
                    Cancelar
                  </button>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20"
                  >
                    Cancelar
                  </Link>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Pedidos Públicos Tab */}
        {activeTab === 'publicos' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 mr-3 text-blue-400" />
                <h2 className="text-xl font-semibold">Pedidos Públicos da Comunidade</h2>
              </div>
              <p className="text-white/80">
                Junte-se a nós em oração pelos pedidos compartilhados por nossa comunidade. 
                Cada oração faz a diferença!
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-white/70 mt-2">Carregando pedidos...</p>
              </div>
            ) : (
              <>
                {publicRequests.map(request => (
                  <div key={request.id} className="glass-card p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white mr-3 ${getCategoryColor(request.category)}`}>
                            {getCategoryLabel(request.category)}
                          </span>
                          <span className="text-sm text-white/60">
                            {formatDate(request.created_at)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                            request.urgency === 'urgente' ? 'bg-red-500/20 text-red-300' :
                            request.urgency === 'alta' ? 'bg-orange-500/20 text-orange-300' :
                            request.urgency === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                        <p className="text-white/80 mb-3">{request.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-white/70">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Por: {request.is_anonymous ? 'Anônimo' : request.author_name}
                          </div>
                          
                          <div className="flex items-center text-sm text-white/70">
                            <Heart className="w-4 h-4 mr-2 text-red-400" />
                            {request.prayer_count || 0} pessoas orando
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'ativo' ? 'bg-green-500/20 text-green-300' :
                        request.status === 'respondido' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {request.status === 'ativo' ? 'Ativo' : 
                         request.status === 'respondido' ? 'Respondido' : 'Arquivado'}
                      </span>
                      
                      <button 
                        onClick={() => handlePray(request.id)}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Orar por isso
                      </button>
                    </div>
                  </div>
                ))}
                
                {publicRequests.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 mx-auto text-white/30 mb-4" />
                    <p className="text-white/50">Nenhum pedido público no momento</p>
                  </div>
                )}
              </>
            )}
            
            <div className="glass-card p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-4 text-blue-400" />
              <h3 className="font-semibold mb-2">Horários de Oração</h3>
              <p className="text-white/80 mb-4">
                Nossa equipe de intercessão ora pelos pedidos recebidos:
              </p>
              <div className="space-y-2 text-sm text-white/70">
                <p>• Segundas, Quartas e Sextas às 6h</p>
                <p>• Todos os dias às 12h e 18h</p>
                <p>• Vigílias especiais na primeira sexta de cada mês</p>
              </div>
            </div>
          </div>
        )}

        {/* Meus Pedidos Tab */}
        {activeTab === 'meus' && user && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <MessageCircle className="w-6 h-6 mr-3 text-green-400" />
                <h2 className="text-xl font-semibold">Meus Pedidos de Oração</h2>
              </div>
              <p className="text-white/80">
                Gerencie seus pedidos de oração e acompanhe as orações recebidas.
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-white/70 mt-2">Carregando seus pedidos...</p>
              </div>
            ) : (
              <>
                {myRequests.map(request => (
                  <div key={request.id} className="glass-card p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white mr-3 ${getCategoryColor(request.category)}`}>
                            {getCategoryLabel(request.category)}
                          </span>
                          <span className="text-sm text-white/60">
                            {formatDate(request.created_at)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                            request.urgency === 'urgente' ? 'bg-red-500/20 text-red-300' :
                            request.urgency === 'alta' ? 'bg-orange-500/20 text-orange-300' :
                            request.urgency === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                          </span>
                          {request.is_public && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 ml-2">
                              <Globe className="w-3 h-3 inline mr-1" />
                              Público
                            </span>
                          )}
                          {request.is_anonymous && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 ml-2">
                              <Lock className="w-3 h-3 inline mr-1" />
                              Anônimo
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                        <p className="text-white/80 mb-3">{request.description}</p>
                        
                        <div className="flex items-center text-sm text-white/70">
                          <Heart className="w-4 h-4 mr-2 text-red-400" />
                          {request.prayer_count || 0} pessoas orando
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'ativo' ? 'bg-green-500/20 text-green-300' :
                        request.status === 'respondido' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {request.status === 'ativo' ? 'Ativo' : 
                         request.status === 'respondido' ? 'Respondido' : 'Arquivado'}
                      </span>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(request)}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(request.id)}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {myRequests.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 mx-auto text-white/30 mb-4" />
                    <p className="text-white/50 mb-4">Você ainda não fez nenhum pedido de oração</p>
                    <button 
                      onClick={() => setActiveTab('enviar')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Fazer meu primeiro pedido
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosOracao;