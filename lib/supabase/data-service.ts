import { isSupabaseConfigured, supabase } from './client';
import {
  Categoria,
  Produto,
  ConfiguracoesSite,
  OrdemServico,
  Cliente,
  MovimentacaoEstoque,
  StatusOS,
  TipoMovimentacao,
} from './types';
import {
  INITIAL_CATEGORIAS,
  INITIAL_PRODUTOS,
  INITIAL_CONFIG,
  INITIAL_CLIENTES,
  INITIAL_ORDENS,
  INITIAL_MOVIMENTACOES,
} from './mock-data';
import { createSlug } from '../utils';

const STORAGE_KEY_PREFIX = 'central_phones_';

function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

// ----------------------------------------------------------------------------
// CONFIGURAÇÕES DO SITE
// ----------------------------------------------------------------------------

export async function getConfiguracoes(): Promise<ConfiguracoesSite> {
  let config: ConfiguracoesSite = INITIAL_CONFIG;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('configuracoes_site')
      .select('*')
      .eq('id', 'central_phones')
      .maybeSingle();

    if (!error && data) {
      config = data as ConfiguracoesSite;
    }
  } else {
    config = getLocal<ConfiguracoesSite>('config', INITIAL_CONFIG);
  }

  // Ensure default fallback if null/empty
  if (!config.logo_url) {
    config.logo_url = '/images/logo-central-phones.jpeg';
  }
  if (!config.endereco || config.endereco.includes('Gabriel Passos')) {
    config.endereco = 'Avenida Sete de Setembro, nº 153';
    config.bairro = 'Bairro Matozinhos';
    config.cidade_estado = 'São João del-Rei – MG';
    config.cep = 'CEP 36305-134';
  }

  return config;
}

export async function updateConfiguracoes(
  updates: Partial<ConfiguracoesSite>
): Promise<ConfiguracoesSite> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('configuracoes_site')
      .upsert({ id: 'central_phones', ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as ConfiguracoesSite;
  }

  const current = getLocal<ConfiguracoesSite>('config', INITIAL_CONFIG);
  const updated = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  setLocal('config', updated);
  return updated;
}

export const saveConfiguracoes = updateConfiguracoes;

// ----------------------------------------------------------------------------
// CATEGORIAS
// ----------------------------------------------------------------------------

export async function getCategorias(onlyActive = true): Promise<Categoria[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('categorias').select('*').order('nome');
    if (onlyActive) {
      query = query.eq('ativo', true);
    }
    const { data, error } = await query;
    if (!error && data) {
      return data as Categoria[];
    }
  }

  const list = getLocal<Categoria[]>('categorias', INITIAL_CATEGORIAS);
  return onlyActive ? list.filter((c) => c.ativo) : list;
}

export async function saveCategoria(
  categoria: Partial<Categoria>
): Promise<Categoria> {
  const slug = categoria.slug || createSlug(categoria.nome || 'categoria');

  if (isSupabaseConfigured && supabase) {
    if (categoria.id && !categoria.id.startsWith('cat-')) {
      const { data, error } = await supabase
        .from('categorias')
        .update({
          nome: categoria.nome,
          slug,
          descricao: categoria.descricao,
          ativo: categoria.ativo ?? true,
        })
        .eq('id', categoria.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Categoria;
    } else {
      const { data, error } = await supabase
        .from('categorias')
        .insert({
          nome: categoria.nome,
          slug,
          descricao: categoria.descricao,
          ativo: categoria.ativo ?? true,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Categoria;
    }
  }

  const list = getLocal<Categoria[]>('categorias', INITIAL_CATEGORIAS);
  if (categoria.id) {
    const idx = list.findIndex((c) => c.id === categoria.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...categoria, slug } as Categoria;
      setLocal('categorias', list);
      return list[idx];
    }
  }

  const newCat: Categoria = {
    id: `cat-${Date.now()}`,
    nome: categoria.nome || '',
    slug,
    descricao: categoria.descricao || null,
    ativo: categoria.ativo ?? true,
    created_at: new Date().toISOString(),
  };
  list.push(newCat);
  setLocal('categorias', list);
  return newCat;
}

export async function deleteCategoria(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }

  const list = getLocal<Categoria[]>('categorias', INITIAL_CATEGORIAS);
  const filtered = list.filter((c) => c.id !== id);
  setLocal('categorias', filtered);
}

// ----------------------------------------------------------------------------
// PRODUTOS
// ----------------------------------------------------------------------------

export async function getProdutos(params?: {
  categoriaSlug?: string;
  categoriaId?: string;
  search?: string;
  onlyActive?: boolean;
  destaqueOnly?: boolean;
  inStockOnly?: boolean;
}): Promise<Produto[]> {
  const onlyActive = params?.onlyActive ?? true;

  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('produtos')
      .select('*, categoria:categorias(*), imagens:produto_imagens(*)')
      .order('created_at', { ascending: false });

    if (onlyActive) {
      query = query.eq('ativo', true);
    }
    if (params?.destaqueOnly) {
      query = query.eq('destaque', true);
    }
    if (params?.inStockOnly) {
      query = query.gt('estoque_atual', 0);
    }
    if (params?.categoriaId) {
      query = query.eq('categoria_id', params.categoriaId);
    }

    const { data, error } = await query;
    if (!error && data) {
      let results = data as Produto[];
      if (params?.categoriaSlug) {
        results = results.filter((p) => p.categoria?.slug === params.categoriaSlug);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        results = results.filter(
          (p) =>
            p.nome.toLowerCase().includes(s) ||
            p.marca?.toLowerCase().includes(s) ||
            p.modelo?.toLowerCase().includes(s) ||
            p.sku?.toLowerCase().includes(s) ||
            p.descricao?.toLowerCase().includes(s)
        );
      }
      return results;
    }
  }

  let list = getLocal<Produto[]>('produtos', INITIAL_PRODUTOS);
  const cats = getLocal<Categoria[]>('categorias', INITIAL_CATEGORIAS);

  list = list.map((p) => ({
    ...p,
    categoria: cats.find((c) => c.id === p.categoria_id) || null,
  }));

  if (onlyActive) {
    list = list.filter((p) => p.ativo);
  }
  if (params?.destaqueOnly) {
    list = list.filter((p) => p.destaque);
  }
  if (params?.inStockOnly) {
    list = list.filter((p) => p.estoque_atual > 0);
  }
  if (params?.categoriaId) {
    list = list.filter((p) => p.categoria_id === params.categoriaId);
  }
  if (params?.categoriaSlug) {
    list = list.filter((p) => p.categoria?.slug === params.categoriaSlug);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.nome.toLowerCase().includes(s) ||
        p.marca?.toLowerCase().includes(s) ||
        p.modelo?.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s) ||
        p.descricao?.toLowerCase().includes(s)
    );
  }

  return list;
}

export async function getProdutoBySlug(slug: string): Promise<Produto | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, categoria:categorias(*), imagens:produto_imagens(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      return data as Produto;
    }
  }

  const list = await getProdutos({ onlyActive: false });
  return list.find((p) => p.slug === slug) || null;
}

export async function getProdutoById(id: string): Promise<Produto | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, categoria:categorias(*), imagens:produto_imagens(*)')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return data as Produto;
    }
  }

  const list = await getProdutos({ onlyActive: false });
  return list.find((p) => p.id === id) || null;
}

export async function saveProduto(
  produto: Partial<Produto> & { imagens_novas?: { url: string; caminho: string; is_capa: boolean }[] }
): Promise<Produto> {
  const slug = produto.slug || createSlug(produto.nome || 'produto');

  if (isSupabaseConfigured && supabase) {
    const payload = {
      categoria_id: produto.categoria_id || null,
      nome: produto.nome!,
      marca: produto.marca || null,
      modelo: produto.modelo || null,
      sku: produto.sku || null,
      slug,
      descricao: produto.descricao || null,
      preco_custo: Number(produto.preco_custo || 0),
      preco_venda: Number(produto.preco_venda || 0),
      estoque_minimo: Number(produto.estoque_minimo || 2),
      destaque: Boolean(produto.destaque),
      ativo: produto.ativo !== undefined ? Boolean(produto.ativo) : true,
      foto_principal: produto.foto_principal || null,
      updated_at: new Date().toISOString(),
    };

    let savedProd: Produto;

    if (produto.id && !produto.id.startsWith('prod-')) {
      const { data, error } = await supabase
        .from('produtos')
        .update(payload)
        .eq('id', produto.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      savedProd = data as Produto;
    } else {
      const { data, error } = await supabase
        .from('produtos')
        .insert({ ...payload, estoque_atual: 0 })
        .select()
        .single();
      if (error) throw new Error(error.message);
      savedProd = data as Produto;
    }

    // Salvar imagens novas se houver
    if (produto.imagens_novas && produto.imagens_novas.length > 0) {
      const imgPayloads = produto.imagens_novas.map((img, idx) => ({
        produto_id: savedProd.id,
        url: img.url,
        caminho: img.caminho,
        ordem: idx,
        is_capa: img.is_capa,
      }));
      await supabase.from('produto_imagens').insert(imgPayloads);
    }

    return savedProd;
  }

  const list = getLocal<Produto[]>('produtos', INITIAL_PRODUTOS);
  const now = new Date().toISOString();

  if (produto.id) {
    const idx = list.findIndex((p) => p.id === produto.id);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...produto,
        slug,
        updated_at: now,
      } as Produto;
      setLocal('produtos', list);
      return list[idx];
    }
  }

  const newProd: Produto = {
    id: `prod-${Date.now()}`,
    categoria_id: produto.categoria_id || null,
    nome: produto.nome || '',
    marca: produto.marca || null,
    modelo: produto.modelo || null,
    sku: produto.sku || null,
    slug,
    descricao: produto.descricao || null,
    preco_custo: Number(produto.preco_custo || 0),
    preco_venda: Number(produto.preco_venda || 0),
    estoque_atual: 0,
    estoque_minimo: Number(produto.estoque_minimo || 2),
    destaque: Boolean(produto.destaque),
    ativo: produto.ativo !== undefined ? Boolean(produto.ativo) : true,
    foto_principal: produto.foto_principal || null,
    created_at: now,
    updated_at: now,
  };
  list.unshift(newProd);
  setLocal('produtos', list);
  return newProd;
}

export async function deleteProduto(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }

  const list = getLocal<Produto[]>('produtos', INITIAL_PRODUTOS);
  setLocal('produtos', list.filter((p) => p.id !== id));
}

// ----------------------------------------------------------------------------
// ESTOQUE & MOVIMENTAÇÕES
// ----------------------------------------------------------------------------

export async function movimentarEstoque(params: {
  produto_id: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo: string;
  observacao?: string;
  usuario_email?: string;
}): Promise<{ estoque_anterior: number; estoque_posterior: number }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.rpc('movimentar_estoque', {
      p_produto_id: params.produto_id,
      p_tipo: params.tipo,
      p_quantidade: params.quantidade,
      p_motivo: params.motivo,
      p_observacao: params.observacao || null,
      p_usuario_email: params.usuario_email || null,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  const produtos = getLocal<Produto[]>('produtos', INITIAL_PRODUTOS);
  const movs = getLocal<MovimentacaoEstoque[]>('movimentacoes', INITIAL_MOVIMENTACOES);

  const prodIdx = produtos.findIndex((p) => p.id === params.produto_id);
  if (prodIdx === -1) throw new Error('Produto não encontrado.');

  const prod = produtos[prodIdx];
  const anterior = prod.estoque_atual;
  let posterior = anterior;

  if (params.tipo === 'entrada' || params.tipo === 'devolucao') {
    posterior = anterior + params.quantidade;
  } else if (params.tipo === 'saida') {
    if (anterior < params.quantidade) {
      throw new Error(`Estoque insuficiente. Estoque atual: ${anterior}`);
    }
    posterior = anterior - params.quantidade;
  } else if (params.tipo === 'ajuste') {
    if (params.quantidade < 0) {
      throw new Error('Estoque ajustado não pode ser negativo.');
    }
    posterior = params.quantidade;
  }

  produtos[prodIdx].estoque_atual = posterior;
  produtos[prodIdx].updated_at = new Date().toISOString();
  setLocal('produtos', produtos);

  const novaMov: MovimentacaoEstoque = {
    id: `mov-${Date.now()}`,
    produto_id: params.produto_id,
    tipo: params.tipo,
    quantidade: params.quantidade,
    estoque_anterior: anterior,
    estoque_posterior: posterior,
    motivo: params.motivo,
    observacao: params.observacao || null,
    usuario_email: params.usuario_email || 'admin@centralphones.com.br',
    created_at: new Date().toISOString(),
  };
  movs.unshift(novaMov);
  setLocal('movimentacoes', movs);

  return { estoque_anterior: anterior, estoque_posterior: posterior };
}

export async function getMovimentacoes(): Promise<MovimentacaoEstoque[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*, produto:produtos(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as MovimentacaoEstoque[];
    }
  }

  const movs = getLocal<MovimentacaoEstoque[]>('movimentacoes', INITIAL_MOVIMENTACOES);
  const prods = getLocal<Produto[]>('produtos', INITIAL_PRODUTOS);

  return movs.map((m) => ({
    ...m,
    produto: prods.find((p) => p.id === m.produto_id) || null,
  }));
}

// ----------------------------------------------------------------------------
// CLIENTES
// ----------------------------------------------------------------------------

export async function getClientes(search?: string): Promise<Cliente[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('clientes').select('*').order('nome');
    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (!error && data) return data as Cliente[];
  }

  let list = getLocal<Cliente[]>('clientes', INITIAL_CLIENTES);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.nome.toLowerCase().includes(s) ||
        (c.telefone && c.telefone.includes(s)) ||
        (c.whatsapp && c.whatsapp.includes(s)) ||
        (c.cpf && c.cpf.includes(s))
    );
  }
  return list;
}

export async function saveCliente(cliente: Partial<Cliente>): Promise<Cliente> {
  if (isSupabaseConfigured && supabase) {
    if (cliente.id && !cliente.id.startsWith('cli-')) {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          nome: cliente.nome,
          telefone: cliente.telefone,
          whatsapp: cliente.whatsapp,
          email: cliente.email || null,
          cpf: cliente.cpf || null,
          endereco: cliente.endereco || null,
          observacoes: cliente.observacoes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cliente.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Cliente;
    } else {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          nome: cliente.nome,
          telefone: cliente.telefone,
          whatsapp: cliente.whatsapp,
          email: cliente.email || null,
          cpf: cliente.cpf || null,
          endereco: cliente.endereco || null,
          observacoes: cliente.observacoes || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Cliente;
    }
  }

  const list = getLocal<Cliente[]>('clientes', INITIAL_CLIENTES);
  const now = new Date().toISOString();

  if (cliente.id) {
    const idx = list.findIndex((c) => c.id === cliente.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...cliente, updated_at: now } as Cliente;
      setLocal('clientes', list);
      return list[idx];
    }
  }

  const newCli: Cliente = {
    id: `cli-${Date.now()}`,
    nome: cliente.nome || '',
    telefone: cliente.telefone || '',
    whatsapp: cliente.whatsapp || '',
    email: cliente.email || null,
    cpf: cliente.cpf || null,
    endereco: cliente.endereco || null,
    observacoes: cliente.observacoes || null,
    created_at: now,
    updated_at: now,
  };
  list.unshift(newCli);
  setLocal('clientes', list);
  return newCli;
}

export async function deleteCliente(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }

  const list = getLocal<Cliente[]>('clientes', INITIAL_CLIENTES);
  setLocal('clientes', list.filter((c) => c.id !== id));
}

// ----------------------------------------------------------------------------
// ORDENS DE SERVIÇO (OS)
// ----------------------------------------------------------------------------

export async function getOrdensServico(params?: {
  status?: StatusOS;
  search?: string;
  clienteId?: string;
}): Promise<OrdemServico[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('ordens_servico')
      .select('*, cliente:clientes(*)')
      .order('numero_os', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.clienteId) {
      query = query.eq('cliente_id', params.clienteId);
    }

    const { data, error } = await query;
    if (!error && data) {
      let results = data as OrdemServico[];
      if (params?.search) {
        const s = params.search.toLowerCase();
        results = results.filter(
          (os) =>
            os.numero_os.toString().includes(s) ||
            os.cliente?.nome.toLowerCase().includes(s) ||
            os.tipo_aparelho.toLowerCase().includes(s) ||
            os.modelo?.toLowerCase().includes(s) ||
            os.imei_serie?.toLowerCase().includes(s)
        );
      }
      return results;
    }
  }

  let list = getLocal<OrdemServico[]>('ordens', INITIAL_ORDENS);
  const clientes = getLocal<Cliente[]>('clientes', INITIAL_CLIENTES);

  list = list.map((os) => ({
    ...os,
    cliente: clientes.find((c) => c.id === os.cliente_id) || null,
  }));

  if (params?.status) {
    list = list.filter((os) => os.status === params.status);
  }
  if (params?.clienteId) {
    list = list.filter((os) => os.cliente_id === params.clienteId);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    list = list.filter(
      (os) =>
        os.numero_os.toString().includes(s) ||
        os.cliente?.nome.toLowerCase().includes(s) ||
        os.tipo_aparelho.toLowerCase().includes(s) ||
        os.modelo?.toLowerCase().includes(s) ||
        os.imei_serie?.toLowerCase().includes(s)
    );
  }

  return list;
}

export async function getOrdemServicoById(id: string): Promise<OrdemServico | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*, cliente:clientes(*)')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) return data as OrdemServico;
  }

  const list = await getOrdensServico();
  return list.find((os) => os.id === id || os.numero_os.toString() === id) || null;
}

export async function saveOrdemServico(
  os: Partial<OrdemServico>
): Promise<OrdemServico> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    if (os.id && !os.id.startsWith('os-')) {
      const { data, error } = await supabase
        .from('ordens_servico')
        .update({
          cliente_id: os.cliente_id,
          tipo_aparelho: os.tipo_aparelho,
          marca: os.marca || null,
          modelo: os.modelo || null,
          imei_serie: os.imei_serie || null,
          senha_aparelho: os.senha_aparelho || null,
          defeito_relatado: os.defeito_relatado,
          estado_fisico: os.estado_fisico || null,
          acessorios_entregues: os.acessorios_entregues || null,
          diagnostico: os.diagnostico || null,
          servico_realizar: os.servico_realizar || null,
          valor_estimado: Number(os.valor_estimado || 0),
          valor_final: Number(os.valor_final || 0),
          status: os.status,
          prazo_estimado: os.prazo_estimado || null,
          data_conclusao: os.status === 'entregue' || os.status === 'pronta' ? now : os.data_conclusao,
          observacoes_internas: os.observacoes_internas || null,
          responsavel_nome: os.responsavel_nome || null,
          fotos: os.fotos || [],
          updated_at: now,
        })
        .eq('id', os.id)
        .select('*, cliente:clientes(*)')
        .single();

      if (error) throw new Error(error.message);
      return data as OrdemServico;
    } else {
      const { data, error } = await supabase
        .from('ordens_servico')
        .insert({
          cliente_id: os.cliente_id,
          tipo_aparelho: os.tipo_aparelho,
          marca: os.marca || null,
          modelo: os.modelo || null,
          imei_serie: os.imei_serie || null,
          senha_aparelho: os.senha_aparelho || null,
          defeito_relatado: os.defeito_relatado,
          estado_fisico: os.estado_fisico || null,
          acessorios_entregues: os.acessorios_entregues || null,
          diagnostico: os.diagnostico || null,
          servico_realizar: os.servico_realizar || null,
          valor_estimado: Number(os.valor_estimado || 0),
          valor_final: Number(os.valor_final || 0),
          status: os.status || 'recebida',
          prazo_estimado: os.prazo_estimado || null,
          observacoes_internas: os.observacoes_internas || null,
          responsavel_nome: os.responsavel_nome || null,
          fotos: os.fotos || [],
        })
        .select('*, cliente:clientes(*)')
        .single();

      if (error) throw new Error(error.message);
      return data as OrdemServico;
    }
  }

  const list = getLocal<OrdemServico[]>('ordens', INITIAL_ORDENS);
  const clientes = getLocal<Cliente[]>('clientes', INITIAL_CLIENTES);

  if (os.id) {
    const idx = list.findIndex((item) => item.id === os.id);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...os,
        updated_at: now,
      } as OrdemServico;
      setLocal('ordens', list);
      return list[idx];
    }
  }

  const maxNumero = list.reduce((max, item) => Math.max(max, item.numero_os), 1000);
  const newOS: OrdemServico = {
    id: `os-${Date.now()}`,
    numero_os: maxNumero + 1,
    cliente_id: os.cliente_id || '',
    tipo_aparelho: os.tipo_aparelho || 'Celular',
    marca: os.marca || null,
    modelo: os.modelo || null,
    imei_serie: os.imei_serie || null,
    senha_aparelho: os.senha_aparelho || null,
    defeito_relatado: os.defeito_relatado || '',
    estado_fisico: os.estado_fisico || null,
    acessorios_entregues: os.acessorios_entregues || null,
    diagnostico: os.diagnostico || null,
    servico_realizar: os.servico_realizar || null,
    valor_estimado: Number(os.valor_estimado || 0),
    valor_final: Number(os.valor_final || 0),
    status: os.status || 'recebida',
    data_entrada: now,
    prazo_estimado: os.prazo_estimado || null,
    data_conclusao: null,
    observacoes_internas: os.observacoes_internas || null,
    responsavel_nome: os.responsavel_nome || 'Jonh Silva',
    fotos: os.fotos || [],
    created_at: now,
    updated_at: now,
    cliente: clientes.find((c) => c.id === os.cliente_id) || null,
  };
  list.unshift(newOS);
  setLocal('ordens', list);
  return newOS;
}

// ----------------------------------------------------------------------------
// UPLOAD DE IMAGEM (STORAGE SUPABASE BUCKET 'produtos')
// ----------------------------------------------------------------------------

export async function uploadImagemProduto(
  file: File
): Promise<{ url: string; caminho: string }> {
  // Validações
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    throw new Error('Formato inválido. Permitidos: JPG, JPEG, PNG e WEBP.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Tamanho máximo permitido é 5MB por imagem.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const caminho = `produtos/${fileName}`;

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.storage
      .from('produtos')
      .upload(caminho, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from('produtos').getPublicUrl(caminho);

    return { url: publicUrl, caminho };
  }

  // Fallback para preview local se Storage ainda não configurado
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        url: reader.result as string,
        caminho: `local/${fileName}`,
      });
    };
    reader.readAsDataURL(file);
  });
}

export async function deleteImagemProduto(caminho: string): Promise<void> {
  if (isSupabaseConfigured && supabase && !caminho.startsWith('local/')) {
    await supabase.storage.from('produtos').remove([caminho]);
  }
}
