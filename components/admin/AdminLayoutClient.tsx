'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Menu, Smartphone } from 'lucide-react';
import Link from 'next/link';

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#111318] text-[#F5F5F5] selection:bg-[#D4AF37] selection:text-[#111318]">
        {/* SIDEBAR DESKTOP */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">
          <AdminSidebar />
        </div>

        {/* SIDEBAR MOBILE OVERLAY */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-[#111318]">
              <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* ÁREA PRINCIPAL */}
        <div className="flex flex-1 flex-col lg:pl-72">
          {/* HEADER MOBILE */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#D4AF37]/20 bg-[#111318]/95 px-4 py-3.5 backdrop-blur-md lg:hidden">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="text-base font-black text-[#F5F5F5]">
                CENTRAL <span className="text-[#D4AF37]">ADMIN</span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="rounded-xl border border-[#D4AF37]/30 bg-[#191C22] p-2 text-[#B6B6B6] hover:text-[#D4AF37]"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#111318]">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
