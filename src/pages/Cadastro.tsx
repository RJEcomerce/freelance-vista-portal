
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, AlertCircle, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    availability: '',
    acceptTerms: false,
    // Adicionar estado e cidade para o novo fluxo de região
    selectedState: '',
    selectedCity: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para popular os selects de Estado e Cidade
  const [states, setStates] = useState<{ id: number; sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);


  // const regions = [ // Removido, será substituído pela lógica de estado/cidade
  //   'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília',
  //   'Salvador', 'Recife', 'Porto Alegre', 'Curitiba', 'Fortaleza',
  //   'Manaus', 'Goiânia', 'Campo Grande'
  // ];

  const genders = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];

  // Fetch Estados (UFs) from IBGE API
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        if (!response.ok) {
          throw new Error('Falha ao buscar estados');
        }
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
        toast({ title: "Erro", description: "Não foi possível carregar a lista de estados.", variant: "destructive" });
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [toast]);

  // Fetch Cidades when selectedState changes
  useEffect(() => {
    if (formData.selectedState) {
      const fetchCities = async () => {
        setLoadingCities(true);
        setCities([]); // Limpar cidades anteriores
        handleSelectChange('selectedCity', ''); // Limpar cidade selecionada no form
        try {
          const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.selectedState}/municipios?orderBy=nome`);
          if (!response.ok) {
            throw new Error('Falha ao buscar cidades');
          }
          const data = await response.json();
          setCities(data);
        } catch (error) {
          console.error("Erro ao buscar cidades:", error);
          toast({ title: "Erro", description: "Não foi possível carregar a lista de cidades para o estado selecionado.", variant: "destructive" });
        } finally {
          setLoadingCities(false);
        }
      };
      fetchCities();
    } else {
      setCities([]); // Limpar cidades se nenhum estado estiver selecionado
      handleSelectChange('selectedCity', '');
    }
  }, [formData.selectedState, toast]);


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

    setIsSubmitting(true);

    try {
      let photo_url = null;

      // Upload da foto se existir
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          throw uploadError;
        }

        // Obter URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
        
        photo_url = publicUrl;
      }

      // Inserir freelancer no banco
      const selectedStateObj = states.find(s => s.sigla === formData.selectedState);
      const stateName = selectedStateObj ? selectedStateObj.sigla : ''; // Usar sigla ou nome como preferir
      const cityName = formData.selectedCity;
      const fullRegion = cityName && stateName ? `${cityName} - ${stateName}` : formData.region;


      const { error } = await supabase
        .from('freelancers')
        .insert({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          gender: formData.gender || null,
          region: fullRegion, // Usar a região combinada
          experiences: formData.experiences,
          portfolio: formData.portfolio || null,
          availability: formData.availability || null,
          photo_url,
          // O campo 'approved' por padrão será null ou false, dependendo da config do DB
          // created_at e updated_at são gerenciados pelo Supabase
        });

      if (error) {
        throw error;
      }

      // Buscar mensagem de sucesso customizada
      let successMessage = "Seu perfil foi criado e será analisado pela nossa equipe."; // Padrão
      try {
        const { data: setting, error: settingError } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'POST_REGISTRATION_MSG')
          .single();
        if (settingError) console.warn("Erro ao buscar mensagem de pós-cadastro:", settingError.message);
        if (setting && setting.value) {
          successMessage = setting.value;
        }
      } catch (e) { console.warn("Exceção ao buscar msg pós-cadastro:", e); }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: successMessage,
      });

      // Redirect to home after success
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao realizar o cadastro.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive"
        });
        return;
      }

      // Verificar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }

      setPhotoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
            {/* Upload de Foto */}
            <div className="mb-6">
              <Label htmlFor="photo">Foto de Perfil</Label>
              <div className="mt-2">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="photo"
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Escolher Foto</span>
                  </label>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Arquivos aceitos: JPG, PNG, GIF (máx. 5MB)
                </p>
              </div>
            </div>

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
              
              {/* Novo Select para Estado */}
              <div>
                <Label htmlFor="selectedState">Estado *</Label>
                <Select
                  value={formData.selectedState}
                  onValueChange={(value) => handleSelectChange('selectedState', value)}
                  required
                >
                  <SelectTrigger disabled={loadingStates}>
                    <SelectValue placeholder={loadingStates ? "Carregando estados..." : "Selecione o estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.sigla} value={state.sigla}>
                        {state.nome} ({state.sigla})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Novo Select para Cidade */}
              <div>
                <Label htmlFor="selectedCity">Cidade *</Label>
                <Select
                  value={formData.selectedCity}
                  onValueChange={(value) => handleSelectChange('selectedCity', value)}
                  disabled={!formData.selectedState || loadingCities || cities.length === 0}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingCities ? "Carregando cidades..." :
                      !formData.selectedState ? "Selecione um estado primeiro" :
                      cities.length === 0 && !loadingCities ? "Nenhuma cidade encontrada" :
                      "Selecione a cidade"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.nome}>
                        {city.nome}
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
                disabled={!formData.acceptTerms || isSubmitting}
              >
                {isSubmitting ? 'Cadastrando...' : 'Criar Cadastro'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
