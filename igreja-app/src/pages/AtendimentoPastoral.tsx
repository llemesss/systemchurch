import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, Clock, Heart, MessageCircle, User } from 'lucide-react';

const AtendimentoPastoral: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    urgency: 'normal',
    preferredContact: 'email'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Usar Supabase através do utilitário de API
      const { pastoralCareSupabase } = await import('../utils/supabaseUtils');
      
      const response = await pastoralCareSupabase.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        urgency: formData.urgency,
        preferred_contact: formData.preferredContact
      });
      
      // Dados já obtidos do Supabase
      if (response) {
        alert('Sua solicitação foi enviada! Entraremos em contato em breve.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          urgency: 'normal',
          preferredContact: 'email'
        });
      } else {
        alert('Erro ao enviar solicitação. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação. Verifique sua conexão e tente novamente.');
    }
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
        <h1 className="text-2xl font-bold">Atendimento Pastoral</h1>
        <div className="w-20"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Informações de Contato */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 text-center">
            <Phone className="w-8 h-8 mx-auto mb-4 text-green-400" />
            <h3 className="font-semibold mb-2">Telefone</h3>
            <p className="text-white/80">(11) 9999-9999</p>
            <p className="text-sm text-white/60 mt-1">Seg-Sex: 9h às 18h</p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <Mail className="w-8 h-8 mx-auto mb-4 text-blue-400" />
            <h3 className="font-semibold mb-2">E-mail</h3>
            <p className="text-white/80">pastoral@idpb.org</p>
            <p className="text-sm text-white/60 mt-1">Resposta em 24h</p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Agendamento</h3>
            <p className="text-white/80">Presencial</p>
            <p className="text-sm text-white/60 mt-1">Mediante agendamento</p>
          </div>
        </div>

        {/* Formulário de Solicitação */}
        <div className="glass-card p-8">
          <div className="flex items-center mb-6">
            <Heart className="w-6 h-6 mr-3 text-red-400" />
            <h2 className="text-xl font-semibold">Solicitar Atendimento</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Urgência
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="normal" className="bg-gray-800">Normal</option>
                  <option value="urgent" className="bg-gray-800">Urgente</option>
                  <option value="emergency" className="bg-gray-800">Emergência</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Forma de Contato Preferida
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="email"
                    checked={formData.preferredContact === 'email'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  E-mail
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="phone"
                    checked={formData.preferredContact === 'phone'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Telefone
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="whatsapp"
                    checked={formData.preferredContact === 'whatsapp'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  WhatsApp
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Assunto
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                placeholder="Resumo do que você gostaria de conversar"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Mensagem
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 resize-none"
                placeholder="Descreva sua situação ou dúvida. Lembre-se de que este é um espaço seguro e confidencial."
                required
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Enviar Solicitação
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        {/* Informações Adicionais */}
        <div className="glass-card p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Informações Importantes</h3>
          <div className="space-y-3 text-white/80">
            <p>• Todas as conversas são estritamente confidenciais</p>
            <p>• Em casos de emergência, ligue diretamente para (11) 9999-9999</p>
            <p>• O atendimento presencial é realizado mediante agendamento</p>
            <p>• Responderemos sua solicitação em até 24 horas</p>
            <p>• Para situações que requerem acompanhamento contínuo, oferecemos sessões regulares</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtendimentoPastoral;