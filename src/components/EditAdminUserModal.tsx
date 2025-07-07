import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: number;
  email: string;
  created_at?: string;
}

interface EditAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onUserUpdated: () => void;
}

const EditAdminUserModal: React.FC<EditAdminUserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setNewPassword(''); // Limpar campo de senha ao abrir/mudar usuário
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!email) {
      toast({ title: "Erro", description: "Email é obrigatório.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const updateData: { email: string; password_hash?: string } = { email: email };

      if (newPassword) {
        // !!! ALERTA DE SEGURANÇA !!!
        // A senha está sendo atualizada em texto plano.
        // Idealmente, use uma Supabase Edge Function para hashear a senha antes de atualizar.
        updateData.password_hash = newPassword;
        toast({ title: "Alerta de Segurança", description: "Senha atualizada em texto plano (INSEGURO).", variant: "destructive", duration: 10000 });
      }

      const { error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({ title: "Sucesso", description: "Usuário administrativo atualizado." });
      onUserUpdated();
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar usuário admin:", error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário Admin</DialogTitle>
          <DialogDescription>
            Altere o email ou defina uma nova senha para o administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email-admin" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email-admin"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password-admin" className="text-right">
                Nova Senha
              </Label>
              <Input
                id="edit-password-admin"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-3"
                placeholder="Deixe em branco para não alterar"
              />
            </div>
            {newPassword && (
              <p className="text-xs text-orange-600 col-span-4 px-2 py-1 bg-orange-50 border border-orange-200 rounded">
                <strong>Alerta de Segurança:</strong> A nova senha será armazenada em texto plano. Esta funcionalidade é apenas para prototipagem e é insegura para produção.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Atualizando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdminUserModal;
