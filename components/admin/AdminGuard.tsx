'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
        <p className="mt-4 text-sm text-zinc-400">Verificando credenciais de administrador...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-rose-500/30 bg-rose-950/40 text-rose-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Acesso Restrito</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Esta área é exclusiva para administradores autorizados da Central Phones.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black hover:bg-[#f0cf63]"
        >
          Ir para Login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
