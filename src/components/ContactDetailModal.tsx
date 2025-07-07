import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Contact {
  id: string;
  contractor_name: string;
  contractor_email: string;
  contractor_phone: string;
  project_description: string | null;
  daily_rate: number;
  work_address: string;
  status: string | null;
  created_at: string | null;
  freelancer_id: string | null;
  freelancer_name?: string;
}

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ isOpen, onClose, contact }) => {
  if (!contact) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Contato</DialogTitle>
          <DialogDescription>
            Informações completas da solicitação de contato.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-md mb-1">Informações do Solicitante</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p><strong>Nome:</strong> {contact.contractor_name}</p>
                <p><strong>Email:</strong> {contact.contractor_email}</p>
                <p><strong>Telefone:</strong> {contact.contractor_phone}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-md mb-1 mt-3">Detalhes da Solicitação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p><strong>Para Freelancer:</strong> {contact.freelancer_name || 'N/A'}</p>
                <p><strong>Status:</strong> <Badge variant={contact.status === 'read' ? 'default' : 'secondary'}>{contact.status || 'Pendente'}</Badge></p>
                <p><strong>Data da Solicitação:</strong> {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'N/A'}</p>
                {/* Os campos daily_rate e work_address podem não ser de "contato" mas de "proposta" ou "job"
                    Verificar se eles pertencem aqui ou se vieram de um join/tipo errado.
                    Se forem de "contato inicial", podem ser relevantes.
                */}
                <p><strong>Proposta de Diária:</strong> R$ {contact.daily_rate?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}</p>
                <p className="md:col-span-2"><strong>Endereço da Obra/Projeto:</strong> {contact.work_address || 'N/A'}</p>
              </div>
            </div>

            {contact.project_description && (
              <div>
                <h4 className="font-semibold text-md mb-1 mt-3">Descrição do Projeto/Mensagem</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-md border">
                  {contact.project_description}
                </p>
              </div>
            )}

            {/* Poderia adicionar ações aqui, como "Marcar como Lido", "Responder", etc. no futuro */}

          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailModal;
