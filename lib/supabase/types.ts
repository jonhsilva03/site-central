export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
};

export type ProdutoImagem = {
  id: string;
  produto_id: string;
  url: string;
  caminho: string;
  ordem: number;
  is_capa: boolean;
  created_at?: string;
};

export type Produto = {
  id: string;
  categoria_id: string | null;
  nome: string;
  marca: string | null;
  modelo: string | null;
  sku: string | null;
  slug: string;
  descricao: string | null;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  destaque: boolean;
  ativo: boolean;
  foto_principal: string | null;
  created_at: string;
  updated_at: string;
  categoria?: Categoria | null;
  imagens?: ProdutoImagem[];
};

export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste' | 'devolucao';

export type MovimentacaoEstoque = {
  id: string;
  produto_id: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  estoque_anterior: number;
  estoque_posterior: number;
  motivo: string;
  observacao: string | null;
  usuario_email: string | null;
  created_at: string;
  produto?: Produto | null;
};

export type AdminUser = {
  id: string;
  email: string;
  nome: string;
  created_at: string;
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  cpf: string | null;
  endereco: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type StatusOS =
  | 'aberta'
  | 'recebida'
  | 'coleta_solicitada'
  | 'coleta_agendada'
  | 'aparelho_coletado'
  | 'em_analise'
  | 'em_diagnostico'
  | 'aguardando_aprovacao'
  | 'aprovada'
  | 'em_reparo'
  | 'em_manutencao'
  | 'pronta'
  | 'entrega_agendada'
  | 'entregue'
  | 'cancelada';

export type FotoOS = {
  url: string;
  caminho: string;
  legenda?: string;
};

export type TipoAtendimento = 'balcao' | 'delivery';

export type OrdemServico = {
  id: string;
  numero_os: number;
  cliente_id: string;
  tipo_atendimento?: TipoAtendimento;
  // Campos de Delivery
  endereco_coleta?: string | null;
  bairro_coleta?: string | null;
  complemento_coleta?: string | null;
  ponto_referencia_coleta?: string | null;
  data_prevista_coleta?: string | null;
  periodo_coleta?: string | null;
  data_prevista_entrega?: string | null;
  taxa_deslocamento?: number;
  observacoes_delivery?: string | null;
  status_coleta?: string | null;
  status_entrega?: string | null;
  // Dados do Aparelho
  tipo_aparelho: string;
  marca: string | null;
  modelo: string | null;
  imei_serie?: string | null;
  imei_serial?: string | null;
  senha_aparelho: string | null;
  defeito_relatado: string;
  estado_fisico: string | null;
  acessorios_entregues?: string | null;
  acessorios_deixados?: string | null;
  diagnostico?: string | null;
  diagnostico_tecnico?: string | null;
  servico_realizar?: string | null;
  servico_executado?: string | null;
  valor_pecas?: number;
  valor_mao_obra?: number;
  desconto?: number;
  valor_estimado?: number;
  valor_final?: number;
  valor_total?: number;
  status: StatusOS;
  data_entrada: string;
  prazo_estimado?: string | null;
  previsao_entrega?: string | null;
  data_conclusao?: string | null;
  data_entrega?: string | null;
  observacoes_internas: string | null;
  responsavel_nome?: string | null;
  fotos?: FotoOS[];
  created_at: string;
  updated_at: string;
  cliente?: Cliente | null;
};

export type HistoricoOS = {
  id: string;
  ordem_id: string;
  status_anterior: string | null;
  status_novo: StatusOS;
  observacao: string | null;
  usuario_nome: string | null;
  created_at: string;
};

export type ServicoItem = {
  icone: string;
  titulo: string;
  descricao: string;
};

export type ConfiguracoesSite = {
  id: string;
  nome_empresa: string;
  logo_url: string | null;
  imagem_hero: string | null;
  texto_apresentacao: string;
  whatsapp: string;
  instagram: string | null;
  email: string | null;
  endereco: string | null;
  bairro?: string | null;
  cidade_estado: string;
  cep?: string | null;
  horario_funcionamento: string;
  texto_sobre: string;
  servicos_json: ServicoItem[];
  diferenciais_json: string[];
  updated_at: string;
};
