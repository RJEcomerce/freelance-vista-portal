
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: {
    region: string;
    experience: string;
    gender: string;
  }) => void;
}

const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [filters, setFilters] = useState({
    region: '',
    experience: '',
    gender: ''
  });

  const regions = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 
    'Salvador', 'Recife', 'Porto Alegre', 'Curitiba'
  ];

  const experiences = [
    'Desenvolvimento Web', 'Design Gráfico', 'Marketing Digital', 
    'Redação', 'Consultoria', 'Fotografia', 'Tradução'
  ];

  const genders = ['Masculino', 'Feminino', 'Outro'];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { region: '', experience: '', gender: '' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.region || filters.experience || filters.gender;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filtros:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Select value={filters.region} onValueChange={(value) => handleFilterChange('region', value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Experiência" />
            </SelectTrigger>
            <SelectContent>
              {experiences.map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Gênero" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Limpar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
