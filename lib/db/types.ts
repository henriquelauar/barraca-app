/**
 * Tipos do banco de dados (Supabase)
 * Execute: npx supabase gen types typescript --project-id SEU_ID > lib/db/types.ts
 * para gerar tipos automaticamente após criar as tabelas.
 */

// Placeholder até as tabelas serem criadas no Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
