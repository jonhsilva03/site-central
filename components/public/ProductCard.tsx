import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, MessageCircle, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Produto } from '@/lib/supabase/types';
import { formatCurrency, generateWhatsAppLink } from '@/lib/utils';

interface ProductCardProps {
  produto: Produto;
  whatsappPhone?: string;
}

export function ProductCard({ produto, whatsappPhone = '5532935054792' }: ProductCardProps) {
  const inStock = produto.estoque_atual > 0;
  const isLowStock = inStock && produto.estoque_atual <= produto.estoque_minimo;

  const buyMessage = `Olá Central Phones! Tenho interesse no produto: *${produto.nome}* (${formatCurrency(
    produto.preco_venda
  )})${produto.sku ? ` - Cód/SKU: ${produto.sku}` : ''}. Ainda está disponível para compra/retirada?`;

  const whatsappUrl = generateWhatsAppLink(whatsappPhone, buyMessage);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] transition duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:bg-[#292D35] hover:shadow-xl">
      <div>
        {/* IMAGEM DO PRODUTO */}
        <Link
          href={`/produtos/${produto.slug}`}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-[#191C22]"
        >
          {produto.foto_principal ? (
            <Image
              src={produto.foto_principal}
              alt={produto.nome}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#191C22] text-zinc-600">
              <ShoppingBag className="h-16 w-16 text-zinc-600" />
            </div>
          )}

          {/* BADGE DE DESTAQUE */}
          {produto.destaque && (
            <span className="absolute left-3 top-3 rounded-full border border-[#D4AF37]/60 bg-[#111318]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] backdrop-blur-md shadow-sm">
              ★ Destaque
            </span>
          )}

          {/* BADGE DE DISPONIBILIDADE */}
          <div className="absolute right-3 top-3">
            {inStock ? (
              isLowStock ? (
                <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/80 px-2.5 py-1 text-[11px] font-semibold text-amber-300 shadow-sm backdrop-blur-md">
                  <AlertCircle className="h-3 w-3" />
                  Últimas unidades
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 shadow-sm backdrop-blur-md">
                  <CheckCircle2 className="h-3 w-3" />
                  Em estoque
                </span>
              )
            ) : (
              <span className="rounded-full border border-rose-500/40 bg-rose-950/80 px-2.5 py-1 text-[11px] font-semibold text-rose-300 shadow-sm backdrop-blur-md">
                Esgotado
              </span>
            )}
          </div>
        </Link>

        {/* CONTEÚDO */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B6B6B6]">
            <span>{produto.categoria?.nome || 'Geral'}</span>
            {produto.marca && (
              <>
                <span>•</span>
                <span className="text-[#D4AF37]">{produto.marca}</span>
              </>
            )}
          </div>

          <Link href={`/produtos/${produto.slug}`}>
            <h3 className="mt-2 text-base font-bold text-[#F5F5F5] transition group-hover:text-[#D4AF37] line-clamp-2">
              {produto.nome}
            </h3>
          </Link>

          {produto.descricao && (
            <p className="mt-2 text-xs leading-relaxed text-[#B6B6B6] line-clamp-2">
              {produto.descricao}
            </p>
          )}
        </div>
      </div>

      {/* RODAPÉ DO CARD: PREÇO E AÇÃO */}
      <div className="border-t border-[#D4AF37]/15 bg-[#191C22] p-6 pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B6B6B6]">
              Valor à vista
            </span>
            <div className="text-2xl font-black text-[#F5F5F5]">
              {formatCurrency(produto.preco_venda)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] py-3 text-center text-xs font-bold text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-sm"
          >
            <MessageCircle className="h-4 w-4 fill-current" />
            Comprar no WhatsApp
          </a>

          <Link
            href={`/produtos/${produto.slug}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#22252D] text-[#F5F5F5] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            aria-label={`Ver detalhes de ${produto.nome}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
