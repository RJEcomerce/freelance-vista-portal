
-- Criar política para permitir que administradores vejam todos os usuários admin
CREATE POLICY "Admins can view all admin users" ON public.admin_users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = (
      SELECT username FROM public.admin_users 
      WHERE id = (
        SELECT value::uuid FROM json_each_text(
          COALESCE(current_setting('request.jwt.claims', true)::json, '{}'::json)
        ) WHERE key = 'sub'
      )
    )
  )
);

-- Criar política para permitir que administradores insiram novos usuários admin
CREATE POLICY "Admins can insert admin users" ON public.admin_users
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = (
      SELECT username FROM public.admin_users 
      WHERE id = (
        SELECT value::uuid FROM json_each_text(
          COALESCE(current_setting('request.jwt.claims', true)::json, '{}'::json)
        ) WHERE key = 'sub'
      )
    )
  )
);

-- Criar política para permitir que administradores atualizem usuários admin
CREATE POLICY "Admins can update admin users" ON public.admin_users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = (
      SELECT username FROM public.admin_users 
      WHERE id = (
        SELECT value::uuid FROM json_each_text(
          COALESCE(current_setting('request.jwt.claims', true)::json, '{}'::json)
        ) WHERE key = 'sub'
      )
    )
  )
);

-- Criar política para permitir que administradores excluam usuários admin
CREATE POLICY "Admins can delete admin users" ON public.admin_users
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = (
      SELECT username FROM public.admin_users 
      WHERE id = (
        SELECT value::uuid FROM json_each_text(
          COALESCE(current_setting('request.jwt.claims', true)::json, '{}'::json)
        ) WHERE key = 'sub'
      )
    )
  )
);

-- Criar política temporária para permitir acesso durante login (sem autenticação)
CREATE POLICY "Allow login access" ON public.admin_users
FOR SELECT USING (true);
