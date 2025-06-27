
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, AlertCircle } from 'lucide-react';

const Cadastro = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    region: '',
    experiences: '',
    portfolio: '',
    dailyRate: '',
    availability: '',
    acceptTerms: false
  });

  const regions = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 
    'Salvador', 'Recife', 'Porto Alegre', 'Curitiba', 'Fortaleza', 
    'Manaus', 'Goiânia', 'Campo Grande'
  ];

  const genders = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast({
        title: "Erro no cadastro",
        description: "Você deve aceitar os termos de responsabilidade.",
        variant: "destructive"
      });
      return;
    }

    // Simulação de envio para Supabase
    console.log('Dados do cadastro:', {
      ...formData,
      timestamp: new Date().toISOString()
    });

    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Seu perfil foi criado e será analisado pela nossa equipe.",
    });

    // Redirect to home after success
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cadastro de Freelancer
            </h1>
            <p className="text-gray-600">
              Preencha seus dados para criar seu perfil profissional
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="age">Idade *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  max="80"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="region">Região de Atuação *</Label>
                <Select value={formData.region} onValueChange={(value) => handleSelectChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua região" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="experiences">Experiências e Habilidades *</Label>
              <Textarea
                id="experiences"
                name="experiences"
                value={formData.experiences}
                onChange={handleChange}
                rows={4}
                placeholder="Descreva suas principais experiências, habilidades e áreas de atuação..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="portfolio">Portfolio/Site (opcional)</Label>
              <Input
                id="portfolio"
                name="portfolio"
                type="url"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://meuportfolio.com"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dailyRate">Valor da Diária (R$)</Label>
                <Input
                  id="dailyRate"
                  name="dailyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.dailyRate}
                  onChange={handleChange}
                  placeholder="Ex: 250.00"
                />
              </div>
              
              <div>
                <Label htmlFor="availability">Disponibilidade</Label>
                <Select value={formData.availability} onValueChange={(value) => handleSelectChange('availability', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua disponibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulltime">Tempo integral</SelectItem>
                    <SelectItem value="parttime">Meio período</SelectItem>
                    <SelectItem value="weekend">Fins de semana</SelectItem>
                    <SelectItem value="flexible">Flexível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <h4 className="font-semibold mb-2">Termo de Responsabilidade</h4>
                  <p className="mb-4">
                    Ao se cadastrar nesta plataforma, você declara que todas as informações fornecidas são verdadeiras e de sua inteira responsabilidade. O FreelanceHub atua apenas como intermediário para facilitar o contato entre freelancers e contratantes, não se responsabilizando pela veracidade das informações prestadas pelos usuários ou pelos acordos comerciais firmados entre as partes.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                      }
                    />
                    <Label htmlFor="acceptTerms" className="text-sm font-medium">
                      Aceito os termos de responsabilidade *
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!formData.acceptTerms}
              >
                Criar Cadastro
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
