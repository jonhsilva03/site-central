-- ==============================================================================
-- CENTRAL PHONES - SCHEMA COMPLETO E IDEMPOTENTE
-- Next.js + Supabase (Auth, RLS, Storage, RPCs)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE ADMINISTRADORES
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL DEFAULT 'Administrador',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS em admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. FUNÇÃO AUXILIAR DE VERIFICAÇÃO DE ADMIN (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = user_id
  );
$$;

-- Políticas de admin_users
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins podem ver admin_users" ON public.admin_users;
  CREATE POLICY "Admins podem ver admin_users"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

  DROP POLICY IF EXISTS "Admins podem gerenciar admin_users" ON public.admin_users;
  CREATE POLICY "Admins podem gerenciar admin_users"
    ON public.admin_users FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;


-- 4. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Categorias publicas para leitura" ON public.categorias;
  CREATE POLICY "Categorias publicas para leitura"
    ON public.categorias FOR SELECT
    TO anon, authenticated
    USING (ativo = true OR public.is_admin(auth.uid()));

  DROP POLICY IF EXISTS "Apenas admins alteram categorias" ON public.categorias;
  CREATE POLICY "Apenas admins alteram categorias"
    ON public.categorias FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;


-- 5. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  sku TEXT,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  preco_custo NUMERIC(12,2) DEFAULT 0.00,
  preco_venda NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  estoque_atual INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 2,
  destaque BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  foto_principal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Produtos publicos para leitura" ON public.produtos;
  CREATE POLICY "Produtos publicos para leitura"
    ON public.produtos FOR SELECT
    TO anon, authenticated
    USING (ativo = true OR public.is_admin(auth.uid()));

  DROP POLICY IF EXISTS "Apenas admins alteram produtos" ON public.produtos;
  CREATE POLICY "Apenas admins alteram produtos"
    ON public.produtos FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;


-- 6. TABELA DE IMAGENS DO PRODUTO (GALERIA)
CREATE TABLE IF NOT EXISTS public.produto_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caminho TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  is_capa BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.produto_imagens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Imagens publicas para leitura" ON public.produto_imagens;
  CREATE POLICY "Imagens publicas para leitura"
    ON public.produto_imagens FOR SELECT
    TO anon, authenticated
    USING (true);

  DROP POLICY IF EXISTS "Apenas admins alteram imagens" ON public.produto_imagens;
  CREATE POLICY "Apenas admins alteram imagens"
    ON public.produto_imagens FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;


-- 7. TABELA DE MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'devolucao')),
  quantidade INTEGER NOT NULL,
  estoque_anterior INTEGER NOT NULL,
  estoque_posterior INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  observacao TEXT,
  usuario_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Apenas admins acessam movimentacoes" ON public.movimentacoes_estoque;
  CREATE POLICY "Apenas admins acessam movimentacoes"
    ON public.movimentacoes_estoque FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;


-- 8. RPC SEGURA: movimentar_estoque
CREATE OR REPLACE FUNCTION public.movimentar_estoque(
  p_produto_id UUID,
  p_tipo TEXT,
  p_quantidade INTEGER,
  p_motivo TEXT,
  p_observacao TEXT DEFAULT NULL,
  p_usuario_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_estoque_atual INTEGER;
  v_novo_estoque INTEGER;
  v_movimentacao_id UUID;
BEGIN
  -- Validar se é admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso não autorizado. Apenas administradores podem movimentar estoque.';
  END IF;

  -- Validar quantidade
  IF p_quantidade <= 0 AND p_tipo != 'ajuste' THEN
    RAISE EXCEPTION 'A quantidade deve ser maior que zero.';
  END IF;

  -- Bloquear registro do produto para atualização segura (concorrência)
  SELECT estoque_atual INTO v_estoque_atual
  FROM public.produtos
  WHERE id = p_produto_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado.';
  END IF;

  -- Calcular novo estoque
  IF p_tipo = 'entrada' OR p_tipo = 'devolucao' THEN
    v_novo_estoque := v_estoque_atual + p_quantidade;
  ELSIF p_tipo = 'saida' THEN
    IF v_estoque_atual < p_quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente para esta saída. Estoque atual: %', v_estoque_atual;
    END IF;
    v_novo_estoque := v_estoque_atual - p_quantidade;
  ELSIF p_tipo = 'ajuste' THEN
    IF p_quantidade < 0 THEN
      RAISE EXCEPTION 'Estoque ajustado não pode ser negativo.';
    END IF;
    v_novo_estoque := p_quantidade;
  ELSE
    RAISE EXCEPTION 'Tipo de movimentação inválido. Use entrada, saida, ajuste ou devolucao.';
  END IF;

  -- Atualizar tabela de produtos
  UPDATE public.produtos
  SET estoque_atual = v_novo_estoque,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_produto_id;

  -- Registrar histórico
  INSERT INTO public.movimentacoes_estoque (
    produto_id,
    tipo,
    quantidade,
    estoque_anterior,
    estoque_posterior,
    motivo,
    observacao,
    usuario_email
  ) VALUES (
    p_produto_id,
    p_tipo,
    p_quantidade,
    v_estoque_atual,
    v_novo_estoque,
    p_motivo,
    p_observacao,
    COALESCE(p_usuario_email, (SELECT email FROM auth.users WHERE id = auth.uid()))
  ) RETURNING id INTO v_movimentacao_id;

  RETURN jsonb_build_object(
    'success', true,
    'movimentacao_id', v_movimentacao_id,
    'estoque_anterior', v_estoque_atual,
    'estoque_posterior', v_novo_estoque
  );
END;
$$;


-- 9. TABELA DE CLIENTES (PRIVADA)
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  cpf TEXT,
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Apenas admins acessam clientes" ON public.clientes;
  CREATE POLICY "Apenas admins acessam clientes"
    ON public.clientes FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;


-- 10. TABELA DE ORDENS DE SERVIÇO (PRIVADA)
CREATE SEQUENCE IF NOT EXISTS public.ordens_servico_numero_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os INTEGER UNIQUE NOT NULL DEFAULT nextval('public.ordens_servico_numero_seq'),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  tipo_aparelho TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  imei_serie TEXT,
  senha_aparelho TEXT,
  defeito_relatado TEXT NOT NULL,
  estado_fisico TEXT,
  acessorios_entregues TEXT,
  diagnostico TEXT,
  servico_realizar TEXT,
  valor_estimado NUMERIC(12,2) DEFAULT 0.00,
  valor_final NUMERIC(12,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'recebida' CHECK (
    status IN (
      'recebida',
      'em_diagnostico',
      'aguardando_aprovacao',
      'aprovada',
      'em_reparo',
      'pronta',
      'entregue',
      'cancelada'
    )
  ),
  data_entrada TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  prazo_estimado DATE,
  data_conclusao TIMESTAMPTZ,
  observacoes_internas TEXT,
  responsavel_nome TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Apenas admins acessam ordens" ON public.ordens_servico;
  CREATE POLICY "Apenas admins acessam ordens"
    ON public.ordens_servico FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;


-- 11. TABELA DE HISTÓRICO DE ORDENS DE SERVIÇO
CREATE TABLE IF NOT EXISTS public.historico_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  observacao TEXT,
  usuario_nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.historico_os ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Apenas admins acessam historico_os" ON public.historico_os;
  CREATE POLICY "Apenas admins acessam historico_os"
    ON public.historico_os FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;


-- 12. TABELA DE CONFIGURAÇÕES DO SITE
CREATE TABLE IF NOT EXISTS public.configuracoes_site (
  id TEXT PRIMARY KEY DEFAULT 'central_phones',
  nome_empresa TEXT NOT NULL DEFAULT 'Central Phones',
  logo_url TEXT,
  imagem_hero TEXT,
  texto_apresentacao TEXT DEFAULT 'A Central Phones cuida do seu celular, notebook, videogame e eletrônicos com atendimento especializado, transparência e qualidade.',
  whatsapp TEXT NOT NULL DEFAULT '5532935054792',
  instagram TEXT DEFAULT 'centralphones_sjdr',
  email TEXT DEFAULT 'contato@centralphones.com.br',
  endereco TEXT DEFAULT 'Rua Principal, Centro',
  cidade_estado TEXT DEFAULT 'São João del-Rei - MG',
  horario_funcionamento TEXT DEFAULT 'Segunda a Sexta: 08:30 às 18:00 | Sábado: 08:30 às 12:30',
  texto_sobre TEXT DEFAULT 'A Central Phones nasceu para oferecer tecnologia, assistência técnica e atendimento de qualidade em um só lugar. Nosso objetivo é resolver o problema do cliente de forma transparente, oferecendo orientação antes, durante e depois do serviço.',
  servicos_json JSONB DEFAULT '[
    {"icone": "📱", "titulo": "Troca de Tela", "descricao": "Substituição de telas quebradas ou danificadas com garantia e acabamento original."},
    {"icone": "🔋", "titulo": "Troca de Bateria", "descricao": "Recupere a autonomia e a saúde energética do seu smartphone ou notebook."},
    {"icone": "🔧", "titulo": "Reparo de Placa", "descricao": "Diagnóstico avançado e microssoldagem em placas com curto ou defeitos complexos."},
    {"icone": "💻", "titulo": "Notebooks & PCs", "descricao": "Formatação rápida, upgrades de SSD/RAM, limpeza preventiva e reparo térmico."},
    {"icone": "🎮", "titulo": "Videogames", "descricao": "Manutenção em consoles PlayStation, Xbox, Nintendo e reparos em controles."},
    {"icone": "🛠️", "titulo": "Eletrônicos em Geral", "descricao": "Manutenção preventiva e corretiva especializada para diversos eletrônicos."}
  ]'::jsonb,
  diferenciais_json JSONB DEFAULT '[
    "Atendimento especializado e transparente",
    "Orçamento prévio sem surpresas",
    "Garantia em todos os serviços executados",
    "Peças de alta qualidade e procedência"
  ]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.configuracoes_site ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Configuracoes publicas para leitura" ON public.configuracoes_site;
  CREATE POLICY "Configuracoes publicas para leitura"
    ON public.configuracoes_site FOR SELECT
    TO anon, authenticated
    USING (true);

  DROP POLICY IF EXISTS "Apenas admins alteram configuracoes" ON public.configuracoes_site;
  CREATE POLICY "Apenas admins alteram configuracoes"
    ON public.configuracoes_site FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
END $$;

-- Inserir configuração inicial se não existir
INSERT INTO public.configuracoes_site (id)
VALUES ('central_phones')
ON CONFLICT (id) DO NOTHING;


-- 13. CONFIGURAÇÃO DE STORAGE PARA BUCKET PRODUTOS
-- Nota: Caso execute via SQL editor do Supabase:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'produtos',
  'produtos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Políticas de Storage para o bucket 'produtos'
DO $$ BEGIN
  DROP POLICY IF EXISTS "Imagens de produtos sao publicas" ON storage.objects;
  CREATE POLICY "Imagens de produtos sao publicas"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'produtos');

  DROP POLICY IF EXISTS "Apenas admins fazem upload no bucket produtos" ON storage.objects;
  CREATE POLICY "Apenas admins fazem upload no bucket produtos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'produtos' AND public.is_admin(auth.uid()));

  DROP POLICY IF EXISTS "Apenas admins atualizam imagens no bucket produtos" ON storage.objects;
  CREATE POLICY "Apenas admins atualizam imagens no bucket produtos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'produtos' AND public.is_admin(auth.uid()));

  DROP POLICY IF EXISTS "Apenas admins deletam imagens no bucket produtos" ON storage.objects;
  CREATE POLICY "Apenas admins deletam imagens no bucket produtos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'produtos' AND public.is_admin(auth.uid()));
END $$;
