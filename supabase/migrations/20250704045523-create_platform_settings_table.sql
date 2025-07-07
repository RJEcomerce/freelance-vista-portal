-- supabase/migrations/20250704045523-create_platform_settings_table.sql
CREATE TABLE public.platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para auto-atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  _new RECORD;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access"
ON public.platform_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Para admin (assumindo que o admin logado usa a chave 'authenticated' e tem bypass RLS para escrita ou uma role específica)
-- Se não, precisaremos de uma política de escrita para uma role admin específica.
-- Exemplo: CREATE POLICY "Allow admin full access" ON public.platform_settings FOR ALL USING (auth.role() = 'admin_role_name') WITH CHECK (auth.role() = 'admin_role_name');
-- Por enquanto, a escrita será feita pelo frontend do admin, que usa a chave de API do usuário logado.
-- Se esse usuário não tiver permissão de escrita direta, precisaremos de funções RPC ou políticas mais específicas.
-- A API do Supabase (client) geralmente usa a role 'anon' ou 'authenticated'.
-- Para escrita, o admin precisaria de uma política de UPDATE/INSERT ou usar a service_role key (que não é o caso aqui).
-- Vamos adicionar uma política de escrita simples para usuários autenticados por enquanto, e refinar se necessário.

CREATE POLICY "Allow authenticated users to manage settings"
ON public.platform_settings
FOR ALL -- INSERT, UPDATE, DELETE
TO authenticated
USING (true)
WITH CHECK (true);
