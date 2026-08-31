'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Boxes,
  AlertTriangle,
  DollarSign,
  Wrench,
  Clock,
  CheckCircle2,
  Plus,
  Loader2,
} from 'lucide-react';
import {
  getProdutos,
  getOrdensServico,
  getMovimentacoes,
} from '@/lib/supabase/data-service';
import { Produto, OrdemServico, MovimentacaoEstoque } from '@/lib/supabase/types';
import { formatCurrency, formatDate, STATUS_OS_LABELS } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prods, osList, movs] = await Promise.all([
          getProdutos({ onlyActive: false }),
          getOrdensServico(),
          getMovimentacoes(),
        ]);
        setProdutos(prods);
        setOrdens(osList);
        setMovimentacoes(movs.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
        <p className="mt-4 text-sm text-zinc-400">Carregando indicadores do painel...</p>
      </div>
    );
  }

  // Cálculos de estoque e produtos
  const totalProdutos = produtos.length;
  const totalItensEstoque = produtos.reduce((acc, p) => acc + (p.estoque_atual || 0), 0);
  const produtosSemEstoque = produtos.filter((p) => p.estoque_atual === 0).length;
  const produtosEstoqueBaixo = produtos.filter(
    (p) => p.estoque_atual > 0 && p.estoque_atual <= p.estoque_minimo
  ).length;

  const valorTotalVendaEstoque = produtos.reduce(
    (acc, p) => acc + (p.estoque_atual || 0) * (p.preco_venda || 0),
    0
  );
  const valorTotalCustoEstoque = produtos.reduce(
    (acc, p) => acc + (p.estoque_atual || 0) * (p.preco_custo || 0),
    0
  );

  // Cálculos de Ordens de Serviço
  const osAbertas = ordens.filter(
    (os) => !['entregue', 'cancelada'].includes(os.status)
  ).length;
  const osAguardandoAprovacao = ordens.filter(
    (os) => os.status === 'aguardando_aprovacao'
  ).length;
  const osProntas = ordens.filter((os) => os.status === 'pronta').length;

  return (
    <div className="space-y-8">
      {/* CABEÇALHO DO DASHBOARD */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl text-[#171717]">
            Painel Geral
          </h1>
          <p className="mt-1 text-xs text-[#666666]">
            Visão consolidada de estoque, serviços e movimentações da Central Phones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/ordens-servico/nova"
            className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nova OS</span>
          </Link>
          <Link
            href="/admin/produtos/novo"
            className="flex items-center gap-2 rounded-xl border border-[#E2DED4] bg-white px-4 py-2.5 text-xs font-bold text-[#171717] transition hover:border-[#D4AF37] hover:text-[#B99122] shadow-xs"
          >
            <Package className="h-4 w-4 text-[#B99122]" />
            <span>Cadastrar Produto</span>
          </Link>
        </div>
      </div>

      {/* ================= CARDS DE INDICADORES PRINCIPAIS ================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL PRODUTOS */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Catálogo
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#B99122]">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-[#171717]">{totalProdutos}</div>
          <div className="mt-1 text-xs text-[#666666]">
            {produtos.filter((p) => p.ativo).length} ativos no site
          </div>
        </div>

        {/* QUANTIDADE EM ESTOQUE */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Total em Estoque
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-[#171717]">{totalItensEstoque}</div>
          <div className="mt-1 text-xs text-[#666666]">
            unidades físicas disponíveis
          </div>
        </div>

        {/* ESTOQUE BAIXO / ZERADO */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Atenção ao Estoque
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-amber-600">
              {produtosEstoqueBaixo}
            </span>
            <span className="text-xs text-[#666666]">baixo</span>
            <span className="text-zinc-300">/</span>
            <span className="text-3xl font-black text-rose-600">
              {produtosSemEstoque}
            </span>
            <span className="text-xs text-[#666666]">zerado</span>
          </div>
          <div className="mt-1 text-xs text-[#666666]">
            requer reposição
          </div>
        </div>

        {/* VALOR ESTIMADO DO ESTOQUE */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Patrimônio em Estoque
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-emerald-700">
            {formatCurrency(valorTotalVendaEstoque)}
          </div>
          <div className="mt-1 text-xs text-[#666666]">
            Custo: {formatCurrency(valorTotalCustoEstoque)}
          </div>
        </div>
      </div>

      {/* ================= INDICADORES DE ORDENS DE SERVIÇO ================= */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* OS ABERTAS */}
        <div className="flex items-center justify-between rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              OS em Aberto
            </div>
            <div className="mt-2 text-3xl font-black text-[#171717]">{osAbertas}</div>
            <p className="mt-1 text-xs text-[#666666]">aparelhos em bancada</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Wrench className="h-6 w-6" />
          </div>
        </div>

        {/* OS AGUARDANDO APROVAÇÃO */}
        <div className="flex items-center justify-between rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Aguardando Aprovação
            </div>
            <div className="mt-2 text-3xl font-black text-orange-600">
              {osAguardandoAprovacao}
            </div>
            <p className="mt-1 text-xs text-[#666666]">orçamentos enviados</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* OS PRONTAS */}
        <div className="flex items-center justify-between rounded-3xl border border-[#D4AF37]/50 bg-amber-50/40 p-6 shadow-xs">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#B99122]">
              Prontas para Retirada
            </div>
            <div className="mt-2 text-3xl font-black text-[#B99122]">
              {osProntas}
            </div>
            <p className="mt-1 text-xs text-[#666666]">avise o cliente no WhatsApp</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-[#B99122]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ================= DUAS COLUNAS: ORDENS RECENTES & MOVIMENTAÇÕES ================= */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* ORDENS DE SERVIÇO RECENTES */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2DED4] pb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#B99122]" />
              <h2 className="text-base font-bold text-[#171717]">Ordens de Serviço Recentes</h2>
            </div>
            <Link
              href="/admin/ordens-servico"
              className="text-xs font-semibold text-[#B99122] hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[#E2DED4]/60">
            {ordens.slice(0, 5).map((os) => {
              const statusCfg = STATUS_OS_LABELS[os.status];
              return (
                <Link
                  key={os.id}
                  href={`/admin/ordens-servico/${os.id}`}
                  className="flex items-center justify-between py-3.5 transition hover:bg-[#FAF9F6] px-2 rounded-xl"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#B99122]">
                        #{os.numero_os}
                      </span>
                      <span className="truncate text-xs font-semibold text-[#171717]">
                        {os.cliente?.nome || 'Cliente'}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-[#666666] truncate">
                      {os.tipo_aparelho} • {os.modelo || os.marca || 'Sem modelo'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                    <div className="mt-1 text-[10px] text-[#666666]">
                      {formatDate(os.data_entrada)}
                    </div>
                  </div>
                </Link>
              );
            })}

            {ordens.length === 0 && (
              <div className="py-8 text-center text-xs text-[#666666]">
                Nenhuma ordem de serviço cadastrada.
              </div>
            )}
          </div>
        </div>

        {/* MOVIMENTAÇÕES DE ESTOQUE RECENTES */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2DED4] pb-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[#B99122]" />
              <h2 className="text-base font-bold text-[#171717]">Últimas Movimentações</h2>
            </div>
            <Link
              href="/admin/estoque"
              className="text-xs font-semibold text-[#B99122] hover:underline"
            >
              Ver estoque →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[#E2DED4]/60">
            {movimentacoes.map((mov) => {
              const isPositive = mov.tipo === 'entrada' || mov.tipo === 'devolucao';
              return (
                <div
                  key={mov.id}
                  className="flex items-center justify-between py-3.5 px-2"
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-xs font-bold text-[#171717]">
                      {mov.produto?.nome || 'Produto'}
                    </p>
                    <p className="text-[11px] text-[#666666]">
                      Motivo: <span className="text-[#171717]">{mov.motivo}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-black ${
                        isPositive ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${mov.quantidade}` : `-${mov.quantidade}`}
                    </span>
                    <div className="text-[10px] text-[#666666]">
                      {mov.estoque_anterior} → {mov.estoque_posterior}
                    </div>
                  </div>
                </div>
              );
            })}

            {movimentacoes.length === 0 && (
              <div className="py-8 text-center text-xs text-[#666666]">
                Nenhuma movimentação registrada recentemente.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
