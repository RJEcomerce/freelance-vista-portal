import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Sponsor {
  id: string;
  name: string;
  description: string;
  logo: string; // URL da imagem
  active: boolean | null;
}

interface EditSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: Sponsor | null;
  onSponsorUpdated: () => void;
}

const EditSponsorModal: React.FC<EditSponsorModalProps> = ({ isOpen, onClose, sponsor, onSponsorUpdated }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sponsor) {
      setName(sponsor.name);
      setDescription(sponsor.description || '');
      setActive(sponsor.active === null ? true : sponsor.active);
      setCurrentLogoUrl(sponsor.logo);
      setLogoPreview(sponsor.logo); // Mostrar logo atual no preview inicial
      setLogoFile(null); // Limpar seleção de arquivo anterior
    }
  }, [sponsor]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Arquivo inválido", description: "Por favor, selecione uma imagem.", variant: "destructive" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "Arquivo muito grande", description: "A imagem deve ter no máximo 2MB.", variant: "destructive" });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Se o usuário cancelar a seleção de arquivo, reverter para a logo atual se existir
      setLogoFile(null);
      setLogoPreview(currentLogoUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsor) return;
    if (!name) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    let updatedLogoUrl = sponsor.logo; // Manter a logo atual por padrão

    try {
      // 1. Se uma nova logo foi fornecida, fazer upload e deletar a antiga
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('sponsor-logos')
          .upload(filePath, logoFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('sponsor-logos').getPublicUrl(filePath);
        if (!publicUrlData?.publicUrl) throw new Error("Não foi possível obter a URL pública da nova logo.");
        updatedLogoUrl = publicUrlData.publicUrl;

        // Deletar logo antiga do storage, se existir e for diferente da nova
        if (currentLogoUrl && currentLogoUrl !== updatedLogoUrl) {
          const oldLogoPath = currentLogoUrl.substring(currentLogoUrl.indexOf('/sponsor-logos/') + '/sponsor-logos/'.length);
          if (oldLogoPath) {
            await supabase.storage.from('sponsor-logos').remove([oldLogoPath]);
          }
        }
      }

      // 2. Atualizar dados do sponsor no banco
      const { error: updateError } = await supabase
        .from('sponsors')
        .update({
          name,
          description: description || null,
          logo: updatedLogoUrl,
          active
        })
        .eq('id', sponsor.id);

      if (updateError) throw updateError;

      toast({ title: "Sucesso", description: "Patrocinador atualizado." });
      onSponsorUpdated();
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar patrocinador:", error);
      toast({
        title: "Erro ao atualizar patrocinador",
        description: error.message || "Não foi possível atualizar o patrocinador.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sponsor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Patrocinador</DialogTitle>
          <DialogDescription>Modifique os detalhes do patrocinador.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sponsor-name" className="text-right">Nome*</Label>
              <Input id="edit-sponsor-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-sponsor-logo" className="text-right pt-1">Logo</Label>
              <div className="col-span-3">
                <Input id="edit-sponsor-logo" type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
                {logoPreview && <img src={logoPreview} alt="Preview da Logo" className="w-32 h-32 object-contain border rounded"/>}
                <p className="text-xs text-gray-500 mt-1">Max 2MB. Deixe em branco para manter a logo atual.</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-sponsor-description" className="text-right pt-1">Descrição</Label>
              <Textarea id="edit-sponsor-description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sponsor-active" className="text-right">Ativo</Label>
              <div className="col-span-3 flex items-center">
                <Switch id="edit-sponsor-active" checked={active} onCheckedChange={setActive} />
                <span className="ml-2 text-sm text-muted-foreground">{active ? "Sim" : "Não"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSponsorModal;
