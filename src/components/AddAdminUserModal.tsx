import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void; // Callback para atualizar a lista após adição
}

const AddAdminUserModal: React.FC<AddAdminUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Erro", description: "Email e senha são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      // !!! ALERTA DE SEGURANÇA !!!
      // A senha está sendo inserida em texto plano.
      // Idealmente, use uma Supabase Edge Function para hashear a senha antes de inserir.
      const { error } = await supabase
        .from('admin_users')
        .insert({ email: email, password_hash: password }); // password_hash DEVERIA SER O HASH REAL

      if (error) {
        throw error;
      }

      toast({ title: "Sucesso", description: "Usuário administrativo adicionado." });
      onUserAdded(); // Chama o callback para atualizar a lista de usuários
      onClose(); // Fecha o modal
    } catch (error: any) {
      console.error("Erro ao adicionar usuário admin:", error);
      toast({
        title: "Erro ao adicionar usuário",
        description: error.message || "Não foi possível adicionar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário Admin</DialogTitle>
          <DialogDescription>
            Preencha o email e a senha para o novo administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-admin" className="text-right">
                Email
              </Label>
              <Input
                id="email-admin"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-admin" className="text-right">
                Senha
              </Label>
              <Input
                id="password-admin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <p className="text-xs text-orange-600 col-span-4 px-2 py-1 bg-orange-50 border border-orange-200 rounded">
              <strong>Alerta de Segurança:</strong> A senha será armazenada em texto plano. Esta funcionalidade é apenas para prototipagem e é insegura para produção.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdminUserModal;
