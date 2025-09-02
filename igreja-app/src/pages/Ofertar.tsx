import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, QrCode, Heart, DollarSign, Gift, Users, Copy, Check } from 'lucide-react';

const Ofertar: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'cartao' | 'transferencia'>('pix');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [offeringType, setOfferingType] = useState('dizimo');
  const [copied, setCopied] = useState(false);

  const predefinedAmounts = ['50', '100', '200', '500'];
  const pixKey = 'igreja@idpb.org';
  const pixCode = '00020126580014BR.GOV.BCB.PIX0136igreja@idpb.org52040000530398654041.005802BR5925IGREJA DIGITAL IDPB6009SAO PAULO62070503***6304ABCD';

  const handleAmountSelect = (value: string) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setAmount('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOfferingTypeLabel = (type: string) => {
    switch (type) {
      case 'dizimo': return 'Dízimo';
      case 'oferta': return 'Oferta';
      case 'missoes': return 'Missões';
      case 'construcao': return 'Construção';
      case 'social': return 'Ação Social';
      default: return 'Oferta';
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
        <h1 className="text-2xl font-bold">Ofertar</h1>
        <div className="w-20"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Versículo Inspiracional */}
        <div className="glass-card p-6 mb-8 text-center">
          <Heart className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-lg italic mb-2">
            "Cada um contribua segundo propôs no seu coração, não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria."
          </p>
          <p className="text-white/70">2 Coríntios 9:7</p>
        </div>

        {/* Tipo de Oferta */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Gift className="w-6 h-6 mr-3 text-green-400" />
            Tipo de Contribuição
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { value: 'dizimo', label: 'Dízimo', icon: '💰' },
              { value: 'oferta', label: 'Oferta', icon: '🎁' },
              { value: 'missoes', label: 'Missões', icon: '🌍' },
              { value: 'construcao', label: 'Construção', icon: '🏗️' },
              { value: 'social', label: 'Ação Social', icon: '❤️' }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setOfferingType(type.value)}
                className={`p-4 rounded-lg font-medium transition-all duration-300 ${
                  offeringType === type.value
                    ? 'bg-blue-600 text-white transform scale-105'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Valor */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-3 text-yellow-400" />
            Valor da Contribuição
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {predefinedAmounts.map(value => (
              <button
                key={value}
                onClick={() => handleAmountSelect(value)}
                className={`p-4 rounded-lg font-semibold transition-all duration-300 ${
                  amount === value
                    ? 'bg-green-600 text-white transform scale-105'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                R$ {value}
              </button>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Ou digite um valor personalizado:
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
              placeholder="R$ 0,00"
              min="1"
              step="0.01"
            />
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>
          
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSelectedMethod('pix')}
              className={`flex-1 p-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                selectedMethod === 'pix'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <QrCode className="w-5 h-5 mr-2" />
              PIX
            </button>
            <button
              onClick={() => setSelectedMethod('cartao')}
              className={`flex-1 p-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                selectedMethod === 'cartao'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Cartão
            </button>
            <button
              onClick={() => setSelectedMethod('transferencia')}
              className={`flex-1 p-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                selectedMethod === 'transferencia'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Transferência
            </button>
          </div>

          {/* PIX */}
          {selectedMethod === 'pix' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-gray-600" />
                  </div>
                </div>
                <p className="text-white/80 mb-4">Escaneie o QR Code com seu app de banco</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Chave PIX:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pixKey}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                  <button
                    onClick={() => copyToClipboard(pixKey)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Código PIX Copia e Cola:</label>
                <div className="flex items-center gap-2">
                  <textarea
                    value={pixCode}
                    readOnly
                    rows={3}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none"
                  />
                  <button
                    onClick={() => copyToClipboard(pixCode)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cartão */}
          {selectedMethod === 'cartao' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Número do Cartão</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nome no Cartão</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                    placeholder="Nome como está no cartão"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Validade</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                    placeholder="MM/AA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
                    placeholder="000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transferência */}
          {selectedMethod === 'transferencia' && (
            <div className="space-y-4">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Dados Bancários</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Banco:</strong> Banco do Brasil</p>
                  <p><strong>Agência:</strong> 1234-5</p>
                  <p><strong>Conta Corrente:</strong> 12345-6</p>
                  <p><strong>CNPJ:</strong> 12.345.678/0001-90</p>
                  <p><strong>Favorecido:</strong> Igreja Digital IDPB</p>
                </div>
              </div>
              
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Importante:</strong> Após realizar a transferência, envie o comprovante 
                  para nosso WhatsApp (11) 99999-9999 informando o tipo de contribuição.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Resumo e Confirmação */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Resumo da Contribuição</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Tipo:</span>
              <span className="font-semibold">{getOfferingTypeLabel(offeringType)}</span>
            </div>
            <div className="flex justify-between">
              <span>Valor:</span>
              <span className="font-semibold text-green-400">
                R$ {amount || customAmount || '0,00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Forma de Pagamento:</span>
              <span className="font-semibold capitalize">{selectedMethod}</span>
            </div>
          </div>
          
          {selectedMethod === 'cartao' && (
            <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 mb-4">
              Processar Pagamento
            </button>
          )}
          
          <div className="text-center">
            <p className="text-white/80 text-sm mb-4">
              Sua contribuição faz a diferença no Reino de Deus. Obrigado por ser parte desta obra!
            </p>
            
            <div className="flex items-center justify-center text-sm text-white/70">
              <Users className="w-4 h-4 mr-2" />
              Mais de 1.000 pessoas já contribuíram este mês
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ofertar;