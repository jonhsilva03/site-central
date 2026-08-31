'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Search,
  MessageCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import { getOrdensServico } from '@/lib/supabase/data-service';
import { OrdemServico, StatusOS } from '@/lib/supabase/types';
import {
  formatCurrency,
  formatDate,
  formatPhone,
  generateWhatsAppLink,
  STATUS_OS_LABELS,
} from '@/lib/utils';

export default function AdminOrdensServicoPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');

  const loadData = async () => {
    try {
      const data = await getOrdensServico();
      setOrdens(data);
    } catch (err) {
      console.error('Error loading service orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = ordens.filter((os) => {
    const term = search.toLowerCase();
    const matchesSearch =
      os.numero_os.toString().includes(term) ||
      os.cliente?.nome.toLowerCase().includes(term) ||
      os.modelo?.toLowerCase().includes(term) ||
      os.marca?.toLowerCase().includes(term) ||
      os.imei_serial?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'todas' || os.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl text-[#171717]">
            Ordens de Serviço
          </h1>
          <p className="mt-1 text-xs text-[#666666]">
            Controle de bancada, diagnósticos técnicos, prazos, orçamentos e notificações por WhatsApp.
          </p>
        </div>

        <Link
          href="/admin/ordens-servico/nova"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Abrir Nova OS</span>
        </Link>
      </div>

      {/* BARRA DE PESQUISA & FILTROS DE STATUS */}
      <div className="space-y-3 rounded-3xl border border-[#E2DED4] bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por Nº da OS, nome do cliente, modelo do aparelho ou IMEI/Série..."
            className="w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] py-2.5 pl-10 pr-4 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
          />
        </div>

        {/* CHIPS DE STATUS */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setStatusFilter('todas')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'todas'
                ? 'bg-[#D4AF37] text-[#171717]'
                : 'border border-[#E2DED4] bg-white text-[#666666] hover:text-[#171717]'
            }`}
          >
            Todas ({ordens.length})
          </button>

          {(Object.keys(STATUS_OS_LABELS) as StatusOS[]).map((st) => {
            const count = ordens.filter((o) => o.status === st).length;
            if (count === 0 && statusFilter !== st) return null;
            const cfg = STATUS_OS_LABELS[st];

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-[#171717] text-white'
                    : 'border border-[#E2DED4] bg-white text-[#666666] hover:text-[#171717]'
                }`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* TABELA DE ORDENS DE SERVIÇO */}
      <div className="overflow-hidden rounded-3xl border border-[#E2DED4] bg-white shadow-xs">
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#B99122]" />
            <p className="mt-3 text-xs text-[#666666]">Carregando ordens de serviço...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2DED4] bg-[#FAF9F6] text-[11px] uppercase tracking-wider text-[#666666]">
                <tr>
                  <th className="px-6 py-4">OS / Data</th>
                  <th className="px-4 py-4">Cliente / Contato</th>
                  <th className="px-4 py-4">Aparelho & Defeito</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Valor Total</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DED4] text-[#171717]">
                {filtered.map((os) => {
                  const statusCfg = STATUS_OS_LABELS[os.status];
                  const zapPhone = os.cliente?.whatsapp || os.cliente?.telefone;

                  return (
                    <tr key={os.id} className="transition hover:bg-[#FAF9F6]">
                      {/* NÚMERO E DATA */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/ordens-servico/${os.id}`}
                          className="font-black text-sm text-[#B99122] hover:underline"
                        >
                          #{os.numero_os}
                        </Link>
                        <div className="mt-0.5 text-[10px] text-[#666666]">
                          {formatDate(os.data_entrada)}
                        </div>
                      </td>

                      {/* CLIENTE */}
                      <td className="px-4 py-4 font-semibold text-[#171717]">
                        <div>{os.cliente?.nome || 'Cliente não identificado'}</div>
                        {zapPhone && (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            {formatPhone(zapPhone)}
                          </div>
                        )}
                      </td>

                      {/* APARELHO */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-[#171717]">
                          {os.tipo_aparelho} • {os.modelo || os.marca || 'Sem modelo'}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#666666] line-clamp-1">
                          {os.defeito_relatado}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* VALOR */}
                      <td className="px-4 py-4 font-bold text-[#B99122]">
                        {formatCurrency(os.valor_total || 0)}
                      </td>

                      {/* AÇÕES */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {zapPhone && (
                            <a
                              href={generateWhatsAppLink(
                                zapPhone,
                                `Olá ${os.cliente?.nome}! Atualização da sua OS #${os.numero_os} na Central Phones: O status atual é *${statusCfg.label}*.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
                              title="Avisar no WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5 fill-current" />
                            </a>
                          )}

                          <Link
                            href={`/admin/ordens-servico/${os.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2DED4] text-[#666666] transition hover:border-[#D4AF37] hover:text-[#B99122] hover:bg-[#FAF9F6]"
                            title="Ver Detalhes / Imprimir"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Wrench className="mx-auto h-12 w-12 text-[#888888]" />
            <h3 className="mt-4 text-sm font-bold text-[#171717]">Nenhuma ordem de serviço encontrada</h3>
            <p className="mt-1 text-xs text-[#666666]">
              Abra uma nova OS ao receber um aparelho para conserto ou manutenção.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
