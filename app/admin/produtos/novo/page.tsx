'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertCircle, Info } from 'lucide-react';
import { ImageUploader, UploadedImage } from '@/components/admin/ImageUploader';
import { getCategorias, saveProduto, movimentarEstoque } from '@/lib/supabase/data-service';
import { Categoria } from '@/lib/supabase/types';
import { slugify } from '@/lib/utils';

export default function NovoProdutoPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [categoriaId, setCategoriaId] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [sku, setSku] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoCusto, setPrecoCusto] = useState<number>(0);
  const [precoVenda, setPrecoVenda] = useState<number>(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState<number>(2);
  const [estoqueInicial, setEstoqueInicial] = useState<number>(1);
  const [destaque, setDestaque] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [images, setImages] = useState<UploadedImage[]>([]);

  useEffect(() => {
    async function loadCats() {
      const cats = await getCategorias(false);
      setCategorias(cats);
      if (cats.length > 0) {
        setCategoriaId(cats[0].id);
      }
    }
    loadCats();
  }, []);

  const handleNomeChange = (val: string) => {
    setNome(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !slug) {
      setError('Nome e Slug são obrigatórios.');
      return;
    }
    if (precoVenda <= 0) {
      setError('O preço de venda deve ser maior que zero.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Foto principal: a que tiver is_capa, ou a primeira da lista
      const capaImg = images.find((img) => img.is_capa) || images[0];
      const fotoPrincipal = capaImg ? capaImg.url : null;

      const created = await saveProduto({
        nome,
        slug: slugify(slug),
        categoria_id: categoriaId || null,
        marca: marca || null,
        modelo: modelo || null,
        sku: sku || null,
        descricao: descricao || null,
        preco_custo: Number(precoCusto),
        preco_venda: Number(precoVenda),
        estoque_minimo: Number(estoqueMinimo),
        foto_principal: fotoPrincipal,
        destaque,
        ativo,
        imagens: images.map((img, i) => ({
          id: `img_${Date.now()}_${i}`,
          produto_id: '',
          url: img.url,
          caminho: img.caminho,
          ordem: i,
          is_capa: img.is_capa,
        })),
      });

      // Se informou estoque inicial > 0, cria a movimentação de entrada inicial
      if (estoqueInicial > 0 && created.id) {
        try {
          await movimentarEstoque({
            produto_id: created.id,
            tipo: 'entrada',
            quantidade: Number(estoqueInicial),
            motivo: 'Estoque inicial no cadastro do produto',
          });
        } catch (movErr) {
          console.warn('Erro ao registrar estoque inicial', movErr);
        }
      }

      router.push('/admin/produtos');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar produto.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2DED4] bg-white text-[#666666] hover:text-[#171717] hover:border-[#D4AF37] shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#171717] sm:text-2xl">
              Novo Produto
            </h1>
            <p className="text-xs text-[#666666]">
              Preencha os dados e anexe as fotos para exibir no catálogo.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: FOTOS */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
            Fotos do Produto
          </h2>
          <p className="mt-1 text-xs text-[#666666]">
            Adicione até 5 fotos. A foto com o selo dourado será a capa exibida no catálogo.
          </p>
          <div className="mt-4">
            <ImageUploader images={images} onChange={setImages} maxImages={5} />
          </div>
        </div>

        {/* SEÇÃO 2: DADOS BÁSICOS */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
            Informações Principais
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717]">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => handleNomeChange(e.target.value)}
                placeholder="Ex: iPhone 13 128GB Meia-Noite - Seminovo Impecável"
                required
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                URL Amigável (Slug) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(e.target.value);
                }}
                required
                placeholder="iphone-13-128gb-meia-noite"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#666666] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Categoria *
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Marca
              </label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Apple, Samsung, Xiaomi, Baseus"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Modelo / Versão
              </label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: A2633 / 128GB"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Código / SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ex: IPH-13-128-BLK"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Estoque Mínimo (Alerta)
              </label>
              <input
                type="number"
                min="0"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717]">
                Descrição Completa do Produto
              </label>
              <textarea
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes técnicos, estado de conservação, itens inclusos na caixa, garantia..."
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] placeholder-[#888888] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: PREÇOS & ESTOQUE INICIAL */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
            Valores & Estoque Inicial
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Preço de Custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precoCusto}
                onChange={(e) => setPrecoCusto(Number(e.target.value))}
                placeholder="0.00"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(Number(e.target.value))}
                placeholder="0.00"
                required
                className="mt-1.5 w-full rounded-2xl border border-[#D4AF37] bg-white p-3 text-xs font-bold text-[#B99122] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Estoque Inicial (Unidades)
              </label>
              <input
                type="number"
                min="0"
                value={estoqueInicial}
                onChange={(e) => setEstoqueInicial(Number(e.target.value))}
                placeholder="1"
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-[#666666] bg-[#FAF9F6] p-3 rounded-xl border border-[#E2DED4]">
            <Info className="h-4 w-4 shrink-0 text-[#B99122]" />
            <span>
              O estoque inicial registrará automaticamente uma movimentação de entrada. Futuras alterações devem ser feitas pela aba <strong>Controle de Estoque</strong>.
            </span>
          </div>
        </div>

        {/* SEÇÃO 4: VISIBILIDADE & DESTAQUE */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="h-5 w-5 rounded border-[#E2DED4] text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <div>
                <span className="text-xs font-bold text-[#171717]">Ativo no Catálogo</span>
                <p className="text-[10px] text-[#666666]">
                  Visível para clientes no site e na busca
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
                className="h-5 w-5 rounded border-[#E2DED4] text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <div>
                <span className="text-xs font-bold text-[#171717]">
                  Exibir na Home (Destaque)
                </span>
                <p className="text-[10px] text-[#666666]">
                  Aparecerá na vitrine principal da página inicial
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/produtos"
            className="rounded-2xl border border-[#E2DED4] px-6 py-3 text-xs font-semibold text-[#666666] hover:bg-[#FAF9F6]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-8 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Cadastrar Produto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
