
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const ContactModal = ({ isOpen, onClose, freelancer }: ContactModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contractorName: '',
    phone: '',
    email: '',
    workAddress: '',
    dailyRate: '',
    projectDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!freelancer) return;

    setIsSubmitting(true);
    
    try {
      // Salvar contato no Supabase
      const { error } = await supabase
        .from('contacts')
        .insert({
          freelancer_id: freelancer.id,
          contractor_name: formData.contractorName,
          contractor_email: formData.email,
          contractor_phone: formData.phone,
          work_address: formData.workAddress,
          daily_rate: parseFloat(formData.dailyRate),
          project_description: formData.projectDescription || null
        });

      if (error) {
        throw error;
      }

      // Enviar email para o freelancer
      try {
        await supabase.functions.invoke('send-contact-email', {
          body: {
            freelancerEmail: freelancer.email,
            freelancerName: freelancer.name,
            contractorData: formData
          }
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não bloquear o processo se o email falhar
      }

      toast({
        title: "Solicitação enviada!",
        description: `Seu contato foi enviado para ${freelancer?.name}. Aguarde o retorno.`,
      });

      // Reset form
      setFormData({
        contractorName: '',
        phone: '',
        email: '',
        workAddress: '',
        dailyRate: '',
        projectDescription: ''
      });
      
      onClose();
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Entrar em contato com {freelancer?.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="contractorName">Nome do Contratante *</Label>
            <Input
              id="contractorName"
              name="contractorName"
              value={formData.contractorName}
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
            <Label htmlFor="workAddress">Endereço de Trabalho *</Label>
            <Input
              id="workAddress"
              name="workAddress"
              value={formData.workAddress}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="dailyRate">Valor da Diária (R$) *</Label>
            <Input
              id="dailyRate"
              name="dailyRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.dailyRate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="projectDescription">Descrição do Projeto</Label>
            <Textarea
              id="projectDescription"
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva brevemente o trabalho a ser realizado..."
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Responsabilidade:</strong> Você é responsável pela veracidade das informações prestadas neste formulário. O FreelanceHub apenas facilita o contato entre as partes.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
