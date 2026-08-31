'use client';

import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';
import {
  getCategorias,
  saveCategoria,
  deleteCategoria,
  getProdutos,
} from '@/lib/supabase/data-service';
import { Categoria, Produto } from '@/lib/supabase/types';
import { slugify } from '@/lib/utils';

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);

  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        getCategorias(false),
        getProdutos({ onlyActive: false }),
      ]);
      setCategorias(cats);
      setProdutos(prods);
    } catch (err) {
      console.error('Error loading categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenNew = () => {
    setEditingCat(null);
    setNome('');
    setSlug('');
    setDescricao('');
    setAtivo(true);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Categoria) => {
    setEditingCat(cat);
    setNome(cat.nome);
    setSlug(cat.slug);
    setDescricao(cat.descricao || '');
    setAtivo(cat.ativo);
    setError(null);
    setModalOpen(true);
  };

  const handleNomeChange = (val: string) => {
    setNome(val);
    if (!editingCat) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      setError('O nome da categoria é obrigatório.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveCategoria({
        id: editingCat?.id,
        nome,
        slug: slugify(slug || nome),
        descricao: descricao || null,
        ativo,
      });
      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar categoria.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Categoria) => {
    const attachedCount = produtos.filter((p) => p.categoria_id === cat.id).length;
    if (attachedCount > 0) {
      alert(`Não é possível excluir: existem ${attachedCount} produtos vinculados a esta categoria.`);
      return;
    }

    if (!confirm(`Deseja realmente excluir a categoria "${cat.nome}"?`)) return;

    try {
      await deleteCategoria(cat.id);
      await loadData();
    } catch (err: unknown) {
      alert('Erro ao excluir categoria.');
    }
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl text-[#171717]">
            Categorias de Produtos
          </h1>
          <p className="mt-1 text-xs text-[#666666]">
            Organize os produtos da loja em departamentos e facilite a busca para os clientes.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* LISTAGEM */}
      <div className="overflow-hidden rounded-3xl border border-[#E2DED4] bg-white shadow-xs">
        {loading ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            <p className="mt-3 text-xs text-[#666666]">Carregando categorias...</p>
          </div>
        ) : categorias.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2DED4] bg-[#FAF9F6] text-[11px] uppercase tracking-wider text-[#666666]">
                <tr>
                  <th className="px-6 py-4">Nome da Categoria</th>
                  <th className="px-4 py-4">Slug URL</th>
                  <th className="px-4 py-4">Produtos Vinculados</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DED4] text-[#171717]">
                {categorias.map((cat) => {
                  const prodCount = produtos.filter(
                    (p) => p.categoria_id === cat.id
                  ).length;

                  return (
                    <tr key={cat.id} className="transition hover:bg-[#FAF9F6]">
                      <td className="px-6 py-4 font-bold text-[#171717]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#B99122]">
                            <Layers className="h-4 w-4" />
                          </div>
                          <span>{cat.nome}</span>
                        </div>
                        {cat.descricao && (
                          <div className="mt-1 text-[11px] text-[#666666] font-normal">
                            {cat.descricao}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-[#666666] font-mono text-[11px]">
                        {cat.slug}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF9F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#666666] border border-[#E2DED4]">
                          <Package className="h-3 w-3 text-[#B99122]" />
                          {prodCount} itens
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            cat.ativo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                          }`}
                        >
                          {cat.ativo ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2DED4] bg-white text-[#666666] transition hover:border-[#D4AF37] hover:text-[#171717] shadow-xs"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2DED4] bg-white text-[#666666] transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 shadow-xs"
                            title="Excluir"
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
            <Layers className="mx-auto h-12 w-12 text-[#666666]" />
            <h3 className="mt-4 text-sm font-bold text-[#171717]">Nenhuma categoria cadastrada</h3>
          </div>
        )}
      </div>

      {/* MODAL CRIAR / EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2DED4] pb-4">
              <h2 className="text-base font-bold text-[#171717]">
                {editingCat ? 'Editar Categoria' : 'Nova Categoria'}
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
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Ex: Celulares & Smartphones"
                  required
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Slug URL *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="celulares-smartphones"
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#666666] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717]">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Breve resumo sobre a categoria..."
                  className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E2DED4] text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span className="text-xs font-semibold text-[#171717]">
                  Categoria ativa no catálogo
                </span>
              </label>

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
                    <span>Salvar Categoria</span>
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
