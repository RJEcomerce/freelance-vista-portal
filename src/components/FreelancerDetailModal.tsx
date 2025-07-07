import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Freelancer {
  id: number;
  name: string;
  email: string;
  region: string;
  experiences: string;
  submittedAt: string;
  approved?: boolean;
  age?: number;
  phone?: string;
  gender?: string;
  portfolio?: string | null;
  availability?: string | null;
  photo_url?: string | null;
  // Adicione quaisquer outros campos que você espera do freelancer
}

interface FreelancerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancer: Freelancer | null;
}

const FreelancerDetailModal: React.FC<FreelancerDetailModalProps> = ({ isOpen, onClose, freelancer }) => {
  if (!freelancer) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Freelancer</DialogTitle>
          <DialogDescription>
            Informações completas do freelancer selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {freelancer.photo_url && (
            <div className="flex justify-center mb-4">
              <img src={freelancer.photo_url} alt={freelancer.name} className="w-32 h-32 rounded-full object-cover" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div><strong>Nome:</strong> {freelancer.name}</div>
            <div><strong>Email:</strong> {freelancer.email}</div>
            <div><strong>Telefone:</strong> {freelancer.phone || 'N/A'}</div>
            <div><strong>Região:</strong> {freelancer.region}</div>
            <div><strong>Idade:</strong> {freelancer.age || 'N/A'}</div>
            <div><strong>Gênero:</strong> {freelancer.gender || 'N/A'}</div>
            <div><strong>Disponibilidade:</strong> {freelancer.availability || 'N/A'}</div>
            <div>
              <strong>Status:</strong>{' '}
              <Badge variant={freelancer.approved ? 'default' : 'secondary'}>
                {freelancer.approved ? 'Aprovado' : 'Pendente'}
              </Badge>
            </div>
            {freelancer.portfolio && (
              <div className="col-span-2"><strong>Portfólio:</strong> <a href={freelancer.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{freelancer.portfolio}</a></div>
            )}
            <div className="col-span-2">
              <strong>Experiências:</strong>
              <p className="text-sm text-gray-700 whitespace-pre-line">{freelancer.experiences}</p>
            </div>
            <div className="col-span-2">
              <strong>Enviado em:</strong> {new Date(freelancer.submittedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreelancerDetailModal;
