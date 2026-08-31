'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Laptop,
  Check,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Gamepad2,
  Navigation,
  Truck,
  MessageSquare,
  Wrench,
  PackageCheck,
  Send,
  ShieldCheck,
  Cpu,
  Info,
  CalendarCheck,
} from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { FloatingWhatsApp } from '@/components/public/FloatingWhatsApp';
import { ProductCard } from '@/components/public/ProductCard';
import { getConfiguracoes, getProdutos } from '@/lib/supabase/data-service';
import { ConfiguracoesSite, Produto } from '@/lib/supabase/types';
import { generateWhatsAppLink, formatPhone } from '@/lib/utils';

export default function Home() {
  const [config, setConfig] = useState<ConfiguracoesSite | null>(null);
  const [destaques, setDestaques] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State para solicitação rápida de coleta
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formTipoAparelho, setFormTipoAparelho] = useState('Celular');
  const [formMarcaModelo, setFormMarcaModelo] = useState('');
  const [formProblema, setFormProblema] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formPeriodo, setFormPeriodo] = useState('Tarde (13h às 18h)');

  useEffect(() => {
    async function loadData() {
      try {
        const [configData, prodsData] = await Promise.all([
          getConfiguracoes(),
          getProdutos({ destaqueOnly: true, onlyActive: true }),
        ]);
        setConfig(configData);
        setDestaques(prodsData.slice(0, 6));
      } catch (err) {
        console.error('Error loading home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const whatsappPhone = config?.whatsapp || '5532935054792';

  // Mensagem padrão do Hero
  const whatsappHeroUrl = generateWhatsAppLink(
    whatsappPhone,
    'Olá, Central Phones! Gostaria de solicitar um orçamento com coleta e entrega para meu aparelho.'
  );

  // Handler para envio do formulário de coleta via WhatsApp
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lines = [
      '🚀 *SOLICITAÇÃO DE ORÇAMENTO & COLETA (DELIVERY)*',
      '',
      `👤 *Nome:* ${formNome || 'Não informado'}`,
      `📱 *WhatsApp:* ${formTelefone || 'Não informado'}`,
      `📦 *Aparelho:* ${formTipoAparelho}`,
      `🏷️ *Marca/Modelo:* ${formMarcaModelo || 'A informar'}`,
      `🔧 *Problema Relatado:* ${formProblema || 'Avaliação geral'}`,
      `📍 *Bairro:* ${formBairro || 'São João del-Rei'}`,
      `⏰ *Melhor Período para Coleta:* ${formPeriodo}`,
      '',
      '_Mensagem enviada via formulário do site Central Phones._',
    ];

    const message = lines.join('\n');
    const url = generateWhatsAppLink(whatsappPhone, message);
    window.open(url, '_blank');
  };

  const aparelhosAtendidos = [
    { nome: 'Celulares & Smartphones', icone: Smartphone },
    { nome: 'Notebooks & MacBooks', icone: Laptop },
    { nome: 'Computadores Desktop', icone: Cpu },
    { nome: 'Videogames & Consoles', icone: Gamepad2 },
    { nome: 'Controles & Joysticks', icone: Gamepad2 },
    { nome: 'Eletrônicos em Geral', icone: Wrench },
  ];

  const etapasDelivery = [
    {
      numero: '01',
      icone: MessageSquare,
      titulo: '1. Solicite o atendimento',
      descricao:
        'O cliente informa pelo WhatsApp qual é o aparelho e o problema apresentado.',
    },
    {
      numero: '02',
      icone: CalendarCheck,
      titulo: '2. Agendamos a coleta',
      descricao:
        'A Central Phones confirma o endereço, a disponibilidade e combina o melhor horário.',
    },
    {
      numero: '03',
      icone: Wrench,
      titulo: '3. Avaliamos e realizamos o serviço',
      descricao:
        'O aparelho é avaliado e o serviço é realizado após a confirmação do cliente.',
    },
    {
      numero: '04',
      icone: PackageCheck,
      titulo: '4. Entregamos em sua casa',
      descricao:
        'Depois de concluído, o aparelho é entregue novamente no endereço combinado.',
    },
  ];

  const servicos = config?.servicos_json || [
    {
      icone: '📱',
      titulo: 'Troca de Tela',
      descricao: 'Substituição de telas quebradas ou sem touch com peças de alta qualidade, vedação e garantia.',
    },
    {
      icone: '🔋',
      titulo: 'Troca de Bateria',
      descricao: 'Recupere a autonomia e a saúde do seu aparelho com baterias homologadas e seguras.',
    },
    {
      icone: '🔧',
      titulo: 'Reparo de Placa',
      descricao: 'Diagnóstico avançado e microssoldagem para aparelhos que não ligam ou molharam.',
    },
    {
      icone: '💻',
      titulo: 'Notebooks & PCs',
      descricao: 'Formatação limpa, troca de pasta térmica de prata, upgrades de SSD/RAM e reparos.',
    },
    {
      icone: '🎮',
      titulo: 'Videogames & Consoles',
      descricao: 'Manutenção preventiva em PS4, PS5, Xbox e conserto de analógicos drift em controles.',
    },
    {
      icone: '🛠️',
      titulo: 'Manutenção Geral',
      descricao: 'Conectores de carga, botões, câmeras, alto-falantes e recuperação de carcaça.',
    },
  ];

  const diferenciais = config?.diferenciais_json || [
    'Atendimento especializado e transparente',
    'Serviço de Coleta e Entrega em domicílio',
    'Orçamento prévio sem custos ocultos',
    'Garantia em todos os serviços executados',
  ];

  return (
    <div className="min-h-screen bg-[#111318] text-[#F5F5F5] selection:bg-[#D4AF37] selection:text-[#111318]">
      {/* CABEÇALHO */}
      <Header config={config || undefined} />

      {/* ================= HERO PRINCIPAL ================= */}
      <section id="inicio" className="relative overflow-hidden border-b border-[#D4AF37]/20 bg-gradient-to-b from-[#111318] via-[#191C22] to-[#111318] py-16 lg:py-24">
        {/* LUZ RADIAL DOURADA DISCRETA */}
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-[#A98220]/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
          {/* LADO ESQUERDO: TEXTO & CTA PRINCIPAIS */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#22252D] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#D4AF37] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              Assistência Técnica & Delivery em São João del-Rei
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[#F5F5F5] sm:text-5xl lg:text-6xl leading-[1.1]">
              Assistência técnica <br />
              <span className="text-[#D4AF37]">sem você sair de casa</span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-[#B6B6B6] sm:text-lg">
              Solicite seu orçamento pelo WhatsApp. Buscamos seu celular, computador, notebook, videogame ou eletrônico, realizamos o serviço e entregamos novamente no conforto da sua casa.
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <a
                href={whatsappHeroUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-full bg-[#D4AF37] px-8 py-4 text-center font-bold text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-lg active:scale-95"
              >
                <Phone className="h-4 w-4 fill-current" />
                <span>Solicitar orçamento e coleta</span>
              </a>

              <a
                href="#como-funciona"
                className="flex items-center justify-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#22252D] px-8 py-4 text-center font-bold text-[#F5F5F5] transition hover:border-[#D4AF37] hover:bg-[#292D35] hover:text-[#D4AF37]"
              >
                <Truck className="h-4 w-4 text-[#D4AF37]" />
                <span>Entenda como funciona</span>
              </a>
            </div>

            {/* DIFERENCIAIS EM MINI GRID */}
            <div className="grid grid-cols-1 gap-2.5 pt-4 sm:grid-cols-2">
              {diferenciais.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-xs font-medium text-[#F5F5F5]">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LADO DIREITO: CARD DE APRESENTAÇÃO PREMIUM */}
          <div className="flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-7 shadow-2xl">
              {/* TOPO COM LOGO OFICIAL */}
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-md">
                    <Image
                      src="/images/logo-central-phones.jpeg"
                      alt="Central Phones"
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <div className="text-lg font-black tracking-wide text-[#F5F5F5]">
                      CENTRAL <span className="text-[#D4AF37]">PHONES</span>
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#B6B6B6]">
                      Bancada Técnica & Coleta
                    </div>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/40">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Ativo
                </span>
              </div>

              {/* LISTA DE APARELHOS ATENDIDOS NO HERO */}
              <div className="mt-5 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  Aparelhos Atendidos na Coleta & Loja
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {aparelhosAtendidos.map((item) => {
                    const Icon = item.icone;
                    return (
                      <div
                        key={item.nome}
                        className="flex items-center gap-2 rounded-xl border border-[#D4AF37]/15 bg-[#191C22] p-2.5 text-xs text-[#F5F5F5]"
                      >
                        <Icon className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{item.nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RODAPÉ DO CARD HERO */}
              <div className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#292D35] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B6B6B6]">Orçamento no WhatsApp:</span>
                  <span className="font-bold text-[#D4AF37]">Rápido & Sem Compromisso</span>
                </div>
                <p className="mt-1.5 text-[11px] text-[#B6B6B6]">
                  Avenida Sete de Setembro, 153 • Bairro Matozinhos • SJDR
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEÇÃO: COMO FUNCIONA O DELIVERY ================= */}
      <section id="como-funciona" className="scroll-mt-16 border-b border-[#D4AF37]/20 bg-[#191C22] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#22252D] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#D4AF37]">
              <Truck className="h-3.5 w-3.5" />
              Diferencial Exclusivo
            </div>
            <h2 className="mt-3 text-3xl font-black text-[#F5F5F5] sm:text-4xl">
              Como funciona o <span className="text-[#D4AF37]">Delivery</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#B6B6B6]">
              Pensando no seu conforto e praticidade, buscamos o seu aparelho, realizamos o diagnóstico em nosso laboratório e levamos de volta até você.
            </p>
          </div>

          {/* 4 ETAPAS */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {etapasDelivery.map((etapa) => {
              const Icon = etapa.icone;
              return (
                <div
                  key={etapa.numero}
                  className="group relative flex flex-col justify-between rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-7 transition duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:bg-[#292D35] hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#191C22] text-[#D4AF37] transition group-hover:scale-105 group-hover:bg-[#D4AF37]/10">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-black text-[#D4AF37]/40 group-hover:text-[#D4AF37] transition">
                        {etapa.numero}
                      </span>
                    </div>

                    <h3 className="mt-5 text-base font-bold text-[#F5F5F5] group-hover:text-[#D4AF37] transition">
                      {etapa.titulo}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#B6B6B6]">
                      {etapa.descricao}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37]">
                    <span>Atendimento Ágil</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AVISO TRANSPARENTE SOBRE TAXA/REGIÃO */}
          <div className="mt-10 mx-auto max-w-3xl rounded-2xl border border-[#D4AF37]/30 bg-[#22252D] p-4 text-center sm:text-left flex flex-col sm:flex-row items-center gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
              <Info className="h-5 w-5" />
            </div>
            <p className="text-xs text-[#B6B6B6] leading-relaxed">
              <strong className="text-[#F5F5F5]">Transparência total:</strong> A disponibilidade da coleta, horários e eventual taxa de deslocamento para seu bairro serão confirmadas diretamente pelo WhatsApp antes de qualquer envio.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SEÇÃO: FORMULÁRIO RÁPIDO DE COLETA ================= */}
      <section id="delivery" className="scroll-mt-16 border-b border-[#D4AF37]/20 bg-[#111318] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#22252D] p-6 sm:p-10 shadow-2xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#191C22] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                <Send className="h-3.5 w-3.5" />
                Agilidade no WhatsApp
              </div>
              <h2 className="mt-3 text-2xl font-black text-[#F5F5F5] sm:text-3xl">
                Solicitar Coleta & Orçamento
              </h2>
              <p className="mt-2 text-xs text-[#B6B6B6] sm:text-sm">
                Preencha os dados abaixo e clique para enviar a mensagem formatada para nossa equipe no WhatsApp.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* NOME */}
                <div>
                  <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#191C22] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                {/* TELEFONE / WHATSAPP */}
                <div>
                  <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                    Seu Telefone ou WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    placeholder="Ex: (32) 99999-9999"
                    className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#191C22] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* TIPO DE APARELHO */}
                <div>
                  <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                    Tipo de Aparelho *
                  </label>
                  <select
                    value={formTipoAparelho}
                    onChange={(e) => setFormTipoAparelho(e.target.value)}
                    className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#191C22] px-4 py-3 text-sm text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Celular">Celular / Smartphone</option>
                    <option value="Notebook">Notebook / MacBook</option>
                    <option value="Computador">Computador Desktop</option>
                    <option value="Videogame">Videogame / Console</option>
                    <option value="Controle">Controle de Videogame</option>
                    <option value="Outro Eletrônico">Outro Eletrônico</option>
                  </select>
                </div>

                {/* MARCA E MODELO */}
                <div>
                  <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                    Marca e Modelo
                  </label>
                  <input
                    type="text"
                    value={formMarcaModelo}
                    onChange={(e) => setFormMarcaModelo(e.target.value)}
                    placeholder="Ex: iPhone 13, Dell i5, PS4"
                    className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#191C22] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                {/* BAIRRO */}
                <div>
                  <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                    Seu Bairro (em SJDR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBairro}
                    onChange={(e) => setFormBairro(e.target.value)}
                    placeholder="Ex: Centro, Matozinhos, Fábricas"
                    className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#191C22] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* PROBLEMA APRESENTADO */}
              <div>
                <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                  Problema Apresentado / Defeito *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formProblema}
                  onChange={(e) => setFormProblema(e.target.value)}
                  placeholder="Descreva o que está acontecendo (ex: tela trincada, não liga, esquentando, conector com mau contato...)"
                  className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#191C22] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B6B6B6]/50 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* MELHOR PERÍODO PARA COLETA */}
              <div>
                <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                  Melhor Período para Coleta
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    'Manhã (09h às 12h)',
                    'Tarde (13h às 18h)',
                    'Horário Comercial',
                    'A Combinar',
                  ].map((periodo) => (
                    <button
                      key={periodo}
                      type="button"
                      onClick={() => setFormPeriodo(periodo)}
                      className={`rounded-xl border py-2.5 px-3 text-xs font-semibold transition text-center ${
                        formPeriodo === periodo
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                          : 'border-white/10 bg-[#191C22] text-[#B6B6B6] hover:border-[#D4AF37]/40 hover:text-white'
                      }`}
                    >
                      {periodo}
                    </button>
                  ))}
                </div>
              </div>

              {/* AVISO OBRIGATÓRIO */}
              <div className="rounded-xl border border-[#D4AF37]/20 bg-[#292D35] p-3.5 text-xs text-[#B6B6B6] flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>
                  <strong>Aviso:</strong> A disponibilidade da coleta e eventual taxa de deslocamento serão confirmadas pelo WhatsApp.
                </span>
              </div>

              {/* BOTÃO DE ENVIO */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#D4AF37] py-4 text-center text-sm font-bold text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-lg active:scale-95"
              >
                <Phone className="h-4 w-4 fill-current" />
                <span>Solicitar pelo WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ================= SERVIÇOS ESPECIALIZADOS ================= */}
      <section id="servicos" className="border-b border-[#D4AF37]/20 bg-[#191C22] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Especialidades
            </div>
            <h2 className="mt-2 text-3xl font-black text-[#F5F5F5] sm:text-4xl">
              Nossos Serviços Especializados
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#B6B6B6]">
              Contamos com bancada técnica completa, microscópios de precisão, estações de solda e técnicos capacitados para resolver qualquer defeito com rapidez e garantia.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map((servico) => (
              <div
                key={servico.titulo}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:bg-[#292D35] hover:shadow-xl"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#191C22] border border-[#D4AF37]/20 text-2xl transition duration-200 group-hover:scale-105 group-hover:border-[#D4AF37]">
                    {servico.icone}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#F5F5F5] transition group-hover:text-[#D4AF37]">
                    {servico.titulo}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#B6B6B6]">
                    {servico.descricao}
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href={generateWhatsAppLink(
                      whatsappPhone,
                      `Olá, Central Phones! Gostaria de solicitar orçamento para o serviço de *${servico.titulo}*.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4AF37] transition hover:text-white"
                  >
                    <span>Solicitar Orçamento</span>
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUTOS EM DESTAQUE ================= */}
      <section id="produtos" className="border-b border-[#D4AF37]/20 bg-[#111318] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                Vitrine & Loja
              </div>
              <h2 className="mt-2 text-3xl font-black text-[#F5F5F5] sm:text-4xl">
                Produtos em Destaque
              </h2>
              <p className="mt-2 max-w-xl text-xs text-[#B6B6B6] sm:text-sm">
                Aparelhos selecionados, revisados com garantia e acessórios de primeira linha disponíveis na Central Phones.
              </p>
            </div>

            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#D4AF37]/30 bg-[#22252D] px-6 py-3 text-xs font-bold text-[#F5F5F5] shadow-sm transition hover:border-[#D4AF37] hover:text-[#D4AF37] md:self-auto"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#D4AF37]" />
            </Link>
          </div>

          {/* GRID DE PRODUTOS */}
          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-3xl border border-[#D4AF37]/20 bg-[#22252D]"
                />
              ))}
            </div>
          ) : destaques.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destaques.map((produto) => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                  whatsappPhone={whatsappPhone}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-12 text-center shadow-sm">
              <ShoppingBag className="mx-auto h-12 w-12 text-zinc-600" />
              <h3 className="mt-4 text-base font-bold text-[#F5F5F5]">Catálogo em Atualização</h3>
              <p className="mt-1 text-xs text-[#B6B6B6]">
                Visite nossa página de produtos para conferir todos os itens disponíveis.
              </p>
              <Link
                href="/produtos"
                className="mt-5 inline-flex rounded-full bg-[#D4AF37] px-6 py-2.5 text-xs font-bold text-[#111318] hover:bg-[#A98220] hover:text-white"
              >
                Abrir Catálogo
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= SOBRE A CENTRAL ================= */}
      <section id="sobre" className="border-b border-[#D4AF37]/20 bg-[#191C22] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                Sobre a Central Phones
              </div>
              <h2 className="text-3xl font-black text-[#F5F5F5] sm:text-4xl leading-tight">
                Mais do que assistência. <br />
                <span className="text-[#D4AF37]">Confiança e transparência.</span>
              </h2>
              <p className="text-sm leading-relaxed text-[#B6B6B6]">
                {config?.texto_sobre ||
                  'A Central Phones nasceu para oferecer tecnologia, assistência técnica e atendimento de qualidade em um só lugar. Nosso objetivo é resolver o problema do cliente de forma transparente, oferecendo orientação antes, durante e depois do serviço.'}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#22252D] p-5 shadow-xs">
                  <div className="text-2xl font-black text-[#D4AF37]">100%</div>
                  <div className="mt-1 text-xs font-bold text-[#F5F5F5]">Transparência</div>
                  <p className="mt-1 text-[11px] text-[#B6B6B6]">
                    Diagnósticos reais e aprovação prévia com você.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#22252D] p-5 shadow-xs">
                  <div className="text-2xl font-black text-[#D4AF37]">Garantia</div>
                  <div className="mt-1 text-xs font-bold text-[#F5F5F5]">Em Todos os Reparos</div>
                  <p className="mt-1 text-[11px] text-[#B6B6B6]">
                    Segurança, procedência de peças e suporte contínuo.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-8 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-md">
                  <Image
                    src="/images/logo-central-phones.jpeg"
                    alt="Central Phones"
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F5F5F5]">Central Phones</h3>
                  <p className="text-xs font-medium text-[#D4AF37]">Assistência Técnica & Delivery</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-[#F5F5F5]">
                <div className="flex items-start gap-3 rounded-2xl bg-[#191C22] p-4 border border-[#D4AF37]/15">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                  <div>
                    <p className="font-bold text-[#F5F5F5]">Central Phones</p>
                    <p className="text-[#B6B6B6]">Avenida Sete de Setembro, nº 153</p>
                    <p className="text-[#B6B6B6]">Bairro Matozinhos • CEP 36305-134</p>
                    <p className="text-[#B6B6B6]">São João del-Rei – MG</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-[#191C22] p-4 border border-[#D4AF37]/15">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                  <div>
                    <p className="font-bold text-[#F5F5F5]">Horário de Atendimento</p>
                    <p className="text-[#B6B6B6]">
                      {config?.horario_funcionamento ||
                        'Segunda a Sexta: 08:30 às 18:00 | Sábado: 08:30 às 12:30'}
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={whatsappHeroUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] py-3.5 text-center text-xs font-bold text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-md"
              >
                <Phone className="h-4 w-4 fill-current" />
                Falar com a Central Phones no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEÇÃO COMO CHEGAR / GOOGLE MAPS ================= */}
      <section id="como-chegar" className="border-b border-[#D4AF37]/20 bg-[#111318] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* CABEÇALHO DA SEÇÃO */}
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Localização & Loja Física
            </div>
            <h2 className="mt-2 text-3xl font-black text-[#F5F5F5] sm:text-4xl">
              Como Chegar na <span className="text-[#D4AF37]">Central Phones</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs text-[#B6B6B6] sm:text-sm">
              Estamos localizados em ponto de fácil acesso no bairro Matozinhos em São João del-Rei. Venha nos visitar no balcão ou solicite nosso serviço de coleta e entrega.
            </p>
          </div>

          {/* CARD PRINCIPAL */}
          <div className="mt-12 overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#22252D] p-6 sm:p-10 shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              {/* INFORMAÇÕES DE ENDEREÇO */}
              <div className="space-y-6 lg:col-span-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#F5F5F5]">
                      Endereço Oficial
                    </h3>
                    <p className="text-xs text-[#D4AF37] font-semibold">
                      Loja Física & Laboratório
                    </p>
                  </div>
                </div>

                {/* BLOCO DO ENDEREÇO EXATO */}
                <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] p-5 space-y-1.5 text-sm text-[#F5F5F5]">
                  <p className="font-black text-base text-[#F5F5F5]">Central Phones</p>
                  <p className="font-semibold text-[#F5F5F5]">Avenida Sete de Setembro, nº 153</p>
                  <p className="text-[#B6B6B6]">Bairro Matozinhos</p>
                  <p className="text-[#B6B6B6]">São João del-Rei – MG</p>
                  <p className="text-xs font-bold text-[#D4AF37]">CEP 36305-134</p>
                </div>

                <div className="rounded-xl border border-[#D4AF37]/20 bg-[#292D35] p-3.5 text-xs text-[#B6B6B6]">
                  <p className="text-[#D4AF37] font-bold mb-0.5">Prefere que a gente busque?</p>
                  <p>Oferecemos serviço de coleta e entrega (delivery) para seu celular, computador ou videogame.</p>
                </div>

                <div className="space-y-2.5 text-xs text-[#B6B6B6]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    <span>{config?.horario_funcionamento || 'Segunda a Sexta: 08:30 às 18:00 | Sábado: 08:30 às 12:30'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    <span>{formatPhone(whatsappPhone)}</span>
                  </div>
                </div>

                {/* BOTÃO TRAÇAR ROTA NO GOOGLE MAPS */}
                <div className="pt-2">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Avenida+Sete+de+Setembro,+153,+Matozinhos,+S%C3%A3o+Jo%C3%A3o+del-Rei+-+MG,+36305-134&travelmode=driving"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#D4AF37] px-6 py-4 text-center text-sm font-black text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-md"
                  >
                    <Navigation className="h-4 w-4 fill-current" />
                    <span>Traçar rota no Google Maps</span>
                  </a>
                </div>
              </div>

              {/* MAPA INTERATIVO GOOGLE MAPS IFRAME */}
              <div className="lg:col-span-7">
                <div className="relative w-full overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#191C22] shadow-inner h-[320px] sm:h-[400px]">
                  <iframe
                    title="Localização da Central Phones"
                    src="https://maps.google.com/maps?q=Avenida%20Sete%20de%20Setembro%2C%20153%2C%20Matozinhos%2C%20S%C3%A3o%20Jo%C3%A3o%20del-Rei%20-%20MG%2C%2036305-134&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-[#B6B6B6]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                    Marcador: Av. Sete de Setembro, 153 - Matozinhos
                  </span>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Avenida+Sete+de+Setembro,+153,+Matozinhos,+S%C3%A3o+Jo%C3%A3o+del-Rei+-+MG,+36305-134&travelmode=driving"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#D4AF37] hover:underline"
                  >
                    Abrir no Maps ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTATO / ORÇAMENTO FINAL ================= */}
      <section id="contato" className="px-4 py-20 sm:px-6 bg-[#191C22]">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#D4AF37]/40 bg-[#22252D] p-8 text-center sm:p-14 text-[#F5F5F5] shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Atendimento Imediato
          </div>

          <h2 className="mt-3 text-2xl font-black sm:text-4xl text-[#F5F5F5]">
            Precisa de assistência para seu aparelho?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-[#B6B6B6] sm:text-sm">
            Fale diretamente com nossa equipe técnica pelo WhatsApp. Descreva o que aconteceu com o seu aparelho e solicite orçamento prévio com ou sem coleta.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-[#D4AF37] px-8 py-4 text-sm font-bold text-[#111318] transition duration-200 hover:bg-[#A98220] hover:text-white shadow-md"
            >
              <Phone className="h-4 w-4 fill-current" />
              <span>Chamar no WhatsApp</span>
            </a>

            <Link
              href="/produtos"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#191C22] px-7 py-4 text-xs font-bold text-[#F5F5F5] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
              <span>Conhecer a Loja</span>
            </Link>
          </div>

          <div className="mt-8 rounded-2xl bg-[#191C22] p-4 text-xs text-[#B6B6B6] max-w-md mx-auto border border-[#D4AF37]/20">
            <p className="font-bold text-[#F5F5F5]">Central Phones</p>
            <p>Avenida Sete de Setembro, nº 153 • Bairro Matozinhos</p>
            <p>São João del-Rei – MG • CEP 36305-134</p>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <Footer config={config || undefined} />

      {/* BOTÃO FLUTUANTE DE WHATSAPP */}
      <FloatingWhatsApp phone={whatsappPhone} />
    </div>
  );
}
