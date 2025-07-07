import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Job {
  id: string;
  title: string;
  description: string | null;
  budget: string;
  location: string;
  active: boolean | null;
  created_at?: string | null;
}

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onJobUpdated: () => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ isOpen, onClose, job, onJobUpdated }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDescription(job.description || '');
      setBudget(job.budget);
      setLocation(job.location);
      setActive(job.active === null ? true : job.active); // Default to true if null
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    if (!title || !budget || !location) {
      toast({ title: "Erro", description: "Título, Orçamento e Localização são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title,
          description: description || null,
          budget,
          location,
          active
        })
        .eq('id', job.id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Oferta de trabalho atualizada." });
      onJobUpdated();
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar oferta de trabalho:", error);
      toast({
        title: "Erro ao atualizar oferta",
        description: error.message || "Não foi possível atualizar a oferta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Oferta de Trabalho</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da oferta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-job-title" className="text-right">Título*</Label>
              <Input id="edit-job-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-job-description" className="text-right pt-1">Descrição</Label>
              <Textarea id="edit-job-description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-job-budget" className="text-right">Orçamento*</Label>
              <Input id="edit-job-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="col-span-3" placeholder="Ex: R$ 1.500,00 ou A combinar" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-job-location" className="text-right">Localização*</Label>
              <Input id="edit-job-location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" placeholder="Ex: São Paulo, SP ou Remoto" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-job-active" className="text-right">Ativa</Label>
              <div className="col-span-3 flex items-center">
                <Switch id="edit-job-active" checked={active} onCheckedChange={setActive} />
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

export default EditJobModal;
