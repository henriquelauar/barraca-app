-- Barraca App - Tabelas iniciais (Etapa 1)
-- Versão simplificada para república única: Barraca Armada
-- Execute este SQL no Supabase: SQL Editor > New query

-- Limpeza opcional de políticas antigas
DROP POLICY IF EXISTS "Usuário vê repúblicas onde é morador" ON republicas;
DROP POLICY IF EXISTS "Usuário pode criar república" ON republicas;
DROP POLICY IF EXISTS "Morador vê moradores da república" ON moradores;
DROP POLICY IF EXISTS "Morador pode inserir na república" ON moradores;
DROP POLICY IF EXISTS "Morador pode atualizar próprio registro" ON moradores;
DROP POLICY IF EXISTS "Morador pode remover da república" ON moradores;

-- Remover tabela antiga de repúblicas, se existir
DROP TABLE IF EXISTS republicas CASCADE;

-- Remover tabela moradores antiga, se quiser recriar do zero
DROP TABLE IF EXISTS moradores CASCADE;

-- Moradores
-- user_id é opcional: permite cadastrar um morador mesmo que ele ainda não tenha conta
CREATE TABLE IF NOT EXISTS moradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_moradores_user_id ON moradores(user_id);
CREATE INDEX IF NOT EXISTS idx_moradores_email ON moradores(email);
CREATE INDEX IF NOT EXISTS idx_moradores_ativo ON moradores(ativo);

-- Atualização automática de atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_moradores_atualizado_em ON moradores;

CREATE TRIGGER trg_moradores_atualizado_em
BEFORE UPDATE ON moradores
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- RLS
ALTER TABLE moradores ENABLE ROW LEVEL SECURITY;

-- Política: usuário autenticado pode ver todos os moradores
CREATE POLICY "Usuário autenticado pode ver moradores"
  ON moradores
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política: usuário autenticado pode inserir moradores
CREATE POLICY "Usuário autenticado pode inserir moradores"
  ON moradores
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política: usuário autenticado pode atualizar moradores
CREATE POLICY "Usuário autenticado pode atualizar moradores"
  ON moradores
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política: usuário autenticado pode remover outros moradores
CREATE POLICY "Usuário autenticado pode remover moradores"
  ON moradores
  FOR DELETE
  USING (auth.uid() IS NOT NULL);