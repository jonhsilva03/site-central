'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowLeft,
  Loader2,
  KeyRound,
  UserPlus,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAdmin, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !nome)) {
      setError('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          router.push('/admin');
        }
      } else {
        const res = await signUp(email, password, nome);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess('Conta de Administrador criada com sucesso! Redirecionando...');
          setTimeout(() => {
            router.push('/admin');
          }, 1200);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar solicitação.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@centralphones.com.br');
    setPassword('central2026');
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#111318] px-4 py-12 text-[#F5F5F5] sm:px-6 selection:bg-[#D4AF37] selection:text-[#111318]">
      {/* DECORATIVE TOP BAR */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#191C22] via-[#D4AF37] to-[#191C22]" />

      <div className="relative w-full max-w-md">
        {/* BOTÃO VOLTAR */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#B6B6B6] transition hover:text-[#D4AF37]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar para o site comercial</span>
        </Link>

        {/* CARD DE LOGIN GRAFITE COM BORDAS DOURADAS */}
        <div className="overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#22252D] p-8 shadow-2xl sm:p-10">
          {/* CABEÇALHO COM LOGO OFICIAL */}
          <div className="text-center">
            <div className="mx-auto relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-md">
              <Image
                src="/images/logo-central-phones.jpeg"
                alt="Central Phones"
                width={80}
                height={80}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-[#F5F5F5]">
              CENTRAL <span className="text-[#D4AF37]">ADMIN</span>
            </h1>
            <p className="mt-1 text-xs text-[#B6B6B6]">
              {mode === 'login'
                ? 'Painel de Gestão e Assistência Técnica'
                : 'Cadastro de Novo Administrador'}
            </p>
          </div>

          {/* SELETOR DE MODO: ENTRAR / CRIAR CONTA */}
          <div className="mt-6 flex rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                mode === 'login'
                  ? 'bg-[#292D35] text-[#D4AF37] shadow-xs border border-[#D4AF37]/30'
                  : 'text-[#B6B6B6] hover:text-[#F5F5F5]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                mode === 'register'
                  ? 'bg-[#292D35] text-[#D4AF37] shadow-xs border border-[#D4AF37]/30'
                  : 'text-[#B6B6B6] hover:text-[#F5F5F5]'
              }`}
            >
              Criar Login
            </button>
          </div>

          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-950/80 p-3.5 text-xs text-rose-300 animate-in fade-in duration-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* MENSAGEM DE SUCESSO */}
          {success && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 p-3.5 text-xs text-emerald-300 animate-in fade-in duration-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#F5F5F5]">
                  Nome Completo
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu Nome ou Administrador"
                    required={mode === 'register'}
                    className="w-full rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] py-3 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 transition focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#F5F5F5]">
                E-mail do Administrador
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@centralphones.com.br"
                  required
                  className="w-full rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] py-3 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 transition focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F5F5]">
                Senha de Acesso
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (mínimo 6 dígitos)"
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] py-3 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 transition focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] py-3.5 text-center text-sm font-bold text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Entrar no Painel</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Criar Login e Acessar</span>
                </>
              )}
            </button>
          </form>

          {/* AJUDA DE DEMO / PREVIEW */}
          <div className="mt-8 border-t border-[#D4AF37]/20 pt-5 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#B6B6B6]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Acesso restrito para a gestão da Central Phones</span>
            </div>
            {mode === 'login' && (
              <button
                type="button"
                onClick={handleDemoFill}
                className="mt-2 text-xs font-semibold text-[#D4AF37] transition hover:underline"
              >
                Preencher credenciais padrão
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
