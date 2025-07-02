
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FreelancerCard from '@/components/FreelancerCard';
import ContactModal from '@/components/ContactModal';
import FilterBar from '@/components/FilterBar';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    experience: '',
    gender: ''
  });
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancers')
        .select('*')
        .eq('approved', true);
      
      if (error) {
        console.error('Erro ao buscar freelancers:', error);
        return;
      }

      // Transformar dados para o formato esperado pelos componentes
      const formattedFreelancers = data?.map(freelancer => ({
        id: freelancer.id,
        name: freelancer.name,
        age: freelancer.age,
        region: freelancer.region,
        experiences: freelancer.experiences.split(',').map(exp => exp.trim()),
        photo: freelancer.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        email: freelancer.email,
        phone: freelancer.phone,
        gender: freelancer.gender || 'Não informado'
      })) || [];

      setFreelancers(formattedFreelancers);
    } catch (error) {
      console.error('Erro ao buscar freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data como fallback - removido da produção

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
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Carregando freelancers...</p>
                </div>
              ) : filteredFreelancers.length > 0 ? (
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
                    {freelancers.length === 0 
                      ? 'Nenhum freelancer cadastrado ainda.' 
                      : 'Nenhum freelancer encontrado com os filtros selecionados.'
                    }
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
