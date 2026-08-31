'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { FloatingWhatsApp } from '@/components/public/FloatingWhatsApp';
import { ProductCard } from '@/components/public/ProductCard';
import { getConfiguracoes, getProdutoBySlug, getProdutos } from '@/lib/supabase/data-service';
import { ConfiguracoesSite, Produto } from '@/lib/supabase/types';
import { formatCurrency, generateWhatsAppLink } from '@/lib/utils';

export default function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [config, setConfig] = useState<ConfiguracoesSite | null>(null);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [relacionados, setRelacionados] = useState<Produto[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [configData, prodData] = await Promise.all([
          getConfiguracoes(),
          getProdutoBySlug(slug),
        ]);

        setConfig(configData);
        setProduto(prodData);

        if (prodData) {
          setSelectedImage(prodData.foto_principal || null);
          // Buscar relacionados da mesma categoria
          const rels = await getProdutos({
            categoriaId: prodData.categoria_id || undefined,
            onlyActive: true,
          });
          setRelacionados(rels.filter((p) => p.id !== prodData.id).slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading product details', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#111318] text-[#F5F5F5]">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
        <p className="mt-4 text-xs text-[#B6B6B6]">Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <main className="min-h-screen bg-[#111318] text-[#F5F5F5]">
        <Header config={config || undefined} />
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-zinc-600" />
          <h1 className="mt-6 text-3xl font-black text-[#F5F5F5]">Produto não encontrado</h1>
          <p className="mt-2 text-xs text-[#B6B6B6]">
            O produto procurado pode ter sido removido ou o endereço digitado está incorreto.
          </p>
          <Link
            href="/produtos"
            className="mt-8 rounded-full bg-[#D4AF37] px-8 py-3 text-xs font-bold text-[#111318] hover:bg-[#A98220] hover:text-white"
          >
            Ver todos os produtos
          </Link>
        </div>
        <Footer config={config || undefined} />
      </main>
    );
  }

  const inStock = produto.estoque_atual > 0;
  const isLowStock = inStock && produto.estoque_atual <= produto.estoque_minimo;
  const whatsappPhone = config?.whatsapp || '5532935054792';

  const buyMessage = `Olá Central Phones! Gostaria de comprar o produto: *${produto.nome}* no valor de *${formatCurrency(
    produto.preco_venda
  )}* (SKU: ${produto.sku || 'N/A'}). Como faço para retirar ou combinar a entrega?`;

  const whatsappBuyUrl = generateWhatsAppLink(whatsappPhone, buyMessage);

  // Lista de imagens combinando foto principal e galeria
  const allImages: string[] = [];
  if (produto.foto_principal) allImages.push(produto.foto_principal);
  if (produto.imagens && produto.imagens.length > 0) {
    produto.imagens.forEach((img) => {
      if (!allImages.includes(img.url)) {
        allImages.push(img.url);
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#111318] text-[#F5F5F5] selection:bg-[#D4AF37] selection:text-[#111318]">
      <Header config={config || undefined} />

      {/* MIGALHAS / VOLTAR */}
      <div className="border-b border-[#D4AF37]/20 bg-[#191C22] px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs text-[#B6B6B6]">
          <Link href="/" className="hover:text-[#D4AF37]">
            Início
          </Link>
          <span>/</span>
          <Link href="/produtos" className="hover:text-[#D4AF37]">
            Catálogo
          </Link>
          <span>/</span>
          <span className="truncate text-[#D4AF37] font-semibold">{produto.nome}</span>
        </div>
      </div>

      {/* DETALHES DO PRODUTO */}
      <section className="px-4 sm:px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LADO ESQUERDO: GALERIA DE FOTOS */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#191C22] shadow-xl">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={produto.nome}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-4"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-600">
                    <ShoppingBag className="h-20 w-20" />
                  </div>
                )}

                {/* BADGE DE DISPONIBILIDADE */}
                <div className="absolute right-4 top-4">
                  {inStock ? (
                    isLowStock ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/80 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-sm backdrop-blur-md">
                        <AlertCircle className="h-4 w-4" />
                        Últimas {produto.estoque_atual} unidades!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 shadow-sm backdrop-blur-md">
                        <CheckCircle2 className="h-4 w-4" />
                        {produto.estoque_atual} em estoque
                      </span>
                    )
                  ) : (
                    <span className="rounded-full border border-rose-500/40 bg-rose-950/80 px-3.5 py-1.5 text-xs font-semibold text-rose-300 shadow-sm backdrop-blur-md">
                      Indisponível no momento
                    </span>
                  )}
                </div>
              </div>

              {/* MINIATURAS SE HOUVER MAIS DE 1 FOTO */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition ${
                        selectedImage === imgUrl
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 bg-[#22252D]'
                          : 'border-[#D4AF37]/20 bg-[#191C22] hover:border-[#D4AF37]/60'
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Foto ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LADO DIREITO: INFORMAÇÕES, PREÇO & CTA */}
            <div className="flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                {/* CATEGORIA E MARCA */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B6B6B6]">
                  <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-[#D4AF37]">
                    {produto.categoria?.nome || 'Geral'}
                  </span>
                  {produto.marca && (
                    <span className="rounded-full border border-[#D4AF37]/20 bg-[#22252D] px-3 py-1 text-[#F5F5F5]">
                      {produto.marca}
                    </span>
                  )}
                  {produto.sku && (
                    <span className="text-[#B6B6B6]">SKU: {produto.sku}</span>
                  )}
                </div>

                {/* TÍTULO */}
                <h1 className="text-3xl font-black sm:text-4xl text-[#F5F5F5]">
                  {produto.nome}
                </h1>

                {/* PREÇO */}
                <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-6 shadow-xl">
                  <div className="text-xs uppercase tracking-wider text-[#B6B6B6]">
                    Valor especial para pagamento à vista
                  </div>
                  <div className="mt-2 text-4xl font-black text-[#F5F5F5]">
                    {formatCurrency(produto.preco_venda)}
                  </div>
                  <p className="mt-1 text-xs text-[#B6B6B6]">
                    Consulte condições especiais de parcelamento no cartão ou entrega via WhatsApp.
                  </p>
                </div>

                {/* BOTÃO WHATSAPP COMPRAR */}
                <div className="pt-2">
                  <a
                    href={whatsappBuyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#D4AF37] py-4 text-center text-base font-bold text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-lg"
                  >
                    <MessageCircle className="h-5 w-5 fill-current" />
                    <span>Comprar pelo WhatsApp</span>
                  </a>
                </div>

                {/* DESCRIÇÃO */}
                {produto.descricao && (
                  <div className="space-y-3 pt-4 border-t border-[#D4AF37]/20">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      Descrição & Detalhes
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#B6B6B6] whitespace-pre-line">
                      {produto.descricao}
                    </p>
                  </div>
                )}

                {/* GARANTIAS / BENEFÍCIOS */}
                <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 border-t border-[#D4AF37]/20">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#D4AF37]/20 bg-[#22252D] p-4 shadow-sm">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-[#D4AF37]" />
                    <div className="text-xs">
                      <p className="font-bold text-[#F5F5F5]">Garantia Balcão</p>
                      <p className="text-[#B6B6B6]">Aparelhos e peças testados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#D4AF37]/20 bg-[#22252D] p-4 shadow-sm">
                    <Truck className="h-5 w-5 shrink-0 text-[#D4AF37]" />
                    <div className="text-xs">
                      <p className="font-bold text-[#F5F5F5]">Retirada ou Delivery</p>
                      <p className="text-[#B6B6B6]">Matozinhos - São João del-Rei</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUTOS RELACIONADOS */}
          {relacionados.length > 0 && (
            <div className="mt-20 border-t border-[#D4AF37]/20 pt-14">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                    Você também pode se interessar
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-[#F5F5F5] sm:text-3xl">
                    Produtos Relacionados
                  </h2>
                </div>
                <Link
                  href="/produtos"
                  className="text-xs font-bold text-[#D4AF37] hover:underline"
                >
                  Ver todos →
                </Link>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relacionados.map((rel) => (
                  <ProductCard
                    key={rel.id}
                    produto={rel}
                    whatsappPhone={whatsappPhone}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer config={config || undefined} />
      <FloatingWhatsApp phone={whatsappPhone} />
    </main>
  );
}
