-- Barraca App - Tabelas iniciais (Etapa 1)
-- Execute este SQL no Supabase: SQL Editor > New query

-- República (cada moradia = 1 república)
CREATE TABLE IF NOT EXISTS republicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Moradores (usuários vinculados à república)
CREATE TABLE IF NOT EXISTS moradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  republica_id UUID REFERENCES republicas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(republica_id, email)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_moradores_republica ON moradores(republica_id);
CREATE INDEX IF NOT EXISTS idx_moradores_user ON moradores(user_id);

-- RLS (Row Level Security) - morador só vê dados da própria república
ALTER TABLE republicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE moradores ENABLE ROW LEVEL SECURITY;

-- Política: usuário vê repúblicas onde é morador
CREATE POLICY "Usuário vê repúblicas onde é morador"
  ON republicas FOR SELECT
  USING (
    id IN (SELECT republica_id FROM moradores WHERE user_id = auth.uid())
  );

-- Política: usuário autenticado pode criar república
CREATE POLICY "Usuário pode criar república"
  ON republicas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política: morador vê outros moradores da mesma república
CREATE POLICY "Morador vê moradores da república"
  ON moradores FOR SELECT
  USING (
    republica_id IN (SELECT republica_id FROM moradores WHERE user_id = auth.uid())
  );

-- Política: morador pode inserir na própria república (para convites futuros)
CREATE POLICY "Morador pode inserir na república"
  ON moradores FOR INSERT
  WITH CHECK (
    republica_id IN (SELECT republica_id FROM moradores WHERE user_id = auth.uid())
    OR NOT EXISTS (SELECT 1 FROM moradores WHERE user_id = auth.uid())
  );

-- Política: morador pode atualizar próprio registro
CREATE POLICY "Morador pode atualizar próprio registro"
  ON moradores FOR UPDATE
  USING (user_id = auth.uid());

-- Política: morador pode remover outros da mesma república (não a si mesmo)
CREATE POLICY "Morador pode remover da república"
  ON moradores FOR DELETE
  USING (
    user_id != auth.uid()
    AND republica_id IN (SELECT republica_id FROM moradores WHERE user_id = auth.uid())
  );
