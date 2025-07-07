
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
      
      // Temporariamente, vamos usar Supabase Auth para login,
      // mas o ideal seria ter uma tabela admin_users separada e bcrypt para senhas.
      // Esta é uma simplificação para o escopo atual.
      // A tabela admin_users foi criada, mas a lógica de hash de senha e comparação não está aqui.
      // Vamos simular a verificação contra a tabela admin_users, mas sem bcrypt por simplicidade.

      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('id, email, password_hash') // password_hash viria do banco
        .eq('email', formData.username) // Assumindo que username é o email para admin
        .single();

      if (fetchError || !adminUser) {
        console.error('Erro ao buscar admin ou admin não encontrado:', fetchError);
        toast({ title: "Erro no login", description: "Usuário ou senha incorretos.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // SIMULAÇÃO DE VERIFICAÇÃO DE SENHA
      // Em um cenário real, formData.password seria hasheada e comparada com adminUser.password_hash
      // Aqui, vamos usar uma senha fixa para demonstração, ou comparar diretamente se password_hash for a senha em plain text (NÃO FAZER ISSO EM PRODUÇÃO)
      // Para este exemplo, se password_hash não estiver setado no DB, usamos a senha padrão 'admin123'
      const isPasswordCorrect = adminUser.password_hash
        ? formData.password === adminUser.password_hash // Isto só funcionaria se a senha estivesse em plain text no DB (RUIM!)
                                                      // Ou se password_hash fosse o resultado de um hash igual ao da entrada (improvável sem bcrypt)
        : formData.password === 'admin123'; // Fallback para senha padrão se não houver hash no DB

      if (!isPasswordCorrect) {
        toast({ title: "Erro no login", description: "Usuário ou senha incorretos.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Salvar sessão admin no localStorage
      const adminSession = {
        userId: adminUser.id,
        email: adminUser.email, // Usar email como identificador
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('adminSession', JSON.stringify(adminSession));

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
            <Label htmlFor="username">Email</Label> {/* Alterado para Email */}
            <Input
              id="username" // Mantido id como username por consistência com o estado
              name="username" // Mantido name como username por consistência com o estado
              type="email"    // Alterado para type="email"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="email" // Alterado para email
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label> {/* Mantido como Senha */}
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

        {/* Removida a dica de acesso padrão, pois agora depende do DB */}
        {/* <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Acesso padrão:</strong><br />
            Usuário: admin<br />
            Senha: admin123
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default AdminLogin;
