import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StatusOS } from "./supabase/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(isNaN(num) ? 0 : num);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function sanitizeDigits(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

export function generateWhatsAppLink(
  rawPhone: string,
  message: string
): string {
  const digits = rawPhone.replace(/\D/g, '');
  // Format international number for Brazil if missing country code
  const phone = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const slugify = createSlug;

export const STATUS_OS_LABELS: Record<StatusOS, { label: string; color: string; bg: string }> = {
  aberta: {
    label: 'Aberta / Nova',
    color: 'text-zinc-300',
    bg: 'bg-zinc-800/80 border-zinc-700',
  },
  recebida: {
    label: 'Recebida no Balcão',
    color: 'text-zinc-300',
    bg: 'bg-zinc-800/80 border-zinc-700',
  },
  coleta_solicitada: {
    label: 'Coleta Solicitada',
    color: 'text-amber-300',
    bg: 'bg-amber-950/40 border-amber-800/60',
  },
  coleta_agendada: {
    label: 'Coleta Agendada',
    color: 'text-sky-300',
    bg: 'bg-sky-950/40 border-sky-800/60',
  },
  aparelho_coletado: {
    label: 'Aparelho Coletado',
    color: 'text-indigo-300',
    bg: 'bg-indigo-950/40 border-indigo-800/60',
  },
  em_analise: {
    label: 'Em Avaliação / Análise',
    color: 'text-blue-300',
    bg: 'bg-blue-950/40 border-blue-800/60',
  },
  em_diagnostico: {
    label: 'Em Diagnóstico Técnico',
    color: 'text-blue-300',
    bg: 'bg-blue-950/40 border-blue-800/60',
  },
  aguardando_aprovacao: {
    label: 'Aguardando Aprovação',
    color: 'text-orange-300',
    bg: 'bg-orange-950/40 border-orange-800/60',
  },
  aprovada: {
    label: 'Aprovada pelo Cliente',
    color: 'text-emerald-300',
    bg: 'bg-emerald-950/40 border-emerald-800/60',
  },
  em_reparo: {
    label: 'Em Manutenção / Reparo',
    color: 'text-yellow-300',
    bg: 'bg-yellow-950/40 border-yellow-800/60',
  },
  em_manutencao: {
    label: 'Em Manutenção',
    color: 'text-yellow-300',
    bg: 'bg-yellow-950/40 border-yellow-800/60',
  },
  pronta: {
    label: 'Pronto / Aguardando',
    color: 'text-[#D4AF37]',
    bg: 'bg-[#D4AF37]/20 border-[#D4AF37]/50',
  },
  entrega_agendada: {
    label: 'Entrega Agendada',
    color: 'text-cyan-300',
    bg: 'bg-cyan-950/40 border-cyan-800/60',
  },
  entregue: {
    label: 'Entregue / Concluído',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40 border-emerald-800/60',
  },
  cancelada: {
    label: 'Cancelado',
    color: 'text-rose-400',
    bg: 'bg-rose-950/40 border-rose-800/60',
  },
};
