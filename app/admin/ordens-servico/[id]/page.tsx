'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  MessageCircle,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import {
  getOrdemServicoById,
  saveOrdemServico,
  getConfiguracoes,
} from '@/lib/supabase/data-service';
import { OrdemServico, StatusOS, ConfiguracoesSite } from '@/lib/supabase/types';
import {
  formatCurrency,
  formatDate,
  formatPhone,
  generateWhatsAppLink,
  STATUS_OS_LABELS,
} from '@/lib/utils';

export default function OrdemServicoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [os, setOs] = useState<OrdemServico | null>(null);
  const [config, setConfig] = useState<ConfiguracoesSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos editáveis
  const [status, setStatus] = useState<StatusOS>('aberta');
  const [diagnosticoTecnico, setDiagnosticoTecnico] = useState('');
  const [servicoExecutado, setServicoExecutado] = useState('');
  const [valorPecas, setValorPecas] = useState<number>(0);
  const [valorMaoObra, setValorMaoObra] = useState<number>(0);
  const [desconto, setDesconto] = useState<number>(0);
  const [previsaoEntrega, setPrevisaoEntrega] = useState('');
  const [observacoesInternas, setObservacoesInternas] = useState('');

  // Mensagem personalizada do WhatsApp
  const [customMsgTemplate, setCustomMsgTemplate] = useState<string>('pronto');

  const loadData = async () => {
    setLoading(true);
    try {
      const [osData, configData] = await Promise.all([
        getOrdemServicoById(id),
        getConfiguracoes(),
      ]);

      setOs(osData);
      setConfig(configData);

      if (osData) {
        setStatus(osData.status);
        setDiagnosticoTecnico(osData.diagnostico_tecnico || '');
        setServicoExecutado(osData.servico_executado || '');
        setValorPecas(Number(osData.valor_pecas || 0));
        setValorMaoObra(Number(osData.valor_mao_obra || 0));
        setDesconto(Number(osData.desconto || 0));
        setPrevisaoEntrega(
          osData.previsao_entrega ? osData.previsao_entrega.split('T')[0] : ''
        );
        setObservacoesInternas(osData.observacoes_internas || '');
      }
    } catch (err) {
      console.error('Error loading service order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const valorTotal = Math.max(0, valorPecas + valorMaoObra - desconto);

  const handleSave = async (novoStatus?: StatusOS) => {
    if (!os) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const st = novoStatus || status;

    try {
      const updated = await saveOrdemServico({
        ...os,
        status: st,
        diagnostico_tecnico: diagnosticoTecnico || null,
        servico_executado: servicoExecutado || null,
        valor_pecas: Number(valorPecas),
        valor_mao_obra: Number(valorMaoObra),
        desconto: Number(desconto),
        valor_total: valorTotal,
        previsao_entrega: previsaoEntrega ? new Date(previsaoEntrega).toISOString() : null,
        observacoes_internas: observacoesInternas || null,
        data_conclusao:
          st === 'pronta' || st === 'entregue' ? new Date().toISOString() : os.data_conclusao,
        data_entrega: st === 'entregue' ? new Date().toISOString() : os.data_entrega,
      });

      setOs(updated);
      setStatus(updated.status);
      setSuccessMsg('Ordem de serviço salva com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar alterações na OS.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        <p className="mt-3 text-xs text-zinc-400">Carregando detalhes da OS...</p>
      </div>
    );
  }

  if (!os) {
    return (
      <div className="rounded-3xl border border-white/10 bg-zinc-950 p-12 text-center">
        <h2 className="text-lg font-bold">Ordem de Serviço não encontrada</h2>
        <Link
          href="/admin/ordens-servico"
          className="mt-4 inline-block text-xs font-semibold text-[#D4AF37] hover:underline"
        >
          Voltar para listagem
        </Link>
      </div>
    );
  }

  const clientZap = os.cliente?.whatsapp || os.cliente?.telefone || '';
  const statusCfg = STATUS_OS_LABELS[os.status];

  // Gerador de Mensagens do WhatsApp
  let generatedMsg = '';
  if (customMsgTemplate === 'entrada') {
    generatedMsg = `Olá ${os.cliente?.nome}! A Central Phones confirma a entrada do seu aparelho *${os.tipo_aparelho} ${os.modelo || os.marca || ''}* sob a *OS #${os.numero_os}*. Estamos realizando a análise técnica e logo entraremos em contato.`;
  } else if (customMsgTemplate === 'orcamento') {
    generatedMsg = `Olá ${os.cliente?.nome}! O diagnóstico da sua *OS #${os.numero_os}* (${os.tipo_aparelho} ${os.modelo || ''}) ficou pronto:\n\n*Defeito/Diagnóstico:* ${diagnosticoTecnico || os.defeito_relatado}\n*Serviço:* ${servicoExecutado || 'Reparo especializado'}\n*Valor Total:* ${formatCurrency(valorTotal)}\n\nPodemos aprovar para iniciar o reparo?`;
  } else if (customMsgTemplate === 'pronto') {
    generatedMsg = `Olá ${os.cliente?.nome}! Ótima notícia: seu aparelho *${os.tipo_aparelho} ${os.modelo || os.marca || ''}* (OS #${os.numero_os}) está *PRONTO PARA RETIRADA* na Central Phones!\n\n*Valor final:* ${formatCurrency(valorTotal)}\n*Endereço:* ${config?.endereco || 'Avenida Sete de Setembro, 153 - Matozinhos'}`;
  } else if (customMsgTemplate === 'entregue') {
    generatedMsg = `Olá ${os.cliente?.nome}! Agradecemos pela confiança na Central Phones. Seu aparelho da OS #${os.numero_os} foi entregue com garantia de 90 dias no serviço executado. Qualquer dúvida estamos à disposição!`;
  }

  const zapUrl = generateWhatsAppLink(clientZap, generatedMsg);

  return (
    <div className="space-y-6">
      {/* SEÇÃO NÃO IMPRIMÍVEL: AÇÕES E HEADER */}
      <div className="print:hidden space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/ordens-servico"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2DED4] text-[#666666] hover:text-[#171717] hover:bg-[#FAF9F6] bg-white transition shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#171717] sm:text-2xl">
                  Ordem de Serviço #{os.numero_os}
                </h1>
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                >
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Cliente: <strong className="text-[#171717]">{os.cliente?.nome}</strong> • Entrada: {formatDate(os.data_entrada)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-2xl border border-[#E2DED4] bg-white px-4 py-2.5 text-xs font-bold text-[#171717] transition hover:border-[#D4AF37] hover:text-[#B99122] shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir Comprovante</span>
            </button>

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-2.5 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ATALHOS DE TRANSIÇÃO RÁPIDA DE STATUS */}
        <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[#E2DED4] bg-white p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#666666] mr-2">
            Ações Rápidas de Ciclo:
          </span>
          <button
            onClick={() => handleSave('em_analise')}
            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-xs"
          >
            → Em Análise
          </button>
          <button
            onClick={() => handleSave('aguardando_aprovacao')}
            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-600 hover:text-white transition shadow-xs"
          >
            → Aguardar Aprovação
          </button>
          <button
            onClick={() => handleSave('em_reparo')}
            className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-600 hover:text-white transition shadow-xs"
          >
            → Em Reparo
          </button>
          <button
            onClick={() => handleSave('pronta')}
            className="rounded-xl border border-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1.5 text-xs font-bold text-[#B99122] hover:bg-[#D4AF37] hover:text-[#171717] transition shadow-xs"
          >
            ★ Marcar como Pronta
          </button>
          <button
            onClick={() => handleSave('entregue')}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-xs"
          >
            ✓ Entregar Aparelho
          </button>
        </div>

        {/* ================= GERADOR DE MENSAGENS WHATSAPP ================= */}
        {clientZap && (
          <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider">
                  Notificar Cliente no WhatsApp
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-600">
                {formatPhone(clientZap)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCustomMsgTemplate('entrada')}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  customMsgTemplate === 'entrada'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#FAF9F6] border border-[#E2DED4] text-[#666666] hover:text-[#171717]'
                }`}
              >
                1. Entrada
              </button>
              <button
                type="button"
                onClick={() => setCustomMsgTemplate('orcamento')}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  customMsgTemplate === 'orcamento'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#FAF9F6] border border-[#E2DED4] text-[#666666] hover:text-[#171717]'
                }`}
              >
                2. Orçamento
              </button>
              <button
                type="button"
                onClick={() => setCustomMsgTemplate('pronto')}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  customMsgTemplate === 'pronto'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#FAF9F6] border border-[#E2DED4] text-[#666666] hover:text-[#171717]'
                }`}
              >
                3. Pronto para Retirada
              </button>
              <button
                type="button"
                onClick={() => setCustomMsgTemplate('entregue')}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  customMsgTemplate === 'entregue'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#FAF9F6] border border-[#E2DED4] text-[#666666] hover:text-[#171717]'
                }`}
              >
                4. Pós-Entrega / Garantia
              </button>
            </div>

            <div className="rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] whitespace-pre-line font-mono">
              {generatedMsg}
            </div>

            <div className="flex justify-end">
              <a
                href={zapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Enviar para {os.cliente?.nome}</span>
              </a>
            </div>
          </div>
        )}

        {/* ================= FORMULÁRIO DE EDIÇÃO TÉCNICA ================= */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* COLUNA ESQUERDA: DADOS DE ENTRADA (FIXOS) */}
          <div className="space-y-4 rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B99122]">
              Dados de Entrada do Aparelho
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#E2DED4] pb-2">
                <span className="text-[#666666]">Tipo:</span>
                <span className="font-bold text-[#171717]">{os.tipo_aparelho}</span>
              </div>
              <div className="flex justify-between border-b border-[#E2DED4] pb-2">
                <span className="text-[#666666]">Marca / Modelo:</span>
                <span className="font-bold text-[#171717]">
                  {os.marca || '-'} {os.modelo || ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#E2DED4] pb-2">
                <span className="text-[#666666]">IMEI / Nº Série:</span>
                <span className="font-mono text-[#171717]">{os.imei_serial || 'Não informado'}</span>
              </div>
              <div className="flex justify-between border-b border-[#E2DED4] pb-2">
                <span className="text-[#666666]">Senha / Padrão:</span>
                <span className="font-mono font-bold text-amber-600">
                  {os.senha_aparelho || 'Sem senha'}
                </span>
              </div>
              <div className="border-b border-[#E2DED4] pb-2">
                <span className="text-[#666666]">Defeito Relatado:</span>
                <p className="mt-1 text-[#171717] font-medium">{os.defeito_relatado}</p>
              </div>
              <div className="border-b border-[#E2DED4] pb-2">
                <span className="text-[#666666]">Estado Físico:</span>
                <p className="mt-1 text-[#666666]">{os.estado_fisico || 'Sem avarias relatadas'}</p>
              </div>
              <div>
                <span className="text-[#666666]">Acessórios Deixados:</span>
                <p className="mt-1 text-[#666666]">{os.acessorios_deixados || 'Nenhum'}</p>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: EDIÇÃO DE BANCADA E VALORES */}
          <div className="space-y-4 rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B99122]">
              Evolução Técnica & Financeira
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Status Atual da OS
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusOS)}
                  className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                >
                  <option value="aberta">Aberta</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="em_reparo">Em Reparo</option>
                  <option value="pronta">Pronta</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Diagnóstico Técnico Realizado
                </label>
                <textarea
                  rows={2}
                  value={diagnosticoTecnico}
                  onChange={(e) => setDiagnosticoTecnico(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Serviço / Peças Trocadas
                </label>
                <textarea
                  rows={2}
                  value={servicoExecutado}
                  onChange={(e) => setServicoExecutado(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#666666]">
                    Peças (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorPecas}
                    onChange={(e) => setValorPecas(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-[#FAF9F6] p-2 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#666666]">
                    Mão de Obra (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorMaoObra}
                    onChange={(e) => setValorMaoObra(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-[#FAF9F6] p-2 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#666666]">
                    Desconto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={desconto}
                    onChange={(e) => setDesconto(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-[#FAF9F6] p-2 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-[#FAF9F6] p-3">
                <span className="text-xs font-bold text-[#171717]">Total Final da OS:</span>
                <span className="text-lg font-black text-[#B99122]">
                  {formatCurrency(valorTotal)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Observações Internas (Confidencial)
                </label>
                <input
                  type="text"
                  value={observacoesInternas}
                  onChange={(e) => setObservacoesInternas(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPROVANTE IMPRIMÍVEL (SÃO JOÃO DEL-REI) ================= */}
      <div className="hidden print:block text-black bg-white p-8 font-sans">
        {/* CABEÇALHO DA EMPRESA */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              CENTRAL PHONES
            </h1>
            <p className="text-xs font-bold text-zinc-700 uppercase">
              Assistência Técnica Especializada
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">
              {config?.endereco || 'Avenida Sete de Setembro, 153 - Matozinhos'}
            </p>
            <p className="text-[11px] text-zinc-600">
              {config?.cidade_estado || 'São João del-Rei - MG'} • Tel/WhatsApp:{' '}
              {formatPhone(config?.whatsapp || '5532935054792')}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xl font-black">
              ORDEM DE SERVIÇO #{os.numero_os}
            </div>
            <div className="text-xs font-bold mt-1">
              Data de Entrada: {formatDate(os.data_entrada)}
            </div>
            <div className="text-xs font-semibold mt-0.5">
              Status: {statusCfg.label.toUpperCase()}
            </div>
          </div>
        </div>

        {/* DADOS DO CLIENTE */}
        <div className="mt-4 border border-zinc-300 p-3 rounded-lg text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Cliente:</strong> {os.cliente?.nome}
            </div>
            <div>
              <strong>Telefone:</strong> {formatPhone(clientZap || '-')}
            </div>
            <div>
              <strong>CPF:</strong> {os.cliente?.cpf || 'Não informado'}
            </div>
            <div>
              <strong>Endereço:</strong> {os.cliente?.endereco || 'São João del-Rei - MG'}
            </div>
          </div>
        </div>

        {/* DADOS DO APARELHO */}
        <div className="mt-4 border border-zinc-300 p-3 rounded-lg text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <strong>Tipo:</strong> {os.tipo_aparelho}
            </div>
            <div>
              <strong>Marca/Modelo:</strong> {os.marca} {os.modelo}
            </div>
            <div>
              <strong>IMEI/Série:</strong> {os.imei_serial || 'N/A'}
            </div>
            <div className="col-span-3">
              <strong>Defeito Relatado:</strong> {os.defeito_relatado}
            </div>
            <div className="col-span-3">
              <strong>Estado Físico / Riscos:</strong> {os.estado_fisico || 'Sem detalhes'}
            </div>
            <div className="col-span-3">
              <strong>Acessórios Deixados:</strong> {os.acessorios_deixados || 'Nenhum'}
            </div>
          </div>
        </div>

        {/* SERVIÇO E DIAGNÓSTICO */}
        {(diagnosticoTecnico || servicoExecutado) && (
          <div className="mt-4 border border-zinc-300 p-3 rounded-lg text-xs">
            {diagnosticoTecnico && (
              <div className="mb-1">
                <strong>Diagnóstico:</strong> {diagnosticoTecnico}
              </div>
            )}
            {servicoExecutado && (
              <div>
                <strong>Serviço Realizado:</strong> {servicoExecutado}
              </div>
            )}
          </div>
        )}

        {/* TABELA DE VALORES */}
        <div className="mt-4 border border-zinc-300 p-3 rounded-lg text-xs flex justify-between items-center">
          <div>
            <span>Peças: {formatCurrency(valorPecas)}</span> •{' '}
            <span>Mão de Obra: {formatCurrency(valorMaoObra)}</span> •{' '}
            <span>Desconto: {formatCurrency(desconto)}</span>
          </div>
          <div className="text-base font-black">
            VALOR TOTAL: {formatCurrency(valorTotal)}
          </div>
        </div>

        {/* TERMOS DE GARANTIA E ASSINATURAS */}
        <div className="mt-6 border-t border-zinc-300 pt-4 text-[10px] text-zinc-600 leading-tight space-y-1">
          <p>
            1. A Central Phones oferece 90 (noventa) dias de garantia sobre os serviços executados e peças substituídas, contados a partir da data de entrega, excluindo-se danos por queda, mau uso ou contato com líquidos.
          </p>
          <p>
            2. Aparelhos não retirados em até 90 dias após a notificação de conclusão serão destinados a ressarcimento de custos conforme legislação vigente.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="border-t border-black pt-2">
            Central Phones - Técnico Responsável
          </div>
          <div className="border-t border-black pt-2">
            Assinatura do Cliente
          </div>
        </div>
      </div>
    </div>
  );
}
