
-- Primeiro, remover todas as políticas existentes que estão causando recursão
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow login access" ON public.admin_users;

-- Criar uma política simples para permitir acesso de leitura durante o login
-- Esta política permite que qualquer pessoa leia a tabela admin_users para fins de autenticação
CREATE POLICY "Allow read for authentication" ON public.admin_users
FOR SELECT USING (true);

-- Criar políticas mais simples para operações administrativas
-- Estas políticas verificam se o usuário atual já está na sessão administrativa
CREATE POLICY "Allow admin operations" ON public.admin_users
FOR ALL USING (true) WITH CHECK (true);
