'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  Users,
  Wrench,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Produtos',
      href: '/admin/produtos',
      icon: Package,
      exact: false,
    },
    {
      label: 'Categorias',
      href: '/admin/categorias',
      icon: Layers,
      exact: false,
    },
    {
      label: 'Controle de Estoque',
      href: '/admin/estoque',
      icon: Boxes,
      exact: false,
    },
    {
      label: 'Clientes',
      href: '/admin/clientes',
      icon: Users,
      exact: false,
    },
    {
      label: 'Ordens de Serviço',
      href: '/admin/ordens-servico',
      icon: Wrench,
      exact: false,
    },
    {
      label: 'Configurações do Site',
      href: '/admin/configuracoes',
      icon: Settings,
      exact: false,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <aside className="flex h-full w-72 flex-col justify-between border-r border-[#D4AF37]/20 bg-[#111318] px-5 py-6 text-[#F5F5F5] shadow-2xl">
      <div className="space-y-6">
        {/* LOGO ADMIN */}
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#D4AF37] shadow-sm">
              <Image
                src="/images/logo-central-phones.jpeg"
                alt="Central Phones"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-base font-black tracking-wide text-[#F5F5F5]">
                CENTRAL <span className="text-[#D4AF37]">ADMIN</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                <ShieldCheck className="h-3 w-3" />
                Painel Seguro
              </div>
            </div>
          </Link>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="space-y-1.5 pt-2">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#B6B6B6]">
            Gerenciamento
          </div>
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-150 ${
                  active
                    ? 'bg-[#D4AF37] text-[#111318] shadow-md shadow-[#D4AF37]/20 font-bold'
                    : 'text-[#B6B6B6] hover:bg-[#191C22] hover:text-[#F5F5F5]'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition ${
                    active ? 'text-[#111318]' : 'text-[#B6B6B6] group-hover:text-[#D4AF37]'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* RODAPÉ DO SIDEBAR */}
      <div className="space-y-4 pt-6 border-t border-[#D4AF37]/20">
        {/* LINK PARA SITE PÚBLICO */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl border border-[#D4AF37]/20 bg-[#191C22] px-4 py-2.5 text-xs font-semibold text-[#B6B6B6] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-[#D4AF37]" />
            Ver Site Comercial
          </span>
          <span className="text-[10px] text-[#B6B6B6]">↗</span>
        </Link>

        {/* PERFIL E LOGOUT */}
        <div className="flex items-center justify-between rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] p-3.5">
          <div className="min-w-0 pr-2">
            <p className="truncate text-xs font-bold text-[#F5F5F5]">
              {user?.nome || 'Administrador'}
            </p>
            <p className="truncate text-[10px] text-[#B6B6B6]">
              {user?.email || 'admin@centralphones.com.br'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sair do Painel"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#22252D] border border-[#D4AF37]/20 text-[#B6B6B6] transition hover:border-rose-400 hover:bg-rose-950/50 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
