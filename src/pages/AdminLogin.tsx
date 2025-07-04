
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Tentando login com:', formData.username);
      
      // Buscar usuário admin no banco usando a tabela admin_users
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', formData.username)
        .single();

      console.log('Resultado da busca admin_users:', { adminUser, error });

      if (error) {
        console.error('Erro na busca do usuário admin:', error);
        throw new Error('Usuário não encontrado na tabela admin_users');
      }

      if (!adminUser) {
        throw new Error('Usuário admin não encontrado');
      }

      // Verificação da senha (em produção, use bcrypt para comparar hash)
      if (formData.password !== 'admin123') {
        throw new Error('Senha incorreta');
      }

      // Salvar sessão admin no localStorage
      const adminSession = {
        userId: adminUser.id,
        username: adminUser.username,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('adminSession', JSON.stringify(adminSession));
      console.log('Sessão admin salva:', adminSession);

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o painel administrativo...",
      });

      navigate('/admin');
    } catch (error: any) {
      console.error('Erro no login admin:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Usuário ou senha incorretos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            Acesso Administrativo
          </h1>
          <p className="text-gray-600 mt-2">
            Entre com suas credenciais para acessar o painel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Voltar ao site
          </button>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Acesso padrão:</strong><br />
            Usuário: admin<br />
            Senha: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
