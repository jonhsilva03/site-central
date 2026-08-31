'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import {
  getClientes,
  getOrdensServico,
  saveCliente,
  saveOrdemServico,
} from '@/lib/supabase/data-service';
import { Cliente, StatusOS } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils';

export default function NovaOrdemServicoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nextNumeroOS, setNextNumeroOS] = useState<number>(1001);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Customer Creation inline modal / state
  const [quickClientMode, setQuickClientMode] = useState(false);
  const [quickNome, setQuickNome] = useState('');
  const [quickWhatsapp, setQuickWhatsapp] = useState('');

  // Form OS
  const [clienteId, setClienteId] = useState('');
  const [tipoAparelho, setTipoAparelho] = useState('Smartphone');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [imeiSerial, setImeiSerial] = useState('');
  const [senhaAparelho, setSenhaAparelho] = useState('');
  const [defeitoRelatado, setDefeitoRelatado] = useState('');
  const [estadoFisico, setEstadoFisico] = useState('');
  const [acessoriosDeixados, setAcessoriosDeixados] = useState('');
  const [diagnosticoTecnico, setDiagnosticoTecnico] = useState('');
  const [servicoExecutado, setServicoExecutado] = useState('');
  const [valorPecas, setValorPecas] = useState<number>(0);
  const [valorMaoObra, setValorMaoObra] = useState<number>(0);
  const [desconto, setDesconto] = useState<number>(0);
  const [status, setStatus] = useState<StatusOS>('aberta');
  const [previsaoEntrega, setPrevisaoEntrega] = useState('');
  const [observacoesInternas, setObservacoesInternas] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const [cliList, osList] = await Promise.all([
          getClientes(),
          getOrdensServico(),
        ]);
        setClientes(cliList);
        if (cliList.length > 0) {
          setClienteId(cliList[0].id);
        }

        if (osList.length > 0) {
          const maxNum = Math.max(...osList.map((o) => o.numero_os));
          setNextNumeroOS(maxNum + 1);
        }
      } catch (err) {
        console.error('Error initializing new OS', err);
      }
    }
    init();
  }, []);

  const valorTotal = Math.max(0, valorPecas + valorMaoObra - desconto);

  const handleCreateQuickClient = async () => {
    if (!quickNome.trim()) return;
    try {
      const created = await saveCliente({
        nome: quickNome.trim(),
        whatsapp: quickWhatsapp.trim() || null,
        telefone: quickWhatsapp.trim() || null,
      });
      setClientes((prev) => [created, ...prev]);
      setClienteId(created.id);
      setQuickClientMode(false);
      setQuickNome('');
      setQuickWhatsapp('');
    } catch (err) {
      console.error('Error quick creating client', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      setError('Por favor selecione ou cadastre um cliente.');
      return;
    }
    if (!defeitoRelatado.trim()) {
      setError('O defeito relatado é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await saveOrdemServico({
        numero_os: nextNumeroOS,
        cliente_id: clienteId,
        tipo_aparelho: tipoAparelho,
        marca: marca || null,
        modelo: modelo || null,
        imei_serial: imeiSerial || null,
        senha_aparelho: senhaAparelho || null,
        defeito_relatado: defeitoRelatado.trim(),
        estado_fisico: estadoFisico || null,
        acessorios_deixados: acessoriosDeixados || null,
        diagnostico_tecnico: diagnosticoTecnico || null,
        servico_executado: servicoExecutado || null,
        valor_pecas: Number(valorPecas),
        valor_mao_obra: Number(valorMaoObra),
        desconto: Number(desconto),
        valor_total: valorTotal,
        status: status,
        previsao_entrega: previsaoEntrega ? new Date(previsaoEntrega).toISOString() : null,
        observacoes_internas: observacoesInternas || null,
      });

      router.push(`/admin/ordens-servico/${created.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar ordem de serviço.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
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
                Nova Ordem de Serviço
              </h1>
              <span className="rounded-lg bg-[#D4AF37] px-2.5 py-0.5 text-xs font-black text-[#171717]">
                #{nextNumeroOS}
              </span>
            </div>
            <p className="text-xs text-[#666666]">
              Entrada de aparelho para assistência técnica, avaliação e orçamento.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: CLIENTE */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#B99122] uppercase tracking-wider">
              1. Identificação do Cliente
            </h2>
            <button
              type="button"
              onClick={() => setQuickClientMode(!quickClientMode)}
              className="flex items-center gap-1 text-xs font-bold text-[#B99122] hover:underline"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{quickClientMode ? 'Selecionar existente' : '+ Cadastrar novo cliente'}</span>
            </button>
          </div>

          {quickClientMode ? (
            <div className="grid gap-3 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF9F6] p-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={quickNome}
                  onChange={(e) => setQuickNome(e.target.value)}
                  placeholder="Nome completo..."
                  className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-white p-2.5 text-xs text-[#171717] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={quickWhatsapp}
                  onChange={(e) => setQuickWhatsapp(e.target.value)}
                  placeholder="(32) 99999-9999"
                  className="mt-1 w-full rounded-xl border border-[#E2DED4] bg-white p-2.5 text-xs text-[#171717] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateQuickClient}
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-bold text-[#171717] hover:bg-[#B99122] hover:text-white transition shadow-xs"
                >
                  Confirmar e Selecionar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Selecione o Cliente *
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} {c.whatsapp ? `• (${c.whatsapp})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* SEÇÃO 2: APARELHO & SEGURANÇA */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#B99122] uppercase tracking-wider">
            2. Dados do Aparelho
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Tipo do Aparelho *
              </label>
              <select
                value={tipoAparelho}
                onChange={(e) => setTipoAparelho(e.target.value)}
                required
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              >
                <option value="Smartphone">Smartphone / Celular</option>
                <option value="Notebook">Notebook</option>
                <option value="PC / Desktop">PC / Desktop</option>
                <option value="Videogame">Videogame / Console</option>
                <option value="Tablet">Tablet / iPad</option>
                <option value="Eletrônico / Outro">Eletrônico / Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Marca
              </label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Apple, Xiaomi, Samsung, Dell, Sony"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Modelo / Cor
              </label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: iPhone 11 64GB Preto, PS5 Slim"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                IMEI / Número de Série
              </label>
              <input
                type="text"
                value={imeiSerial}
                onChange={(e) => setImeiSerial(e.target.value)}
                placeholder="Ex: 354829104829104"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717]">
                Senha / Padrão de Desbloqueio (Para testes de bancada)
              </label>
              <input
                type="text"
                value={senhaAparelho}
                onChange={(e) => setSenhaAparelho(e.target.value)}
                placeholder="Ex: 123456 ou L invertido"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
              <p className="mt-1 flex items-center gap-1 text-[10px] text-[#666666]">
                <ShieldAlert className="h-3 w-3 text-amber-600" />
                Uso restrito aos técnicos para testar microfone, câmeras e sensores pós-reparo.
              </p>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: DIAGNÓSTICO & DEFEITO */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#B99122] uppercase tracking-wider">
            3. Descrição do Defeito e Condições de Entrada
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Defeito Relatado pelo Cliente *
              </label>
              <textarea
                rows={2}
                value={defeitoRelatado}
                onChange={(e) => setDefeitoRelatado(e.target.value)}
                placeholder="Ex: Aparelho caiu na água e não liga mais. Tela trincada."
                required
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Estado Físico do Aparelho
                </label>
                <textarea
                  rows={2}
                  value={estadoFisico}
                  onChange={(e) => setEstadoFisico(e.target.value)}
                  placeholder="Ex: Tampa traseira com riscos leves, quina amassada."
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Acessórios Deixados
                </label>
                <textarea
                  rows={2}
                  value={acessoriosDeixados}
                  onChange={(e) => setAcessoriosDeixados(e.target.value)}
                  placeholder="Ex: Deixou capinha de silicone e cabo USB-C."
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Diagnóstico Técnico Inicial
                </label>
                <textarea
                  rows={2}
                  value={diagnosticoTecnico}
                  onChange={(e) => setDiagnosticoTecnico(e.target.value)}
                  placeholder="Ex: Curto na linha primária VDD_MAIN. Necessário desoxidação e troca de CI."
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Serviço / Procedimento a Executar
                </label>
                <textarea
                  rows={2}
                  value={servicoExecutado}
                  onChange={(e) => setServicoExecutado(e.target.value)}
                  placeholder="Ex: Desoxidação química, microssoldagem e troca de tela OLED."
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: VALORES & STATUS */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#B99122] uppercase tracking-wider">
            4. Valores, Prazos & Status
          </h2>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Peças (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorPecas}
                onChange={(e) => setValorPecas(Number(e.target.value))}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Mão de Obra (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorMaoObra}
                onChange={(e) => setValorMaoObra(Number(e.target.value))}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Desconto (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={desconto}
                onChange={(e) => setDesconto(Number(e.target.value))}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B99122]">
                Total da OS (R$)
              </label>
              <div className="mt-1.5 rounded-2xl border border-[#D4AF37]/50 bg-[#FAF9F6] p-3 text-sm font-black text-[#B99122]">
                {formatCurrency(valorTotal)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusOS)}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              >
                <option value="aberta">Aberta / Aguardando Triagem</option>
                <option value="em_analise">Em Análise Técnica</option>
                <option value="aguardando_aprovacao">Aguardando Aprovação do Cliente</option>
                <option value="aprovada">Aprovada</option>
                <option value="em_reparo">Em Reparo / Bancada</option>
                <option value="pronta">Pronta para Retirada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Previsão de Entrega
              </label>
              <input
                type="date"
                value={previsaoEntrega}
                onChange={(e) => setPrevisaoEntrega(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717]">
                Observações Internas (Não saem no comprovante do cliente)
              </label>
              <input
                type="text"
                value={observacoesInternas}
                onChange={(e) => setObservacoesInternas(e.target.value)}
                placeholder="Ex: Fornecedor prometeu peça para quinta-feira 14h."
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/ordens-servico"
            className="rounded-2xl border border-[#E2DED4] px-6 py-3 text-xs font-semibold text-[#666666] hover:bg-[#FAF9F6]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-8 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Gerando Ordem de Serviço...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar e Abrir OS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
