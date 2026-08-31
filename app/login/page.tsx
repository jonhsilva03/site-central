import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    const { data: permitido } = await supabase.rpc("is_admin");

    if (permitido) {
      redirect("/admin/produtos");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.18),transparent_42%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/90 p-7 shadow-2xl shadow-[#D4AF37]/10 backdrop-blur sm:p-9">
        <Link href="/" className="inline-block">
          <p className="text-2xl font-black tracking-wide">
            CENTRAL <span className="text-[#D4AF37]">PHONES</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Tecnologia & Assistência
          </p>
        </Link>

        <div className="mt-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Área restrita
          </p>
          <h1 className="mt-2 text-3xl font-black">Acesso administrativo</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Entre com seu e-mail e senha para gerenciar produtos e estoque.
          </p>
        </div>

        <LoginForm />

        <p className="mt-7 text-center text-xs text-zinc-500">
          Acesso exclusivo da administração da Central Phones.
        </p>
      </div>
    </main>
  );
}
