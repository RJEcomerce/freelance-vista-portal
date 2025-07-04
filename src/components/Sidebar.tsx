
import { MapPin, Briefcase, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sidebar = () => {
  const [sponsors, setSponsors] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchSponsors();
    fetchJobs();
  }, []);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('active', true);
      
      if (error) {
        console.error('Erro ao buscar patrocinadores:', error);
        return;
      }

      setSponsors(data || []);
    } catch (error) {
      console.error('Erro ao buscar patrocinadores:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('active', true);
      
      if (error) {
        console.error('Erro ao buscar vagas:', error);
        return;
      }

      setJobs(data || []);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  return (
    <div className="w-full bg-gray-50 p-6 space-y-8">
      {/* Patrocinadores */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          Patrocinadores
        </h3>
        <div className="space-y-4">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-2xl">{sponsor.logo}</div>
              <div>
                <div className="font-medium text-gray-900">{sponsor.name}</div>
                <div className="text-sm text-gray-600">{sponsor.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vagas em Destaque */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
          Vagas em Destaque
        </h3>
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="font-medium text-gray-900">{job.title}</div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <div className="text-sm font-medium text-green-600 mt-1">{job.budget}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Avisos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📢 Avisos</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <p>• Novos freelancers cadastrados esta semana: 15</p>
          <p>• Projetos concluídos no mês: 142</p>
          <p>• Próxima manutenção: 15/07 às 02:00</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
