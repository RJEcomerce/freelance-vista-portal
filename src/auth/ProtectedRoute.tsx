
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const getAdminSession = () => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      return null;
    }
    try {
      // TODO: Adicionar validação de tempo da sessão se necessário
      return JSON.parse(session);
    } catch (error) {
      console.error("Erro ao parsear adminSession:", error);
      return null;
    }
  };

  const adminSession = getAdminSession();

  if (!adminSession) {
    // Usuário não está logado, redireciona para a página de login
    return <Navigate to="/admin/login" replace />;
  }

  // Usuário está logado, renderiza o conteúdo da rota protegida
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
