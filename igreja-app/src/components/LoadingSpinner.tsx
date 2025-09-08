import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  timeout?: number; // Timeout em milissegundos
  onTimeout?: () => void;
  onRetry?: () => void;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Carregando...', 
  fullScreen = true,
  timeout = 15000, // 15 segundos por padrão
  onTimeout,
  onRetry
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (timeout <= 0) return;

    const startTime = Date.now();
    
    // Timer para atualizar o tempo decorrido
    const elapsedTimer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    // Timer para timeout
    const timeoutTimer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => {
      clearInterval(elapsedTimer);
      clearTimeout(timeoutTimer);
    };
  }, [timeout, onTimeout]);

  const handleRetry = () => {
    setHasTimedOut(false);
    setElapsedTime(0);
    onRetry?.();
  };
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-10 h-10';
    }
  };

  // Mostrar interface de timeout se necessário
  if (hasTimedOut) {
    const timeoutContent = (
      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="w-16 h-16 mb-4 text-red-400">
          <RefreshCw className="w-full h-full" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Conexão Lenta
        </h3>
        <p className="text-white/80 text-center mb-6">
          A conexão está demorando muito para responder. Por favor, verifique sua internet e tente novamente.
        </p>
        {onRetry && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        )}
        <p className="text-white/60 text-sm mt-4">
          Ou atualize a página manualmente
        </p>
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center z-50">
          {timeoutContent}
        </div>
      );
    }
    return timeoutContent;
  }

  // Mostrar tempo decorrido se estiver demorando
  const showElapsedTime = elapsedTime > 5000; // Mostrar após 5 segundos
  const seconds = Math.floor(elapsedTime / 1000);

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`${getSizeClasses()} animate-spin`}>
        <svg className="w-full h-full text-blue-400" fill="none" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {message && (
        <p className="mt-4 text-white/80 text-sm font-medium">{message}</p>
      )}
      {showElapsedTime && (
        <p className="mt-2 text-white/60 text-xs">
          Carregando há {seconds} segundos...
        </p>
      )}
      {elapsedTime > 10000 && (
        <p className="mt-2 text-yellow-400 text-xs text-center max-w-xs">
          A conexão está mais lenta que o normal. Aguarde ou atualize a página.
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center text-white z-50"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        <div className="glass-card p-8">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;