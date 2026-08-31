"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const links = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/estoque", label: "Estoque" },
];

export function AdminShell({
  children,
  email,
}: Readonly<{ children: React.ReactNode; email: string }>) {
  const pathname = usePathname();
  const router = useRouter();

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin/produtos" className="shrink-0">
              <span className="font-black tracking-wide">
                CENTRAL <span className="text-[#D4AF37]">PHONES</span>
              </span>
              <span className="ml-2 text-xs text-zinc-500">Painel</span>
            </Link>

            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-[#D4AF37] lg:hidden"
            >
              Ver site
            </Link>
          </div>

          <nav aria-label="Navegação administrativa" className="flex gap-2">
            {links.map((link) => {
              const ativo = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    ativo
                      ? "bg-[#D4AF37] text-black"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <div className="min-w-0 text-right">
              <p className="max-w-52 truncate text-xs text-zinc-400">{email}</p>
              <Link
                href="/"
                className="hidden text-xs text-[#D4AF37] hover:underline lg:inline"
              >
                Ver página pública
              </Link>
            </div>

            <button
              type="button"
              onClick={sair}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
