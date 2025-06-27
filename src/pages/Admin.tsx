
import { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, MessageSquare, BarChart3, Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const stats = {
    totalFreelancers: 156,
    activeProjects: 23,
    pendingApprovals: 8,
    monthlyRevenue: 12500
  };

  const pendingFreelancers = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@email.com',
      region: 'São Paulo',
      experiences: 'Desenvolvimento Web, React',
      submittedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@email.com',
      region: 'Rio de Janeiro',
      experiences: 'Design UX/UI, Figma',
      submittedAt: '2024-01-14'
    }
  ];

  const recentContacts = [
    {
      id: 1,
      contractor: 'Empresa ABC',
      freelancer: 'Ana Silva',
      project: 'Desenvolvimento de Site',
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: 2,
      contractor: 'Startup XYZ',
      freelancer: 'Carlos Oliveira',
      project: 'Design de Logo',
      status: 'approved',
      date: '2024-01-14'
    }
  ];

  const handleApprove = (id: number) => {
    console.log('Aprovar freelancer:', id);
  };

  const handleReject = (id: number) => {
    console.log('Rejeitar freelancer:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Settings className="h-8 w-8 mr-3 text-blue-600" />
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Gerencie freelancers, projetos e monitore o desempenho da plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Freelancers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFreelancers}</div>
              <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">+5% esta semana</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Requer atenção</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% em relação ao mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="freelancers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="freelancers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aprovações Pendentes</CardTitle>
                <CardDescription>
                  Freelancers aguardando aprovação para aparecer na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingFreelancers.map((freelancer) => (
                    <div
                      key={freelancer.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{freelancer.name}</h4>
                          <Badge variant="outline">{freelancer.region}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{freelancer.email}</p>
                        <p className="text-sm text-gray-500">{freelancer.experiences}</p>
                        <p className="text-xs text-gray-400">
                          Enviado em: {new Date(freelancer.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log('Ver detalhes')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(freelancer.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleReject(freelancer.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contatos Recentes</CardTitle>
                <CardDescription>
                  Últimas solicitações de contato entre contratantes e freelancers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{contact.contractor}</h4>
                          <span className="text-gray-500">→</span>
                          <span className="text-gray-700">{contact.freelancer}</span>
                        </div>
                        <p className="text-sm text-gray-600">{contact.project}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(contact.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={contact.status === 'approved' ? 'default' : 'secondary'}
                        >
                          {contact.status === 'approved' ? 'Aprovado' : 'Pendente'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Plataforma</CardTitle>
                <CardDescription>
                  Configure aspectos gerais da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Taxa da Plataforma</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="5"
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">% por transação</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Email de Notificações</h4>
                  <Input
                    type="email"
                    placeholder="admin@freelancehub.com"
                    className="max-w-md"
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Configurações de Aprovação</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Aprovação automática para freelancers</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Notificar admin sobre novos cadastros</span>
                    </label>
                  </div>
                </div>
                
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
