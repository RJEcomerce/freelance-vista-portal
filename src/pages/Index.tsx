
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FreelancerCard from '@/components/FreelancerCard';
import ContactModal from '@/components/ContactModal';
import FilterBar from '@/components/FilterBar';

const Index = () => {
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    experience: '',
    gender: ''
  });

  // Mock data - em produção viria do Supabase
  const freelancers = [
    {
      id: '1',
      name: 'Ana Silva',
      age: 28,
      region: 'São Paulo',
      experiences: ['Desenvolvimento Web', 'React', 'Node.js'],
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      email: 'ana.silva@email.com',
      phone: '(11) 99999-9999',
      gender: 'Feminino'
    },
    {
      id: '2',
      name: 'Carlos Oliveira',
      age: 32,
      region: 'Rio de Janeiro',
      experiences: ['Design Gráfico', 'UI/UX', 'Branding'],
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      email: 'carlos.oliveira@email.com',
      phone: '(21) 88888-8888',
      gender: 'Masculino'
    },
    {
      id: '3',
      name: 'Mariana Costa',
      age: 26,
      region: 'Belo Horizonte',
      experiences: ['Marketing Digital', 'SEO', 'Google Ads'],
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      email: 'mariana.costa@email.com',
      phone: '(31) 77777-7777',
      gender: 'Feminino'
    },
    {
      id: '4',
      name: 'Pedro Santos',
      age: 35,
      region: 'Brasília',
      experiences: ['Consultoria', 'Gestão de Projetos', 'Scrum'],
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      email: 'pedro.santos@email.com',
      phone: '(61) 66666-6666',
      gender: 'Masculino'
    },
    {
      id: '5',
      name: 'Julia Fernandes',
      age: 29,
      region: 'Salvador',
      experiences: ['Redação', 'Copywriting', 'Content Marketing'],
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      email: 'julia.fernandes@email.com',
      phone: '(71) 55555-5555',
      gender: 'Feminino'
    },
    {
      id: '6',
      name: 'Roberto Lima',
      age: 41,
      region: 'Recife',
      experiences: ['Fotografia', 'Edição de Vídeo', 'Produção Audiovisual'],
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      email: 'roberto.lima@email.com',
      phone: '(81) 44444-4444',
      gender: 'Masculino'
    }
  ];

  const filteredFreelancers = freelancers.filter(freelancer => {
    if (filters.region && freelancer.region !== filters.region) return false;
    if (filters.experience && !freelancer.experiences.some(exp => exp.includes(filters.experience))) return false;
    if (filters.gender && freelancer.gender !== filters.gender) return false;
    return true;
  });

  const handleContact = (freelancer: any) => {
    setSelectedFreelancer(freelancer);
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
    setSelectedFreelancer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - 1/3 */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          
          {/* Main Content - 2/3 */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Encontre o Freelancer Ideal
              </h1>
              <p className="text-gray-600">
                Conecte-se com profissionais qualificados para seus projetos
              </p>
            </div>
            
            <FilterBar onFilterChange={setFilters} />
            
            <div className="space-y-6">
              {filteredFreelancers.length > 0 ? (
                filteredFreelancers.map(freelancer => (
                  <FreelancerCard
                    key={freelancer.id}
                    freelancer={freelancer}
                    onContact={handleContact}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Nenhum freelancer encontrado com os filtros selecionados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={handleCloseModal}
        freelancer={selectedFreelancer}
      />
    </div>
  );
};

export default Index;
