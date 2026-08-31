'use client';

import React, { useEffect, useState } from 'react';
import {
  Boxes,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  getProdutos,
  getMovimentacoes,
  movimentarEstoque,
} from '@/lib/supabase/data-service';
import { Produto, MovimentacaoEstoque, TipoMovimentacao } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function AdminEstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtros da tabela de produtos
  const [prodSearch, setProdSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'todos' | 'baixo' | 'zerado'>('todos');

  // Filtros da tabela de movimentações
  const [movFilterType, setMovFilterType] = useState<string>('todos');

  // Modal de Movimentação
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [tipoMov, setTipoMov] = useState<TipoMovimentacao>('entrada');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [motivo, setMotivo] = useState('');

  const loadData = async () => {
    try {
      const [prods, movs] = await Promise.all([
        getProdutos({ onlyActive: false }),
        getMovimentacoes(),
      ]);
      setProdutos(prods);
      setMovimentacoes(movs);
      if (prods.length > 0 && !selectedProdutoId) {
        setSelectedProdutoId(prods[0].id);
      }
    } catch (err) {
      console.error('Error loading stock data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenMovementModal = (produtoId?: string, defaultTipo?: TipoMovimentacao) => {
    if (produtoId) setSelectedProdutoId(produtoId);
    if (defaultTipo) setTipoMov(defaultTipo);
    setQuantidade(1);
    setMotivo('');
    setError(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdutoId) {
      setError('Selecione um produto.');
      return;
    }
    if (quantidade <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }
    if (!motivo.trim()) {
      setError('O motivo da movimentação é obrigatório para auditoria.');
      return;
    }

    const prod = produtos.find((p) => p.id === selectedProdutoId);
    if (tipoMov === 'saida' && prod && prod.estoque_atual < quantidade) {
      setError(`Estoque insuficiente! Disponível: ${prod.estoque_atual} un.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await movimentarEstoque({
        produto_id: selectedProdutoId,
        tipo: tipoMov,
        quantidade: Number(quantidade),
        motivo: motivo.trim(),
      });

      setSuccessMsg('Movimentação registrada com sucesso!');
      await loadData();
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg(null);
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar movimentação de estoque.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProdutos = produtos.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(prodSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(prodSearch.toLowerCase());

    if (stockFilter === 'zerado') return matchesSearch && p.estoque_atual === 0;
    if (stockFilter === 'baixo')
      return (
        matchesSearch &&
        p.estoque_atual > 0 &&
        p.estoque_atual <= p.estoque_minimo
      );
    return matchesSearch;
  });

  const filteredMovimentacoes = movimentacoes.filter((m) => {
    if (movFilterType === 'todos') return true;
    return m.tipo === movFilterType;
  });

  const selectedProdObj = produtos.find((p) => p.id === selectedProdutoId);

  return (
    <div className="space-y-8">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl text-[#171717]">
            Controle de Estoque
          </h1>
          <p className="mt-1 text-xs text-[#666666]">
            Rastreabilidade e histórico auditável de entradas, saídas e conferências de saldo.
          </p>
        </div>

        <button
          onClick={() => handleOpenMovementModal()}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Movimentação</span>
        </button>
      </div>

      {/* ================= RESUMO DO ESTOQUE DE PRODUTOS ================= */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
            <Boxes className="h-5 w-5 text-[#B99122]" />
            <span>Saldos de Produtos em Loja</span>
          </h2>

          {/* FILTROS DE ESTOQUE */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStockFilter('todos')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                stockFilter === 'todos'
                  ? 'bg-[#D4AF37] text-[#171717]'
                  : 'border border-[#E2DED4] bg-white text-[#666666] hover:text-[#171717]'
              }`}
            >
              Todos ({produtos.length})
            </button>
            <button
              onClick={() => setStockFilter('baixo')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                stockFilter === 'baixo'
                  ? 'bg-amber-500 text-white'
                  : 'border border-[#E2DED4] bg-white text-[#666666] hover:text-amber-600'
              }`}
            >
              Estoque Baixo (
              {
                produtos.filter(
                  (p) => p.estoque_atual > 0 && p.estoque_atual <= p.estoque_minimo
                ).length
              }
              )
            </button>
            <button
              onClick={() => setStockFilter('zerado')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                stockFilter === 'zerado'
                  ? 'bg-rose-500 text-white'
                  : 'border border-[#E2DED4] bg-white text-[#666666] hover:text-rose-600'
              }`}
            >
              Zerados ({produtos.filter((p) => p.estoque_atual === 0).length})
            </button>
          </div>
        </div>

        {/* LISTAGEM DE SALDOS */}
        <div className="overflow-hidden rounded-3xl border border-[#E2DED4] bg-white shadow-xs">
          <div className="p-4 border-b border-[#E2DED4]">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Filtrar por produto ou código SKU..."
                className="w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] py-2.5 pl-10 pr-4 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2DED4] bg-[#FAF9F6] text-[11px] uppercase tracking-wider text-[#666666]">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-4 py-4">Categoria</th>
                  <th className="px-4 py-4">Estoque Mínimo</th>
                  <th className="px-4 py-4">Saldo Atual</th>
                  <th className="px-4 py-4">Situação</th>
                  <th className="px-6 py-4 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DED4] text-[#171717]">
                {filteredProdutos.map((p) => (
                  <tr key={p.id} className="transition hover:bg-[#FAF9F6]">
                    <td className="px-6 py-4 font-bold text-[#171717]">
                      <div>{p.nome}</div>
                      <div className="text-[10px] text-[#666666]">
                        {p.sku ? `SKU: ${p.sku}` : `Marca: ${p.marca || '-'}`}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-[#666666]">{p.categoria?.nome || '-'}</td>

                    <td className="px-4 py-4 text-[#666666]">{p.estoque_minimo} un</td>

                    <td className="px-4 py-4 font-bold text-base text-[#171717]">
                      {p.estoque_atual} un
                    </td>

                    <td className="px-4 py-4">
                      {p.estoque_atual === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          Esgotado
                        </span>
                      ) : p.estoque_atual <= p.estoque_minimo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          Estoque Baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Normal
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenMovementModal(p.id, 'entrada')}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-xs"
                          title="Dar entrada de estoque"
                        >
                          + Entrada
                        </button>
                        <button
                          onClick={() => handleOpenMovementModal(p.id, 'saida')}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition shadow-xs"
                          title="Registrar saída ou venda balcão"
                        >
                          - Saída
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= HISTÓRICO DE MOVIMENTAÇÕES ================= */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-[#B99122]" />
              <span>Histórico de Movimentações Auditadas</span>
            </h2>
            <p className="text-xs text-[#666666]">
              Registros imutáveis com saldo anterior, quantidade e justificativa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={movFilterType}
              onChange={(e) => setMovFilterType(e.target.value)}
              className="rounded-xl border border-[#E2DED4] bg-white px-3 py-2 text-xs text-[#171717] focus:border-[#D4AF37] shadow-xs"
            >
              <option value="todos">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
              <option value="ajuste">Ajustes</option>
              <option value="devolucao">Devoluções</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#E2DED4] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2DED4] bg-[#FAF9F6] text-[11px] uppercase tracking-wider text-[#666666]">
                <tr>
                  <th className="px-6 py-4">Data / Hora</th>
                  <th className="px-4 py-4">Produto</th>
                  <th className="px-4 py-4">Tipo</th>
                  <th className="px-4 py-4">Qtd</th>
                  <th className="px-4 py-4">Saldo Anterior → Novo</th>
                  <th className="px-6 py-4">Motivo / Justificativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DED4] text-[#171717]">
                {filteredMovimentacoes.map((m) => {
                  const isPositive = m.tipo === 'entrada' || m.tipo === 'devolucao';
                  return (
                    <tr key={m.id} className="transition hover:bg-[#FAF9F6]">
                      <td className="px-6 py-4 font-mono text-[11px] text-[#666666]">
                        {formatDate(m.created_at)}
                      </td>

                      <td className="px-4 py-4 font-bold text-[#171717]">
                        {m.produto?.nome || 'Produto'}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            m.tipo === 'entrada'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.tipo === 'saida'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : m.tipo === 'ajuste'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {m.tipo}
                        </span>
                      </td>

                      <td
                        className={`px-4 py-4 font-black ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${m.quantidade}` : `-${m.quantidade}`}
                      </td>

                      <td className="px-4 py-4 font-mono text-[#666666]">
                        {m.estoque_anterior} →{' '}
                        <strong className="text-[#171717]">{m.estoque_posterior}</strong>
                      </td>

                      <td className="px-6 py-4 text-[#666666]">
                        {m.motivo}
                      </td>
                    </tr>
                  );
                })}

                {filteredMovimentacoes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#666666]">
                      Nenhuma movimentação registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR MOVIMENTAÇÃO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-[#171717]">
              Nova Movimentação de Estoque
            </h2>
            <p className="mt-1 text-xs text-[#666666]">
              Registra uma alteração auditada no saldo do produto.
            </p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveMovement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Selecione o Produto *
                </label>
                <select
                  value={selectedProdutoId}
                  onChange={(e) => setSelectedProdutoId(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Atual: {p.estoque_atual} un)
                    </option>
                  ))}
                </select>
                {selectedProdObj && (
                  <div className="mt-1 text-[11px] text-[#666666]">
                    Saldo atual em sistema: <strong className="text-[#B99122]">{selectedProdObj.estoque_atual} unidades</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Tipo da Movimentação *
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoMov('entrada')}
                    className={`rounded-xl p-2.5 text-xs font-bold transition ${
                      tipoMov === 'entrada'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-[#E2DED4] bg-[#FAF9F6] text-[#666666] hover:text-[#171717]'
                    }`}
                  >
                    + Entrada (Compra/Reposição)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoMov('saida')}
                    className={`rounded-xl p-2.5 text-xs font-bold transition ${
                      tipoMov === 'saida'
                        ? 'bg-rose-600 text-white'
                        : 'border border-[#E2DED4] bg-[#FAF9F6] text-[#666666] hover:text-[#171717]'
                    }`}
                  >
                    - Saída (Venda/Uso em OS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoMov('ajuste')}
                    className={`rounded-xl p-2.5 text-xs font-bold transition ${
                      tipoMov === 'ajuste'
                        ? 'bg-blue-600 text-white'
                        : 'border border-[#E2DED4] bg-[#FAF9F6] text-[#666666] hover:text-[#171717]'
                    }`}
                  >
                    = Ajuste (Inventário)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoMov('devolucao')}
                    className={`rounded-xl p-2.5 text-xs font-bold transition ${
                      tipoMov === 'devolucao'
                        ? 'bg-purple-600 text-white'
                        : 'border border-[#E2DED4] bg-[#FAF9F6] text-[#666666] hover:text-[#171717]'
                    }`}
                  >
                    ↩ Devolução
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  required
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Motivo / Justificativa *
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Compra de lote Fornecedor X, Venda balcão, Uso na OS #1002"
                  required
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#E2DED4] px-4 py-2 text-xs font-semibold text-[#666666] hover:bg-[#FAF9F6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-2.5 text-xs font-bold text-[#171717] hover:bg-[#B99122] hover:text-white shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <span>Confirmar Movimentação</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
