
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, MessageSquare, BarChart3, Search, Filter, Eye, CheckCircle, XCircle, LogOut } from 'lucide-react'; // Adicionar LogOut
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FreelancerDetailModal from '@/components/FreelancerDetailModal';
import AddAdminUserModal from '@/components/AddAdminUserModal';
import EditAdminUserModal from '@/components/EditAdminUserModal';
import AddJobModal from '@/components/AddJobModal';
import EditJobModal from '@/components/EditJobModal';
import AddSponsorModal from '@/components/AddSponsorModal';
import EditSponsorModal from '@/components/EditSponsorModal';
import ContactDetailModal from '@/components/ContactDetailModal'; // Importar ContactDetailModal

// Tipagem para Freelancer
interface Freelancer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string | null;
  region: string;
  experiences: string;
  portfolio?: string | null;
  availability?: string | null;
  photo_url?: string | null;
  submittedAt: string;
  approved?: boolean | null;
  created_at?: string;
}

// Tipagem para Usuário Admin
interface AdminUser {
  id: number;
  email: string;
  created_at?: string;
}

// Tipagem para Job (baseado em types.ts)
interface Job {
  id: string;
  title: string;
  description: string | null;
  budget: string;
  location: string;
  active: boolean | null;
  created_at?: string | null;
}

// Tipagem para Sponsor (baseado em types.ts)
interface Sponsor {
  id: string;
  name: string;
  description: string;
  logo: string;
  active: boolean | null;
  created_at?: string | null;
}

// Tipagem para Contato (detalhada)
interface Contact {
  id: string;
  contractor_name: string;
  contractor_email: string;
  contractor_phone: string;
  project_description: string | null;
  daily_rate: number; // Verificar se este campo é usado ou se é de outra tabela
  work_address: string; // Verificar se este campo é usado
  status: string | null;
  created_at: string | null;
  freelancer_id: string | null;
  freelancer_name?: string;
  // Se a tabela 'contacts' tiver outros campos relevantes, adicionar aqui
  // Ex: subject, message, etc. Pela definição atual, parece ser mais um "pedido de projeto"
}


const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Freelancers
  const [pendingFreelancers, setPendingFreelancers] = useState<Freelancer[]>([]);
  const [approvedFreelancers, setApprovedFreelancers] = useState<Freelancer[]>([]);
  const [loadingFreelancers, setLoadingFreelancers] = useState(true);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Estados para Contatos
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [isContactDetailModalOpen, setIsContactDetailModalOpen] = useState(false);
  const [selectedContactToView, setSelectedContactToView] = useState<Contact | null>(null);

  // Estados para Usuários Admin
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(true);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [selectedAdminUserToEdit, setSelectedAdminUserToEdit] = useState<AdminUser | null>(null);

  // Estados para Jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [selectedJobToEdit, setSelectedJobToEdit] = useState<Job | null>(null);

  // Estados para Sponsors
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [isAddSponsorModalOpen, setIsAddSponsorModalOpen] = useState(false);
  const [isEditSponsorModalOpen, setIsEditSponsorModalOpen] = useState(false);
  const [selectedSponsorToEdit, setSelectedSponsorToEdit] = useState<Sponsor | null>(null);

  // Estados para Configurações da Plataforma
  const [platformSettings, setPlatformSettings] = useState<Record<string, string>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsInputs, setSettingsInputs] = useState<Record<string, string>>({});
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false); // Estado de submitting para o form de settings


  // Mock data
  const stats = {
    totalFreelancers: 156,
    activeProjects: 23,
    pendingApprovals: pendingFreelancers.length, // Atualizado para usar o estado
    monthlyRevenue: 12500
  };

  // Removido mock de pendingFreelancers pois será buscado do Supabase
  // Removido mock de recentContacts pois será buscado do Supabase


  useEffect(() => {
    fetchFreelancersData();
    fetchContactsData();
    fetchAdminUsersData();
    fetchJobsData();
    fetchSponsorsData();
    fetchPlatformSettings(); // Chamar a busca de configurações
  }, []);

  const PLATFORM_SETTINGS_KEYS = {
    POST_REGISTRATION_MSG: 'POST_REGISTRATION_MSG',
    POST_CONTACT_MSG: 'POST_CONTACT_MSG',
    HOME_PAGE_ALERT_TITLE: 'HOME_PAGE_ALERT_TITLE',
    HOME_PAGE_ALERT_MESSAGE: 'HOME_PAGE_ALERT_MESSAGE',
    HOME_PAGE_ALERT_VISIBLE: 'HOME_PAGE_ALERT_VISIBLE', // 'true' or 'false'
  };

  const fetchPlatformSettings = async () => {
    setLoadingSettings(true);
    try {
      const { data, error } = await supabase.from('platform_settings').select('key, value');
      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data.forEach(item => {
        settingsMap[item.key] = item.value || '';
      });
      setPlatformSettings(settingsMap);
      setSettingsInputs(settingsMap); // Inicializar inputs com valores do DB
    } catch (error: any) {
      console.error("Erro ao buscar configurações da plataforma:", error);
      toast({ title: "Erro Configurações", description: error.message, variant: "destructive" });
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSettingInputChange = (key: string, value: string) => {
    setSettingsInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleSettingChange = (key: string, checked: boolean) => {
    setSettingsInputs(prev => ({ ...prev, [key]: checked ? 'true' : 'false' }));
  };

  const handleSavePlatformSettings = async () => {
    setIsSubmittingSettings(true); // Assumindo que você terá um estado como isSubmittingSettings
    try {
      const upsertData = Object.entries(settingsInputs).map(([key, value]) => ({
        key,
        value: value ?? '', // Garantir que value não seja undefined
      }));

      const { error } = await supabase.from('platform_settings').upsert(upsertData, {
        onConflict: 'key',
      });

      if (error) throw error;

      toast({ title: "Sucesso", description: "Configurações salvas." });
      fetchPlatformSettings(); // Re-fetch para garantir consistência
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingSettings(false);
    }
  };


  const fetchSponsorsData = async () => {
    setLoadingSponsors(true);
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar patrocinadores:', error);
        toast({ title: "Erro Sponsors", description: error.message, variant: "destructive" });
        return;
      }
      setSponsors(data || []);
    } catch (err: any) {
      console.error('Erro inesperado ao buscar patrocinadores:', err);
      toast({ title: "Erro Sponsors", description: err.message || "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setLoadingSponsors(false);
    }
  };

  // --- Funções CRUD para Jobs ---
  const handleOpenAddJobModal = () => setIsAddJobModalOpen(true);
  const handleCloseAddJobModal = () => setIsAddJobModalOpen(false);

  const handleOpenEditJobModal = (job: Job) => {
    setSelectedJobToEdit(job);
    setIsEditJobModalOpen(true);
  };
  const handleCloseEditJobModal = () => {
    setSelectedJobToEdit(null);
    setIsEditJobModalOpen(false);
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir a oferta "${jobTitle}"?`)) {
      return;
    }
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      toast({ title: "Sucesso", description: `Oferta "${jobTitle}" excluída.` });
      fetchJobsData();
    } catch (error: any) {
      console.error('Erro ao excluir job:', error);
      toast({ title: "Erro ao excluir oferta", description: error.message, variant: "destructive" });
    }
  };

  // --- Funções para Modal de Detalhes do Contato ---
  const handleOpenContactDetailModal = (contact: Contact) => {
    setSelectedContactToView(contact);
    setIsContactDetailModalOpen(true);
  };
  const handleCloseContactDetailModal = () => {
    setSelectedContactToView(null);
    setIsContactDetailModalOpen(false);
  };
  // --- Fim Funções Modal Contato ---

  // --- Funções CRUD para Sponsors ---
  const handleOpenAddSponsorModal = () => setIsAddSponsorModalOpen(true);
  const handleCloseAddSponsorModal = () => setIsAddSponsorModalOpen(false);

  const handleOpenEditSponsorModal = (sponsor: Sponsor) => {
    setSelectedSponsorToEdit(sponsor);
    setIsEditSponsorModalOpen(true);
  };
  const handleCloseEditSponsorModal = () => {
    setSelectedSponsorToEdit(null);
    setIsEditSponsorModalOpen(false);
  };

  const handleDeleteSponsor = async (sponsorId: string, sponsorName: string, logoUrl: string) => {
    if (!confirm(`Tem certeza que deseja excluir o patrocinador "${sponsorName}"?`)) {
      return;
    }
    try {
      const { error: dbError } = await supabase.from('sponsors').delete().eq('id', sponsorId);
      if (dbError) throw dbError;

      if (typeof logoUrl === 'string' && logoUrl.trim() !== '') {
        const bucketName = 'sponsor-logos'; // Nome do bucket
        try {
            const urlParts = new URL(logoUrl);
            // Path no storage é /object/public/bucket-name/path/to/file.ext
            // Queremos 'path/to/file.ext'
            const pathPrefix = `/object/public/${bucketName}/`;
            if (urlParts.pathname.startsWith(pathPrefix)) {
                const filePathInBucket = urlParts.pathname.substring(pathPrefix.length);
                console.log(`Tentando deletar logo do Storage: ${bucketName}/${filePathInBucket}`);
                const { error: storageError } = await supabase.storage.from(bucketName).remove([filePathInBucket]);
                if (storageError) {
                    console.warn(`Erro ao deletar logo ${filePathInBucket} do storage:`, storageError);
                    toast({ title: "Aviso", description: `Sponsor ${sponsorName} excluído, mas houve um erro ao remover a logo: ${storageError.message}`, variant: "default", duration: 7000 });
                }
            } else {
                 console.warn(`URL da logo '${logoUrl}' não corresponde ao formato esperado para extrair o path do bucket '${bucketName}'.`);
            }
        } catch(e) {
            console.warn(`Erro ao parsear URL da logo '${logoUrl}' ou deletar do storage:`, e);
        }
      }
      toast({ title: "Sucesso", description: `Patrocinador "${sponsorName}" excluído.` });
      fetchSponsorsData();
    } catch (error: any) {
      console.error('Erro ao excluir sponsor:', error);
      toast({ title: "Erro ao excluir patrocinador", description: error.message, variant: "destructive" });
    }
  };
  // --- Fim Funções CRUD para Sponsors ---

  // --- Funções Adicionais de Exclusão ---
  const handleDeleteApprovedFreelancer = async (freelancerId: number, freelancerName: string, photoUrl?: string | null) => {
    if (!confirm(`Tem certeza que deseja excluir PERMANENTEMENTE o freelancer "${freelancerName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      // 1. Deletar da tabela freelancers
      const { error: dbError } = await supabase.from('freelancers').delete().eq('id', freelancerId);
      if (dbError) throw dbError;

      // 2. Deletar foto do storage (se existir)
      if (typeof photoUrl === 'string' && photoUrl.trim() !== '') {
        const bucketName = 'profile-photos'; // Nome do bucket de fotos de perfil
         try {
            const urlParts = new URL(photoUrl);
            const pathPrefix = `/object/public/${bucketName}/`;
            if (urlParts.pathname.startsWith(pathPrefix)) {
                const filePathInBucket = urlParts.pathname.substring(pathPrefix.length);
                console.log(`Tentando deletar foto do Storage: ${bucketName}/${filePathInBucket}`);
                const { error: storageError } = await supabase.storage.from(bucketName).remove([filePathInBucket]);
                if (storageError) {
                    console.warn(`Erro ao deletar foto ${filePathInBucket} do storage:`, storageError);
                }
            } else {
                 console.warn(`URL da foto '${photoUrl}' não corresponde ao formato esperado para extrair o path do bucket '${bucketName}'.`);
            }
        } catch(e) {
            console.warn(`Erro ao parsear URL da foto '${photoUrl}' ou deletar do storage:`, e);
        }
      }
      toast({ title: "Sucesso", description: `Freelancer "${freelancerName}" excluído permanentemente.` });
      fetchFreelancersData(); // Re-busca todos os freelancers para atualizar ambas as listas (pendentes e aprovados)
    } catch (error: any) {
      console.error('Erro ao excluir freelancer aprovado:', error);
      toast({ title: "Erro ao excluir freelancer", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteContact = async (contactId: string, contractorName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o contato de "${contractorName}"?`)) {
      return;
    }
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', contactId);
      if (error) throw error;
      toast({ title: "Sucesso", description: `Contato de "${contractorName}" excluído.` });
      fetchContactsData();
    } catch (error: any) {
      console.error('Erro ao excluir contato:', error);
      toast({ title: "Erro ao excluir contato", description: error.message, variant: "destructive" });
    }
  };
  // --- Fim Funções Adicionais de Exclusão ---

  const fetchJobsData = async () => {
    setLoadingJobs(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ofertas de trabalho:', error);
        toast({ title: "Erro Jobs", description: error.message, variant: "destructive" });
        return;
      }
      setJobs(data || []);
    } catch (err: any) {
      console.error('Erro inesperado ao buscar jobs:', err);
      toast({ title: "Erro Jobs", description: err.message || "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setLoadingJobs(false);
    }
  };
  // --- Fim Funções CRUD para Jobs ---

  const fetchAdminUsersData = async () => {
    setLoadingAdminUsers(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, created_at') // Selecionar apenas campos seguros
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários admin:', error);
        toast({ title: "Erro Usuários Admin", description: error.message, variant: "destructive" });
        return;
      }
      setAdminUsers(data || []);
    } catch (err: any) {
      console.error('Erro inesperado ao buscar usuários admin:', err);
      toast({ title: "Erro Usuários Admin", description: err.message || "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const fetchFreelancersData = async () => {
    setLoadingFreelancers(true);
    try {
      const { data, error } = await supabase
        .from('freelancers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar freelancers:', error);
        toast({ title: "Erro Freelancers", description: error.message, variant: "destructive" });
        return;
      }

      const formattedData = data.map(f => ({
        id: f.id,
        name: f.name,
        email: f.email,
        phone: f.phone,
        age: f.age,
        gender: f.gender,
        region: f.region,
        experiences: typeof f.experiences === 'string' ? f.experiences : '',
        portfolio: f.portfolio,
        availability: f.availability,
        photo_url: f.photo_url,
        submittedAt: new Date(f.created_at).toISOString(),
        approved: f.approved,
        created_at: f.created_at,
      }));

      setPendingFreelancers(formattedData.filter(f => f.approved === false || f.approved === null));
      setApprovedFreelancers(formattedData.filter(f => f.approved === true));

    } catch (err: any) {
      console.error('Erro inesperado ao buscar freelancers:', err);
      toast({ title: "Erro Freelancers", description: err.message || "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setLoadingFreelancers(false);
    }
  };

  const fetchContactsData = async () => {
    setLoadingContacts(true);
    try {
      // Ajustar o select para pegar nome do freelancer também
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          freelancers ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar contatos:', error);
        toast({ title: "Erro Contatos", description: error.message, variant: "destructive" });
        return;
      }

      // O Supabase aninha o nome do freelancer. Precisamos formatar.
      const formattedContacts = data.map(contact => ({
        ...contact,
        freelancer_name: (contact.freelancers as any)?.name || 'N/A', // Acessa o nome do freelancer
      }));

      setRecentContacts(formattedContacts);

    } catch (err: any) {
      console.error('Erro inesperado ao buscar contatos:', err);
      toast({ title: "Erro Contatos", description: err.message || "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setLoadingContacts(false);
    }
  };


  const handleApprove = async (id: number) => {
    try {
      const { error } = await supabase
        .from('freelancers')
        .update({ approved: true })
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Freelancer aprovado." });
      fetchFreelancersData(); // Re-fetch para atualizar listas
    } catch (error: any) {
      console.error('Erro ao aprovar freelancer:', error);
      toast({ title: "Erro", description: error.message || "Não foi possível aprovar o freelancer.", variant: "destructive" });
    }
  };

  const handleReject = async (id: number) => {
    // Por enquanto, a rejeição pode significar apenas não aprovar.
    // Se precisar deletar ou marcar como rejeitado, a lógica abaixo precisaria mudar.
    // Para este exemplo, vamos apenas remover da lista de pendentes (simulando uma deleção ou arquivamento)
    // ou marcar como 'rejected' se houver tal campo.
    // Assumindo que rejeitar significa deletar da tabela freelancers:
    try {
      const { error } = await supabase
        .from('freelancers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Freelancer rejeitado e removido." });
      fetchFreelancersData(); // Re-fetch para atualizar listas
    } catch (error: any) {
      console.error('Erro ao rejeitar freelancer:', error);
      toast({ title: "Erro", description: error.message || "Não foi possível rejeitar o freelancer.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    // Idealmente, chamar o método de signOut do Supabase se estiver usando sua autenticação
    // supabase.auth.signOut();
    localStorage.removeItem('adminSession'); // Se estiver usando session customizada
    navigate('/admin/login');
  };

  const handleOpenDetailModal = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFreelancer(null);
  };

  // CRUD Admin Users
  const handleOpenEditAdminModal = (user: AdminUser) => {
    setSelectedAdminUserToEdit(user);
    setIsEditAdminModalOpen(true);
  };

  const handleDeleteAdminUser = async (userId: number, userEmail: string) => {
    // Prevenir auto-exclusão ou exclusão de um admin principal (lógica a ser definida)
    // Exemplo: if (userEmail === 'admin@example.com') {
    //   toast({ title: "Erro", description: "Não é possível excluir o administrador principal.", variant: "destructive" });
    //   return;
    // }

    if (!confirm(`Tem certeza que deseja excluir o usuário ${userEmail}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({ title: "Sucesso", description: `Usuário ${userEmail} excluído.` });
      fetchAdminUsersData(); // Re-fetch para atualizar lista
    } catch (error: any) {
      console.error('Erro ao excluir usuário admin:', error);
      toast({ title: "Erro ao excluir", description: error.message || "Não foi possível excluir o usuário.", variant: "destructive" });
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-blue-600" />
              Painel Administrativo
            </h1>
            <p className="text-gray-600">
              Gerencie freelancers, projetos e monitore o desempenho da plataforma
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
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
          <TabsList className="grid w-full grid-cols-7"> {/* Ajustado para 7 colunas */}
            <TabsTrigger value="pendingFreelancers">Aprovações Pendentes</TabsTrigger>
            <TabsTrigger value="approvedFreelancers">Freelancers Aprovados</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="adminUsers">Usuários Admin</TabsTrigger>
            <TabsTrigger value="jobs">Ofertas de Trabalho</TabsTrigger>
            <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger> {/* Nova Aba */}
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pendingFreelancers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aprovações Pendentes</CardTitle>
                <CardDescription>
                  Freelancers aguardando aprovação para aparecer na plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingFreelancers ? (
                  <p>Carregando freelancers pendentes...</p>
                ) : pendingFreelancers.length === 0 ? (
                  <p>Nenhum freelancer pendente de aprovação.</p>
                ) : (
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
                            onClick={() => handleOpenDetailModal(freelancer)}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patrocinadores</CardTitle>
                <CardDescription>
                  Gerencie os patrocinadores da plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button onClick={handleOpenAddSponsorModal}>
                    Adicionar Novo Patrocinador
                  </Button>
                </div>
                {loadingSponsors ? (
                  <p>Carregando patrocinadores...</p>
                ) : sponsors.length === 0 ? (
                  <p>Nenhum patrocinador encontrado.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sponsors.map((sponsor) => (
                      <Card key={sponsor.id}>
                        <CardHeader>
                          <img src={sponsor.logo || 'https://via.placeholder.com/150?text=Logo'} alt={sponsor.name} className="w-full h-32 object-contain mb-2"/>
                          <CardTitle>{sponsor.name} <Badge variant={sponsor.active ? "default" : "outline"}>{sponsor.active ? "Ativo" : "Inativo"}</Badge></CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 truncate">{sponsor.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Cadastrado em: {new Date(sponsor.created_at!).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditSponsorModal(sponsor)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSponsor(sponsor.id, sponsor.name, sponsor.logo)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ofertas de Trabalho</CardTitle>
                <CardDescription>
                  Gerencie as ofertas de trabalho cadastradas na plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="mb-4">
                  <Button onClick={handleOpenAddJobModal}>
                    Adicionar Nova Oferta
                  </Button>
                </div>
                {loadingJobs ? (
                  <p>Carregando ofertas de trabalho...</p>
                ) : jobs.length === 0 ? (
                  <p>Nenhuma oferta de trabalho encontrada.</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{job.title} <Badge variant={job.active ? "default" : "outline"}>{job.active ? "Ativa" : "Inativa"}</Badge></h4>
                          <p className="text-sm text-gray-600">Local: {job.location}</p>
                          <p className="text-sm text-gray-600">Orçamento: {job.budget}</p>
                          <p className="text-xs text-gray-500">
                            Cadastrada em: {new Date(job.created_at!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditJobModal(job)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteJob(job.id, job.title)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvedFreelancers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Freelancers Aprovados</CardTitle>
                <CardDescription>
                  Lista de freelancers ativos na plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingFreelancers ? (
                  <p>Carregando freelancers aprovados...</p>
                ) : approvedFreelancers.length === 0 ? (
                  <p>Nenhum freelancer aprovado ainda.</p>
                ) : (
                  <div className="space-y-4">
                  {approvedFreelancers.map((freelancer) => (
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
                          Aprovado em: {new Date(freelancer.submittedAt).toLocaleDateString()} {/* Idealmente teria um campo 'approved_at' */}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDetailModal(freelancer)}
                          className="mr-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteApprovedFreelancer(freelancer.id, freelancer.name, freelancer.photo_url)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adminUsers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários Administrativos</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova usuários com acesso ao painel administrativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button onClick={() => setIsAddAdminModalOpen(true)}>
                    Adicionar Novo Usuário Admin
                  </Button>
                </div>

                {loadingAdminUsers ? (
                  <p>Carregando usuários administrativos...</p>
                ) : adminUsers.length === 0 ? (
                  <p>Nenhum usuário administrativo encontrado.</p>
                ) : (
                  <div className="space-y-3">
                    {adminUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            Registrado em: {new Date(user.created_at!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditAdminModal(user)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAdminUser(user.id, user.email)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contatos Recentes</CardTitle>
                <CardDescription>
                  Últimas solicitações de contato recebidas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingContacts ? (
                  <p>Carregando contatos...</p>
                ) : recentContacts.length === 0 ? (
                  <p>Nenhum contato recente.</p>
                ) : (
                  <div className="space-y-4">
                    {recentContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm">De: {contact.contractor_name} ({contact.contractor_email})</h4>
                          </div>
                          <p className="text-sm">Para Freelancer: <span className="font-semibold">{contact.freelancer_name}</span></p>
                          <p className="text-sm text-gray-700">Projeto/Motivo: {contact.project_description || 'Não especificado'}</p>
                          <p className="text-xs text-gray-500">
                            Recebido em: {new Date(contact.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={contact.status === 'read' ? 'default' : 'secondary'} // Exemplo de status
                          >
                            {contact.status || 'Pendente'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenContactDetailModal(contact)}
                            className="mr-2"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteContact(contact.id, contact.contractor_name)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Plataforma</CardTitle>
                <CardDescription>
                  Gerencie mensagens e avisos da plataforma.
                </CardDescription>
              </CardHeader>
              {loadingSettings ? (
                <CardContent><p>Carregando configurações...</p></CardContent>
              ) : (
                <CardContent className="space-y-8">
                  <div>
                    <Label htmlFor={PLATFORM_SETTINGS_KEYS.POST_REGISTRATION_MSG} className="text-base font-semibold">Mensagem Pós-Cadastro de Freelancer</Label>
                    <Textarea
                      id={PLATFORM_SETTINGS_KEYS.POST_REGISTRATION_MSG}
                      value={settingsInputs[PLATFORM_SETTINGS_KEYS.POST_REGISTRATION_MSG] || ''}
                      onChange={(e) => handleSettingInputChange(PLATFORM_SETTINGS_KEYS.POST_REGISTRATION_MSG, e.target.value)}
                      placeholder="Ex: Seu cadastro foi recebido! Em breve entraremos em contato."
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Esta mensagem será exibida ao freelancer após ele completar o cadastro.</p>
                  </div>

                  <div>
                    <Label htmlFor={PLATFORM_SETTINGS_KEYS.POST_CONTACT_MSG} className="text-base font-semibold">Mensagem Pós-Envio de Contato (para Freelancer)</Label>
                    <Textarea
                      id={PLATFORM_SETTINGS_KEYS.POST_CONTACT_MSG}
                      value={settingsInputs[PLATFORM_SETTINGS_KEYS.POST_CONTACT_MSG] || ''}
                      onChange={(e) => handleSettingInputChange(PLATFORM_SETTINGS_KEYS.POST_CONTACT_MSG, e.target.value)}
                      placeholder="Ex: Sua mensagem foi enviada com sucesso para o freelancer!"
                      className="mt-1"
                      rows={3}
                    />
                     <p className="text-xs text-muted-foreground mt-1">Esta mensagem será exibida ao usuário após ele enviar um contato para um freelancer.</p>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-base font-semibold mb-2">Aviso na Página Principal</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_TITLE}>Título do Aviso</Label>
                        <Input
                          id={PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_TITLE}
                          value={settingsInputs[PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_TITLE] || ''}
                          onChange={(e) => handleSettingInputChange(PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_TITLE, e.target.value)}
                          placeholder="Ex: Manutenção Programada"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_MESSAGE}>Conteúdo do Aviso</Label>
                        <Textarea
                          id={PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_MESSAGE}
                          value={settingsInputs[PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_MESSAGE] || ''}
                          onChange={(e) => handleSettingInputChange(PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_MESSAGE, e.target.value)}
                          placeholder="Ex: A plataforma passará por uma manutenção no dia X das Y às Z."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_VISIBLE}
                          checked={settingsInputs[PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_VISIBLE] === 'true'}
                          onCheckedChange={(checked) => handleToggleSettingChange(PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_VISIBLE, checked)}
                        />
                        <Label htmlFor={PLATFORM_SETTINGS_KEYS.HOME_PAGE_ALERT_VISIBLE}>Exibir Aviso na Página Principal</Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSavePlatformSettings}
                    disabled={isSubmittingSettings}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmittingSettings ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </CardContent>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <FreelancerDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        freelancer={selectedFreelancer}
      />
      <AddAdminUserModal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        onUserAdded={() => {
          fetchAdminUsersData(); // Atualiza a lista após adicionar
          setIsAddAdminModalOpen(false);
        }}
      />
      <EditAdminUserModal
        isOpen={isEditAdminModalOpen}
        onClose={() => {
          setIsEditAdminModalOpen(false);
          setSelectedAdminUserToEdit(null);
        }}
        user={selectedAdminUserToEdit}
        onUserUpdated={() => {
          fetchAdminUsersData(); // Atualiza a lista após editar
          setIsEditAdminModalOpen(false);
          setSelectedAdminUserToEdit(null);
        }}
      />
      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={handleCloseAddJobModal}
        onJobAdded={() => {
          fetchJobsData();
          handleCloseAddJobModal();
        }}
      />
      <EditJobModal
        isOpen={isEditJobModalOpen}
        onClose={handleCloseEditJobModal}
        job={selectedJobToEdit}
        onJobUpdated={() => {
          fetchJobsData();
          handleCloseEditJobModal();
        }}
      />
      <AddSponsorModal
        isOpen={isAddSponsorModalOpen}
        onClose={handleCloseAddSponsorModal}
        onSponsorAdded={() => {
          fetchSponsorsData();
          handleCloseAddSponsorModal();
        }}
      />
      <EditSponsorModal
        isOpen={isEditSponsorModalOpen}
        onClose={handleCloseEditSponsorModal}
        sponsor={selectedSponsorToEdit}
        onSponsorUpdated={() => {
          fetchSponsorsData();
          handleCloseEditSponsorModal();
        }}
      />
      <ContactDetailModal
        isOpen={isContactDetailModalOpen}
        onClose={handleCloseContactDetailModal}
        contact={selectedContactToView}
      />
    </div>
  );
};

export default Admin;
