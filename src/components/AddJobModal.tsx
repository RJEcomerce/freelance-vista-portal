import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch'; // Para o campo 'active'
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: () => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onJobAdded }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget || !location) {
      toast({ title: "Erro", description: "Título, Orçamento e Localização são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          title,
          description: description || null,
          budget,
          location,
          active
        });

      if (error) throw error;

      toast({ title: "Sucesso", description: "Nova oferta de trabalho adicionada." });
      onJobAdded();
      onClose();
    } catch (error: any) {
      console.error("Erro ao adicionar oferta de trabalho:", error);
      toast({
        title: "Erro ao adicionar oferta",
        description: error.message || "Não foi possível adicionar a oferta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      // Resetar campos
      setTitle('');
      setDescription('');
      setBudget('');
      setLocation('');
      setActive(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Oferta de Trabalho</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da nova oferta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="job-title" className="text-right">Título*</Label>
              <Input id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="job-description" className="text-right pt-1">Descrição</Label>
              <Textarea id="job-description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="job-budget" className="text-right">Orçamento*</Label>
              <Input id="job-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="col-span-3" placeholder="Ex: R$ 1.500,00 ou A combinar" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="job-location" className="text-right">Localização*</Label>
              <Input id="job-location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" placeholder="Ex: São Paulo, SP ou Remoto" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="job-active" className="text-right">Ativa</Label>
              <div className="col-span-3 flex items-center">
                <Switch id="job-active" checked={active} onCheckedChange={setActive} />
                <span className="ml-2 text-sm text-muted-foreground">{active ? "Sim" : "Não"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar Oferta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobModal;
