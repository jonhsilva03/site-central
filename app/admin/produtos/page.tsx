'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  Star,
  ShoppingBag,
} from 'lucide-react';
import { getProdutos, deleteProduto, saveProduto, getCategorias } from '@/lib/supabase/data-service';
import { Categoria, Produto } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils';

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('todas');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProdutos({ onlyActive: false }),
        getCategorias(false),
      ]);
      setProdutos(prods);
      setCategorias(cats);
    } catch (err) {
      console.error('Error loading products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (produto: Produto) => {
    try {
      await saveProduto({
        ...produto,
        ativo: !produto.ativo,
      });
      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? { ...p, ativo: !p.ativo } : p))
      );
    } catch (err) {
      console.error('Error toggling product status', err);
    }
  };

  const handleToggleDestaque = async (produto: Produto) => {
    try {
      await saveProduto({
        ...produto,
        destaque: !produto.destaque,
      });
      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? { ...p, destaque: !p.destaque } : p))
      );
    } catch (err) {
      console.error('Error toggling highlight status', err);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteProduto(deletingId);
      setProdutos((prev) => prev.filter((p) => p.id !== deletingId));
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting product', err);
    }
  };

  const filtered = produtos.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.marca?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCat === 'todas' || p.categoria_id === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl text-[#171717]">
            Cadastro de Produtos
          </h1>
          <p className="mt-1 text-xs text-[#666666]">
            Gerencie itens, fotos, preços e disponibilidade no catálogo da Central Phones.
          </p>
        </div>

        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Produto</span>
        </Link>
      </div>

      {/* BARRA DE PESQUISA & FILTRO */}
      <div className="grid gap-3 rounded-3xl border border-[#E2DED4] bg-white p-4 sm:grid-cols-12 shadow-xs">
        <div className="relative sm:col-span-8">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, marca ou SKU..."
            className="w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] py-2.5 pl-10 pr-4 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] px-3 py-2.5 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
          >
            <option value="todas">Todas as Categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABELA DE PRODUTOS */}
      <div className="overflow-hidden rounded-3xl border border-[#E2DED4] bg-white shadow-xs">
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            <p className="mt-3 text-xs text-[#666666]">Carregando produtos...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2DED4] bg-[#FAF9F6] text-[11px] uppercase tracking-wider text-[#666666]">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-4 py-4">Categoria / Marca</th>
                  <th className="px-4 py-4">Preço Venda</th>
                  <th className="px-4 py-4">Estoque</th>
                  <th className="px-4 py-4">Destaque</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DED4] text-[#171717]">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="transition hover:bg-[#FAF9F6]">
                    {/* FOTO E NOME */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#E2DED4] bg-[#FAF9F6]">
                          {prod.foto_principal ? (
                            <Image
                              src={prod.foto_principal}
                              alt={prod.nome}
                              fill
                              sizes="48px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#666666]">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/produtos/${prod.id}`}
                            className="font-bold text-[#171717] hover:text-[#B99122] line-clamp-1"
                          >
                            {prod.nome}
                          </Link>
                          <div className="text-[10px] text-[#666666]">
                            {prod.sku ? `SKU: ${prod.sku}` : `Slug: ${prod.slug}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORIA */}
                    <td className="px-4 py-4">
                      <div className="font-medium text-[#171717]">{prod.categoria?.nome || 'Sem categoria'}</div>
                      <div className="text-[10px] text-[#666666]">{prod.marca || '-'}</div>
                    </td>

                    {/* PREÇO */}
                    <td className="px-4 py-4 font-bold text-[#B99122]">
                      {formatCurrency(prod.preco_venda)}
                    </td>

                    {/* ESTOQUE */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          prod.estoque_atual === 0
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : prod.estoque_atual <= prod.estoque_minimo
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {prod.estoque_atual} un
                      </span>
                    </td>

                    {/* DESTAQUE TOGGLE */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleDestaque(prod)}
                        title="Alternar destaque na página inicial"
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                          prod.destaque
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#B99122]'
                            : 'border-[#E2DED4] text-[#888888] hover:text-[#171717]'
                        }`}
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </td>

                    {/* ATIVO TOGGLE */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                          prod.ativo
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        }`}
                      >
                        {prod.ativo ? 'Ativo no site' : 'Inativo'}
                      </button>
                    </td>

                    {/* AÇÕES */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/produtos/${prod.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2DED4] text-[#666666] transition hover:border-[#D4AF37] hover:text-[#B99122]"
                          title="Editar Produto"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setDeletingId(prod.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2DED4] text-[#666666] transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                          title="Excluir Produto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-[#666666]" />
            <h3 className="mt-4 text-sm font-bold text-[#171717]">Nenhum produto encontrado</h3>
            <p className="mt-1 text-xs text-[#666666]">
              Cadastre produtos para exibi-los no catálogo da Central Phones.
            </p>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-[#E2DED4] bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#171717]">
              Excluir este produto?
            </h3>
            <p className="mt-2 text-xs text-[#666666]">
              Esta ação removerá o produto e suas fotos. Se houver histórico de movimentações, ele será desativado com segurança.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-xl border border-[#E2DED4] px-4 py-2 text-xs font-semibold text-[#666666] hover:bg-[#FAF9F6]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
