'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  MessageCircle,
  Wrench,
  X,
} from 'lucide-react';
import {
  getClientes,
  saveCliente,
  deleteCliente,
  getOrdensServico,
} from '@/lib/supabase/data-service';
import { Cliente, OrdemServico } from '@/lib/supabase/types';
import { formatPhone, generateWhatsAppLink, STATUS_OS_LABELS, formatDate } from '@/lib/utils';

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('São João del-Rei');
  const [estado, setEstado] = useState('MG');
  const [observacoes, setObservacoes] = useState('');

  // Modal Histórico de OS
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Cliente | null>(null);

  const loadData = async () => {
    try {
      const [cliList, osList] = await Promise.all([
        getClientes(),
        getOrdensServico(),
      ]);
      setClientes(cliList);
      setOrdens(osList);
    } catch (err) {
      console.error('Error loading clients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenNew = () => {
    setEditingCliente(null);
    setNome('');
    setTelefone('');
    setWhatsapp('');
    setEmail('');
    setCpf('');
    setEndereco('');
    setCidade('São João del-Rei');
    setEstado('MG');
    setObservacoes('');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Cliente) => {
    setEditingCliente(c);
    setNome(c.nome);
    setTelefone(c.telefone || '');
    setWhatsapp(c.whatsapp || '');
    setEmail(c.email || '');
    setCpf(c.cpf || '');
    setEndereco(c.endereco || '');
    setCidade(c.cidade || 'São João del-Rei');
    setEstado(c.estado || 'MG');
    setObservacoes(c.observacoes || '');
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('O nome do cliente é obrigatório.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveCliente({
        id: editingCliente?.id,
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        whatsapp: whatsapp.trim() || telefone.trim() || null,
        email: email.trim() || null,
        cpf: cpf.trim() || null,
        endereco: endereco.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado.trim() || null,
        observacoes: observacoes.trim() || null,
      });

      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar cliente.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Cliente) => {
    const clientOS = ordens.filter((os) => os.cliente_id === c.id);
    if (clientOS.length > 0) {
      alert(
        `Não é possível excluir o cliente "${c.nome}" pois existem ${clientOS.length} ordens de serviço vinculadas ao histórico dele.`
      );
      return;
    }

    if (!confirm(`Deseja realmente excluir o cadastro de ${c.nome}?`)) return;

    try {
      await deleteCliente(c.id);
      await loadData();
    } catch (err) {
      alert('Erro ao excluir cliente.');
    }
  };

  const handleViewHistory = (c: Cliente) => {
    setSelectedClientForHistory(c);
    setHistoryModalOpen(true);
  };

  const filtered = clientes.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.nome.toLowerCase().includes(term) ||
      c.telefone?.includes(term) ||
      c.whatsapp?.includes(term) ||
      c.cpf?.includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  const clientOSList = selectedClientForHistory
    ? ordens.filter((os) => os.cliente_id === selectedClientForHistory.id)
    : [];

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl text-[#171717]">
            Cadastro de Clientes
          </h1>
          <p className="mt-1 text-xs text-[#666666]">
            Base centralizada com histórico de atendimentos, telefones e ordens de serviço.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="rounded-3xl border border-[#E2DED4] bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, WhatsApp, telefone ou CPF..."
            className="w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] py-2.5 pl-10 pr-4 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* TABELA DE CLIENTES */}
      <div className="overflow-hidden rounded-3xl border border-[#E2DED4] bg-white shadow-xs">
        {loading ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            <p className="mt-3 text-xs text-[#666666]">Carregando clientes...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2DED4] bg-[#FAF9F6] text-[11px] uppercase tracking-wider text-[#666666]">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-4 py-4">Contato</th>
                  <th className="px-4 py-4">Localização / CPF</th>
                  <th className="px-4 py-4">Histórico OS</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DED4] text-[#171717]">
                {filtered.map((c) => {
                  const countOS = ordens.filter((os) => os.cliente_id === c.id).length;
                  const zapPhone = c.whatsapp || c.telefone;

                  return (
                    <tr key={c.id} className="transition hover:bg-[#FAF9F6]">
                      <td className="px-6 py-4 font-bold text-[#171717]">
                        <div className="text-sm">{c.nome}</div>
                        {c.observacoes && (
                          <div className="mt-0.5 text-[11px] text-[#666666] font-normal line-clamp-1">
                            Obs: {c.observacoes}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {zapPhone ? (
                            <a
                              href={generateWhatsAppLink(
                                zapPhone,
                                `Olá ${c.nome}! Aqui é da Central Phones.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:underline"
                            >
                              <MessageCircle className="h-3.5 w-3.5 fill-current" />
                              <span>{formatPhone(zapPhone)}</span>
                            </a>
                          ) : (
                            <span className="text-[#888888]">Sem telefone</span>
                          )}

                          {c.email && (
                            <div className="text-[11px] text-[#666666]">{c.email}</div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          {c.cidade ? `${c.cidade} - ${c.estado}` : 'São João del-Rei - MG'}
                        </div>
                        <div className="text-[10px] text-[#666666]">
                          {c.cpf ? `CPF: ${c.cpf}` : c.endereco || '-'}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleViewHistory(c)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2DED4] bg-[#FAF9F6] px-3 py-1 text-[11px] font-semibold text-[#171717] transition hover:border-[#D4AF37] hover:text-[#B99122]"
                        >
                          <Wrench className="h-3.5 w-3.5 text-[#B99122]" />
                          <span>{countOS} OS realizadas</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2DED4] text-[#666666] transition hover:border-[#D4AF37] hover:text-[#171717] bg-white shadow-xs"
                            title="Editar Dados"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2DED4] text-[#666666] transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 bg-white shadow-xs"
                            title="Excluir Cliente"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
            <Users className="mx-auto h-12 w-12 text-[#888888]" />
            <h3 className="mt-4 text-sm font-bold text-[#171717]">Nenhum cliente cadastrado</h3>
          </div>
        )}
      </div>

      {/* MODAL NOVO / EDITAR CLIENTE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2DED4] pb-4">
              <h2 className="text-base font-bold text-[#171717]">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[#666666] hover:text-[#171717]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  required
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#171717]">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(32) 99999-9999"
                    className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717]">
                    Telefone Fixo / Recado
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(32) 3371-0000"
                    className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#171717]">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@email.com"
                    className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717]">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Endereço
                </label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número, Bairro"
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="São João del-Rei"
                    className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717]">
                    UF
                  </label>
                  <input
                    type="text"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="MG"
                    maxLength={2}
                    className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Observações Internas
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Preferências, histórico de contato, orientações..."
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
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-2 text-xs font-bold text-[#171717] hover:bg-[#B99122] hover:text-white shadow-xs disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Cliente</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO DE OS */}
      {historyModalOpen && selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2DED4] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#171717]">
                  Histórico de Serviços de {selectedClientForHistory.nome}
                </h2>
                <p className="text-xs text-[#666666]">
                  {clientOSList.length} ordens de serviço registradas
                </p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="rounded-lg p-1 text-[#666666] hover:text-[#171717]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
              {clientOSList.map((os) => {
                const statusCfg = STATUS_OS_LABELS[os.status];
                return (
                  <Link
                    key={os.id}
                    href={`/admin/ordens-servico/${os.id}`}
                    className="flex items-center justify-between rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-4 transition hover:border-[#D4AF37]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#B99122]">
                          #{os.numero_os}
                        </span>
                        <span className="font-semibold text-xs text-[#171717]">
                          {os.tipo_aparelho} - {os.modelo || os.marca || ''}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#666666] line-clamp-1">
                        Defeito: {os.defeito_relatado}
                      </p>
                      <div className="mt-1 text-[10px] text-[#888888]">
                        Entrada em: {formatDate(os.data_entrada)}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {clientOSList.length === 0 && (
                <div className="py-12 text-center text-xs text-[#888888]">
                  Nenhuma ordem de serviço cadastrada para este cliente.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="rounded-xl border border-[#E2DED4] px-5 py-2 text-xs font-semibold text-[#666666] hover:bg-[#FAF9F6]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
