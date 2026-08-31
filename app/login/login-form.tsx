"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCarregando(true);
    setMensagem("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      setMensagem("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    const { data: permitido, error: erroPermissao } = await supabase.rpc(
      "is_admin",
    );

    if (erroPermissao || !permitido) {
      await supabase.auth.signOut();
      setMensagem("Este usuário não tem permissão para acessar o painel.");
      setCarregando(false);
      return;
    }

    router.replace("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={entrar} className="mt-8 space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-zinc-200">
          E-mail
        </span>
        <input
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          autoComplete="email"
          required
          placeholder="seuemail@exemplo.com"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-zinc-200">
          Senha
        </span>
        <input
          type="password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          autoComplete="current-password"
          required
          placeholder="Digite sua senha"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
        />
      </label>

      {mensagem && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {mensagem}
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-xl bg-[#D4AF37] px-5 py-3.5 font-bold text-black transition hover:bg-[#f0cf63] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {carregando ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
