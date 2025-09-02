import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo no topo */}
      <Header />
      
      {/* Conteúdo principal com padding para não ficar escondido atrás do header */}
      <main style={{ paddingTop: '80px' }} className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;