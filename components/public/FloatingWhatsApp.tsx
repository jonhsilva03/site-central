'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

interface FloatingWhatsAppProps {
  phone?: string;
  defaultMessage?: string;
}

export function FloatingWhatsApp({
  phone = '5532935054792',
  defaultMessage = 'Olá Central Phones! Gostaria de tirar uma dúvida sobre serviços/produtos.',
}: FloatingWhatsAppProps) {
  const url = generateWhatsAppLink(phone, defaultMessage);

  return (
    <aside aria-label="Atendimento via WhatsApp">
      <a
        id="floating-whatsapp-btn"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3.5 text-white shadow-2xl shadow-[#25D366]/40 transition duration-300 hover:scale-105 hover:bg-[#20ba59] active:scale-95 group"
        aria-label="Falar conosco no WhatsApp"
      >
        <MessageCircle className="h-6 w-6 fill-white text-transparent" />
        <span className="hidden sm:inline-block font-bold text-sm text-white pr-1">
          Fale Conosco
        </span>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
        </span>
      </a>
    </aside>
  );
}
