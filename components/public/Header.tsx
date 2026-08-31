'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, MessageCircle, ShoppingBag, Truck } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';
import { ConfiguracoesSite } from '@/lib/supabase/types';

interface HeaderProps {
  config?: ConfiguracoesSite;
}

export function Header({ config }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappPhone = config?.whatsapp || '5532935054792';
  const whatsappUrl = generateWhatsAppLink(
    whatsappPhone,
    'Olá, Central Phones! Gostaria de solicitar um orçamento com coleta e entrega para meu aparelho.'
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#D4AF37]/20 bg-[#111318]/95 backdrop-blur-md shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* LOGO OFICIAL CENTRAL PHONES */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#D4AF37]/40 shadow-sm transition group-hover:border-[#D4AF37] sm:h-12 sm:w-12">
            <Image
              src="/images/logo-central-phones.jpeg"
              alt="Central Phones"
              width={48}
              height={48}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-wide text-[#F5F5F5] sm:text-xl">
              CENTRAL <span className="text-[#D4AF37]">PHONES</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#B6B6B6]">
              Assistência & Coleta
            </div>
          </div>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden items-center gap-6 lg:gap-7 md:flex">
          <Link
            href="/#inicio"
            className="text-sm font-medium text-[#B6B6B6] transition hover:text-[#D4AF37]"
          >
            Início
          </Link>
          <Link
            href="/#delivery"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] transition hover:text-[#F5F5F5]"
          >
            <Truck className="h-4 w-4" />
            <span>Coleta & Entrega</span>
          </Link>
          <Link
            href="/#servicos"
            className="text-sm font-medium text-[#B6B6B6] transition hover:text-[#D4AF37]"
          >
            Serviços
          </Link>
          <Link
            href="/produtos"
            className="flex items-center gap-1.5 text-sm font-medium text-[#B6B6B6] transition hover:text-[#D4AF37]"
          >
            <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
            Catálogo
          </Link>
          <Link
            href="/#sobre"
            className="text-sm font-medium text-[#B6B6B6] transition hover:text-[#D4AF37]"
          >
            Sobre
          </Link>
          <Link
            href="/#como-chegar"
            className="text-sm font-medium text-[#B6B6B6] transition hover:text-[#D4AF37]"
          >
            Como Chegar
          </Link>
        </nav>

        {/* AÇÕES DESKTOP */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-sm"
          >
            <MessageCircle className="h-4 w-4 fill-current" />
            <span>Pedir Orçamento</span>
          </a>
        </div>

        {/* BOTÃO MOBILE */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-white/10 p-2 text-[#B6B6B6] transition hover:border-[#D4AF37]/50 hover:text-white md:hidden"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* MENU MOBILE */}
      {mobileMenuOpen && (
        <div className="border-b border-[#D4AF37]/20 bg-[#111318] px-6 py-6 md:hidden animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4">
            <Link
              href="/#inicio"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#F5F5F5] transition hover:text-[#D4AF37]"
            >
              Início
            </Link>
            <Link
              href="/#delivery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-base font-semibold text-[#D4AF37]"
            >
              <Truck className="h-4 w-4" />
              <span>Coleta & Entrega (Delivery)</span>
            </Link>
            <Link
              href="/#servicos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#B6B6B6] transition hover:text-[#D4AF37]"
            >
              Serviços Especializados
            </Link>
            <Link
              href="/produtos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-base font-medium text-[#B6B6B6] hover:text-[#D4AF37]"
            >
              <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
              Catálogo de Produtos
            </Link>
            <Link
              href="/#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#B6B6B6] transition hover:text-[#D4AF37]"
            >
              Sobre a Central Phones
            </Link>
            <Link
              href="/#como-chegar"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#B6B6B6] transition hover:text-[#D4AF37]"
            >
              Como Chegar & Localização
            </Link>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] py-3 text-center text-sm font-bold text-[#111318] transition hover:bg-[#A98220] hover:text-white shadow-md"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Solicitar Orçamento no WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
