-- Esquema para la tabla 'cheques'
-- Ejecutar esto en el SQL Editor de Supabase

CREATE TABLE public.cheques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  banco TEXT NOT NULL,
  numero_cheque TEXT NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_pago DATE NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  notificado BOOLEAN DEFAULT false,
  fecha_vencimiento_legal DATE GENERATED ALWAYS AS (fecha_pago + interval '30 days') STORED
);

-- Habilitar RLS (Row Level Security) si es necesario, 
-- pero para este MVP podemos dejarlo público para lectura/escritura si no hay autenticación,
-- o crear políticas simples.

-- ALTER TABLE public.cheques ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Permitir todo a anon" ON public.cheques FOR ALL USING (true);
