'use client';

import React, { useEffect, useState } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { getConfiguracoes, saveConfiguracoes } from '@/lib/supabase/data-service';
import { ConfiguracoesSite, ServicoItem } from '@/lib/supabase/types';

export default function AdminConfiguracoesPage() {
  const [config, setConfig] = useState<ConfiguracoesSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [nomeEmpresa, setNomeEmpresa] = useState('Central Phones');
  const [whatsapp, setWhatsapp] = useState('5532935054792');
  const [instagram, setInstagram] = useState('centralphones_sjdr');
  const [email, setEmail] = useState('contato@centralphones.com.br');
  const [endereco, setEndereco] = useState('Avenida Sete de Setembro, 153 - Matozinhos');
  const [cidadeEstado, setCidadeEstado] = useState('São João del-Rei - MG');
  const [horario, setHorario] = useState(
    'Segunda a Sexta: 08:30 às 18:00 | Sábado: 08:30 às 12:30'
  );
  const [textoApresentacao, setTextoApresentacao] = useState('');
  const [textoSobre, setTextoSobre] = useState('');
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [diferenciais, setDiferenciais] = useState<string[]>([]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getConfiguracoes();
        setConfig(data);
        if (data) {
          setNomeEmpresa(data.nome_empresa || 'Central Phones');
          setWhatsapp(data.whatsapp || '5532935054792');
          setInstagram(data.instagram || 'centralphones_sjdr');
          setEmail(data.email || 'contato@centralphones.com.br');
          setEndereco(data.endereco || 'Avenida Sete de Setembro, 153 - Matozinhos');
          setCidadeEstado(data.cidade_estado || 'São João del-Rei - MG');
          setHorario(data.horario_funcionamento || '');
          setTextoApresentacao(data.texto_apresentacao || '');
          setTextoSobre(data.texto_sobre || '');
          setServicos(data.servicos_json || []);
          setDiferenciais(data.diferenciais_json || []);
        }
      } catch (err) {
        console.error('Error loading config', err);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  const handleAddServico = () => {
    setServicos([
      ...servicos,
      {
        icone: '📱',
        titulo: 'Novo Serviço',
        descricao: 'Descrição breve do serviço...',
      },
    ]);
  };

  const handleUpdateServico = (index: number, field: keyof ServicoItem, val: string) => {
    const updated = [...servicos];
    updated[index] = { ...updated[index], [field]: val };
    setServicos(updated);
  };

  const handleRemoveServico = (index: number) => {
    setServicos(servicos.filter((_, i) => i !== index));
  };

  const handleAddDiferencial = () => {
    setDiferenciais([...diferenciais, 'Novo diferencial']);
  };

  const handleUpdateDiferencial = (index: number, val: string) => {
    const updated = [...diferenciais];
    updated[index] = val;
    setDiferenciais(updated);
  };

  const handleRemoveDiferencial = (index: number) => {
    setDiferenciais(diferenciais.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await saveConfiguracoes({
        id: config?.id,
        nome_empresa: nomeEmpresa,
        whatsapp,
        instagram,
        email,
        endereco,
        cidade_estado: cidadeEstado,
        horario_funcionamento: horario,
        texto_apresentacao: textoApresentacao,
        texto_sobre: textoSobre,
        servicos_json: servicos,
        diferenciais_json: diferenciais,
      });

      setConfig(updated);
      setSuccessMsg('Configurações salvas e aplicadas com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar configurações.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        <p className="mt-3 text-xs text-[#666666]">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl text-[#171717]">
            Configurações do Site
          </h1>
          <p className="mt-1 text-xs text-[#666666]">
            Altere números de contato, horários, endereço e textos institucionais que aparecem no site público.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SEÇÃO 1: CONTATOS & REDES */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
            Contatos & Redes Sociais
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Número do WhatsApp (com DDI e DDD, apenas dígitos)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="5532935054792"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Instagram (@usuario)
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="centralphones_sjdr"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                E-mail de Contato
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@centralphones.com.br"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: LOCALIZAÇÃO & HORÁRIOS */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
            Endereço & Atendimento Físico
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Endereço da Loja
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Cidade e Estado
              </label>
              <input
                type="text"
                value={cidadeEstado}
                onChange={(e) => setCidadeEstado(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717]">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: TEXTOS INSTITUCIONAIS */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
            Textos Institucionais da Home
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#171717]">
              Texto de Apresentação (Hero Header)
            </label>
            <textarea
              rows={3}
              value={textoApresentacao}
              onChange={(e) => setTextoApresentacao(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717]">
              Texto Sobre a Central Phones
            </label>
            <textarea
              rows={4}
              value={textoSobre}
              onChange={(e) => setTextoSobre(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* SEÇÃO 4: DIFERENCIAIS DA HOME */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
              Diferenciais da Home (Checkmarks)
            </h2>
            <button
              type="button"
              onClick={handleAddDiferencial}
              className="flex items-center gap-1 text-xs font-bold text-[#B99122] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar Diferencial</span>
            </button>
          </div>

          <div className="space-y-2">
            {diferenciais.map((dif, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={dif}
                  onChange={(e) => handleUpdateDiferencial(idx, e.target.value)}
                  className="flex-1 rounded-xl border border-[#E2DED4] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveDiferencial(idx)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF9F6] border border-[#E2DED4] text-[#666666] hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SEÇÃO 5: CARDS DE SERVIÇOS */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
              Serviços Oferecidos na Home
            </h2>
            <button
              type="button"
              onClick={handleAddServico}
              className="flex items-center gap-1 text-xs font-bold text-[#B99122] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar Serviço</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {servicos.map((srv, idx) => (
              <div
                key={idx}
                className="space-y-2 rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={srv.icone}
                      onChange={(e) => handleUpdateServico(idx, 'icone', e.target.value)}
                      className="w-10 rounded-lg border border-[#E2DED4] bg-white p-1 text-center text-sm text-[#171717]"
                      title="Ícone / Emoji"
                    />
                    <input
                      type="text"
                      value={srv.titulo}
                      onChange={(e) => handleUpdateServico(idx, 'titulo', e.target.value)}
                      placeholder="Título do serviço"
                      className="rounded-lg border border-[#E2DED4] bg-white px-2 py-1 text-xs font-bold text-[#171717]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveServico(idx)}
                    className="text-[#666666] hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={srv.descricao}
                  onChange={(e) => handleUpdateServico(idx, 'descricao', e.target.value)}
                  placeholder="Descrição do serviço"
                  className="w-full rounded-lg border border-[#E2DED4] bg-white p-2 text-xs text-[#666666] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOTÃO FINAL */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-8 py-3.5 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando alterações...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
