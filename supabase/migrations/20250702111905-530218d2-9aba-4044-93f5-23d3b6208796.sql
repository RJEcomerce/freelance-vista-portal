
-- Criar tabela para freelancers
CREATE TABLE public.freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT,
  region TEXT NOT NULL,
  experiences TEXT NOT NULL,
  portfolio TEXT,
  availability TEXT,
  photo_url TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para contatos/solicitações
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
  contractor_name TEXT NOT NULL,
  contractor_email TEXT NOT NULL,
  contractor_phone TEXT NOT NULL,
  work_address TEXT NOT NULL,
  daily_rate DECIMAL NOT NULL,
  project_description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para vagas
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  budget TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para patrocinadores
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  description TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para administradores
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados iniciais para vagas
INSERT INTO public.jobs (title, location, budget) VALUES
('Desenvolvedor React', 'São Paulo', 'R$ 300/dia'),
('Designer UX/UI', 'Rio de Janeiro', 'R$ 250/dia'),
('Redator de Conteúdo', 'Belo Horizonte', 'R$ 150/dia');

-- Inserir dados iniciais para patrocinadores
INSERT INTO public.sponsors (name, logo, description) VALUES
('TechCorp', '🏢', 'Soluções em TI'),
('DesignPro', '🎨', 'Design Gráfico'),
('WebDev', '💻', 'Desenvolvimento Web');

-- Inserir admin padrão (senha: admin123)
INSERT INTO public.admin_users (username, password_hash) VALUES
('admin', '$2b$10$rOCVZyPYZW7pxK2yWsJfDuYjvOu6HQOuqZqy9x8mDxK6fQP1HqK2m');

-- Criar bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public) VALUES 
('profile-photos', 'profile-photos', true);

-- Políticas RLS para segurança
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para freelancers (acesso público para leitura de aprovados)
CREATE POLICY "Anyone can view approved freelancers" ON public.freelancers
FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can insert freelancers" ON public.freelancers
FOR INSERT WITH CHECK (true);

-- Políticas para contatos
CREATE POLICY "Anyone can insert contacts" ON public.contacts
FOR INSERT WITH CHECK (true);

-- Políticas para vagas e patrocinadores (leitura pública)
CREATE POLICY "Anyone can view active jobs" ON public.jobs
FOR SELECT USING (active = true);

CREATE POLICY "Anyone can view active sponsors" ON public.sponsors
FOR SELECT USING (active = true);

-- Políticas para storage
CREATE POLICY "Anyone can upload profile photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can view profile photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');
