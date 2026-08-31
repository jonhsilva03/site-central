import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Phone, Mail, Navigation, Truck } from 'lucide-react';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { ConfiguracoesSite } from '@/lib/supabase/types';
import { formatPhone, generateWhatsAppLink } from '@/lib/utils';

interface FooterProps {
  config?: ConfiguracoesSite;
}

export function Footer({ config }: FooterProps) {
  const nomeEmpresa = config?.nome_empresa || 'Central Phones';
  const whatsappRaw = config?.whatsapp || '5532935054792';
  const whatsappUrl = generateWhatsAppLink(
    whatsappRaw,
    'Olá, Central Phones! Gostaria de informações sobre assistência e delivery.'
  );
  const instagram = config?.instagram || 'centralphones_sjdr';
  const endereco = config?.endereco || 'Avenida Sete de Setembro, nº 153';
  const bairro = config?.bairro || 'Bairro Matozinhos';
  const cidadeEstado = config?.cidade_estado || 'São João del-Rei – MG';
  const cep = config?.cep || 'CEP 36305-134';
  const horario = config?.horario_funcionamento || 'Segunda a Sexta: 08:30 às 18:00 | Sábado: 08:30 às 12:30';
  const email = config?.email || 'contato@centralphones.com.br';

  const routeUrl = 'https://www.google.com/maps/dir/?api=1&destination=Avenida+Sete+de+Setembro,+153,+Matozinhos,+S%C3%A3o+Jo%C3%A3o+del-Rei+-+MG,+36305-134&travelmode=driving';

  return (
    <footer className="border-t border-[#D4AF37]/20 bg-[#111318] text-[#F5F5F5]">
      {/* SEÇÃO PRINCIPAL */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* COLUNA 1: IDENTIDADE COM LOGO OFICIAL */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#D4AF37]/50 shadow-md">
                <Image
                  src="/images/logo-central-phones.jpeg"
                  alt="Central Phones"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-lg font-black tracking-wide text-[#F5F5F5]">
                  CENTRAL <span className="text-[#D4AF37]">PHONES</span>
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#B6B6B6]">
                  São João del-Rei - MG
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[#B6B6B6]">
              Assistência técnica especializada em smartphones, computadores, notebooks, consoles e eletrônicos. Atendimento em loja e serviço de coleta e entrega.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={`https://instagram.com/${instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#191C22] text-[#B6B6B6] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#191C22] text-[#B6B6B6] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                aria-label="WhatsApp"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${email}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#191C22] text-[#B6B6B6] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                aria-label="E-mail"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* COLUNA 2: NAVEGAÇÃO */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Navegação
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#B6B6B6]">
              <li>
                <Link href="/#inicio" className="transition hover:text-[#D4AF37]">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/#delivery" className="flex items-center gap-1.5 text-[#D4AF37] font-semibold transition hover:underline">
                  <Truck className="h-3.5 w-3.5" />
                  Coleta & Entrega
                </Link>
              </li>
              <li>
                <Link href="/#servicos" className="transition hover:text-[#D4AF37]">
                  Serviços Especializados
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="transition hover:text-[#D4AF37]">
                  Catálogo de Produtos
                </Link>
              </li>
              <li>
                <Link href="/#sobre" className="transition hover:text-[#D4AF37]">
                  Sobre a Central Phones
                </Link>
              </li>
              <li>
                <Link href="/#como-chegar" className="transition hover:text-[#D4AF37]">
                  Como Chegar na Loja
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: CONTATO E HORÁRIOS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Atendimento
            </h4>
            <ul className="mt-4 space-y-3 text-xs text-[#B6B6B6]">
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                <span className="leading-snug">{horario}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] text-[#F5F5F5] font-medium">
                  {formatPhone(whatsappRaw)}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                <a
                  href={`https://instagram.com/${instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37]"
                >
                  @{instagram.replace('@', '')}
                </a>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: LOCALIZAÇÃO */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Loja Física
            </h4>
            <div className="mt-4 space-y-3 text-xs text-[#B6B6B6]">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                <div>
                  <p className="font-bold text-[#F5F5F5]">Central Phones</p>
                  <p className="text-[#F5F5F5]">{endereco}</p>
                  <p>{bairro}</p>
                  <p>{cidadeEstado}</p>
                  <p className="text-[11px] text-[#D4AF37] font-semibold">{cep}</p>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={routeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-[#111318]"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Traçar Rota no Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA INFERIOR */}
      <div className="border-t border-[#D4AF37]/10 bg-[#0E0E10] px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-[#B6B6B6] sm:flex-row">
          <div>
            © {new Date().getFullYear()} {nomeEmpresa}. Todos os direitos reservados.
          </div>

          <div className="text-[11px] text-[#B6B6B6]">
            Avenida Sete de Setembro, nº 153 • Bairro Matozinhos • São João del-Rei – MG
          </div>
        </div>
      </div>
    </footer>
  );
}
