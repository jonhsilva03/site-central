'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Loader2, RotateCcw, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { FloatingWhatsApp } from '@/components/public/FloatingWhatsApp';
import { ProductCard } from '@/components/public/ProductCard';
import { getCategorias, getConfiguracoes, getProdutos } from '@/lib/supabase/data-service';
import { Categoria, ConfiguracoesSite, Produto } from '@/lib/supabase/types';

export default function ProdutosPage() {
  const [config, setConfig] = useState<ConfiguracoesSite | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [configData, catsData] = await Promise.all([
          getConfiguracoes(),
          getCategorias(true),
        ]);
        setConfig(configData);
        setCategorias(catsData);
      } catch (err) {
        console.error('Error loading config/categories', err);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const prods = await getProdutos({
          categoriaSlug: selectedCategoria !== 'todas' ? selectedCategoria : undefined,
          search: search.trim() || undefined,
          inStockOnly: onlyInStock,
          onlyActive: true,
        });
        setProdutos(prods);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, selectedCategoria, onlyInStock]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategoria('todas');
    setOnlyInStock(false);
  };

  const whatsappPhone = config?.whatsapp || '5532935054792';

  return (
    <main className="min-h-screen bg-[#111318] text-[#F5F5F5] selection:bg-[#D4AF37] selection:text-[#111318]">
      <Header config={config || undefined} />

      {/* CABEÇALHO DO CATÁLOGO */}
      <section className="border-b border-[#D4AF37]/20 bg-gradient-to-b from-[#111318] via-[#191C22] to-[#111318] px-4 sm:px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B6B6B6] transition hover:text-[#D4AF37]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar para Início</span>
            </Link>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Loja Central Phones
                </div>
                <h1 className="mt-2 text-3xl font-black text-[#F5F5F5] sm:text-4xl md:text-5xl">
                  Catálogo de Produtos
                </h1>
                <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[#B6B6B6]">
                  Smartphones novos e seminovos com garantia, eletrônicos, peças e os melhores acessórios com atendimento direto pelo WhatsApp.
                </p>
              </div>

              <div className="text-xs text-[#B6B6B6]">
                Mostrando <strong className="text-[#D4AF37]">{produtos.length}</strong> produtos
              </div>
            </div>
          </div>

          {/* BARRA DE PESQUISA E FILTROS */}
          <div className="mt-8 grid gap-4 rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-4 shadow-xl lg:grid-cols-12 lg:items-center">
            {/* INPUT DE PESQUISA */}
            <div className="relative lg:col-span-6">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por modelo, marca (ex: iPhone, Samsung, Cabo)..."
                className="w-full rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] py-3 pl-11 pr-4 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* SELETOR DE CATEGORIAS */}
            <div className="lg:col-span-4">
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] px-4 py-3 text-sm text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="todas">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.slug} className="bg-[#191C22] text-[#F5F5F5]">
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* CHECKBOX EM ESTOQUE & LIMPAR */}
            <div className="flex items-center justify-between gap-3 lg:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#F5F5F5]">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-[#191C22] text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Em estoque</span>
              </label>

              {(search || selectedCategoria !== 'todas' || onlyInStock) && (
                <button
                  onClick={handleResetFilters}
                  title="Limpar filtros"
                  className="flex items-center gap-1 text-xs text-[#D4AF37] hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ÁREA DE RESULTADOS DO CATÁLOGO */}
      <section className="px-4 sm:px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
              <p className="mt-4 text-xs text-[#B6B6B6]">Carregando catálogo de produtos...</p>
            </div>
          ) : produtos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {produtos.map((produto) => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                  whatsappPhone={whatsappPhone}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-8 text-center shadow-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#D4AF37]/20 bg-[#191C22] text-[#B6B6B6]">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-[#F5F5F5]">Nenhum produto encontrado</h3>
              <p className="mt-2 max-w-md text-xs text-[#B6B6B6]">
                Tente ajustar os termos de pesquisa ou remover os filtros de categoria para visualizar outros itens disponíveis.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 rounded-full bg-[#D4AF37] px-6 py-2.5 text-xs font-bold text-[#111318] transition hover:bg-[#A98220] hover:text-white"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer config={config || undefined} />
      <FloatingWhatsApp phone={whatsappPhone} />
    </main>
  );
}
