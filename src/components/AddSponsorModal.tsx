import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';

interface AddSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSponsorAdded: () => void;
}

const AddSponsorModal: React.FC<AddSponsorModalProps> = ({ isOpen, onClose, onSponsorAdded }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Arquivo inválido", description: "Por favor, selecione uma imagem.", variant: "destructive" });
        setLogoFile(null);
        setLogoPreview(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB
        toast({ title: "Arquivo muito grande", description: "A imagem deve ter no máximo 2MB.", variant: "destructive" });
        setLogoFile(null);
        setLogoPreview(null);
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logoFile) {
      toast({ title: "Erro", description: "Nome e Logo são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    let logoUrl = '';

    try {
      // 1. Upload da logo
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`; // Salvar na raiz do bucket 'sponsor-logos'

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('sponsor-logos') // Nome do Bucket no Supabase Storage
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      // Obter URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('sponsor-logos')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Não foi possível obter a URL pública da logo.");
      }
      logoUrl = publicUrlData.publicUrl;

      // 2. Inserir dados do sponsor no banco
      const { error: insertError } = await supabase
        .from('sponsors')
        .insert({
          name,
          description: description || null,
          logo: logoUrl,
          active
        });

      if (insertError) throw insertError;

      toast({ title: "Sucesso", description: "Novo patrocinador adicionado." });
      onSponsorAdded();
      onClose();
    } catch (error: any) {
      console.error("Erro ao adicionar patrocinador:", error);
      toast({
        title: "Erro ao adicionar patrocinador",
        description: error.message || "Não foi possível adicionar o patrocinador.",
        variant: "destructive",
      });
      // Se o upload da imagem falhou mas a URL já foi atribuida e o insert no DB falhou por outro motivo,
      // a imagem pode ter ficado órfã no storage. Uma lógica de cleanup poderia ser adicionada aqui se necessário.
    } finally {
      setIsSubmitting(false);
      // Resetar campos
      setName('');
      setDescription('');
      setActive(true);
      setLogoFile(null);
      setLogoPreview(null);
      // Limpar o input file explicitamente se necessário (pode ser complexo de forma cross-browser)
      // e.target.reset() não funciona diretamente aqui pois o form é externo ao input file no DOM virtual
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Patrocinador</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do novo patrocinador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sponsor-name" className="text-right">Nome*</Label>
              <Input id="sponsor-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="sponsor-logo" className="text-right pt-1">Logo*</Label>
              <div className="col-span-3">
                <Input id="sponsor-logo" type="file" accept="image/*" onChange={handleFileChange} className="mb-2" required />
                {logoPreview && <img src={logoPreview} alt="Preview da Logo" className="w-32 h-32 object-contain border rounded"/>}
                <p className="text-xs text-gray-500 mt-1">Max 2MB. JPG, PNG, GIF.</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="sponsor-description" className="text-right pt-1">Descrição</Label>
              <Textarea id="sponsor-description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sponsor-active" className="text-right">Ativo</Label>
              <div className="col-span-3 flex items-center">
                <Switch id="sponsor-active" checked={active} onCheckedChange={setActive} />
                <span className="ml-2 text-sm text-muted-foreground">{active ? "Sim" : "Não"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar Patrocinador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSponsorModal;
