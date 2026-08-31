'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertCircle, Info, Boxes } from 'lucide-react';
import { ImageUploader, UploadedImage } from '@/components/admin/ImageUploader';
import { getCategorias, getProdutoById, saveProduto } from '@/lib/supabase/data-service';
import { Categoria, Produto } from '@/lib/supabase/types';
import { slugify } from '@/lib/utils';

export default function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [sku, setSku] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoCusto, setPrecoCusto] = useState<number>(0);
  const [precoVenda, setPrecoVenda] = useState<number>(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState<number>(2);
  const [destaque, setDestaque] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [images, setImages] = useState<UploadedImage[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prod] = await Promise.all([
          getCategorias(false),
          getProdutoById(id),
        ]);
        setCategorias(cats);
        setProduto(prod);

        if (prod) {
          setNome(prod.nome);
          setSlug(prod.slug);
          setCategoriaId(prod.categoria_id || '');
          setMarca(prod.marca || '');
          setModelo(prod.modelo || '');
          setSku(prod.sku || '');
          setDescricao(prod.descricao || '');
          setPrecoCusto(Number(prod.preco_custo));
          setPrecoVenda(Number(prod.preco_venda));
          setEstoqueMinimo(Number(prod.estoque_minimo));
          setDestaque(prod.destaque);
          setAtivo(prod.ativo);

          // Carregar fotos
          const uploadedImgs: UploadedImage[] = [];
          if (prod.imagens && prod.imagens.length > 0) {
            prod.imagens.forEach((img) => {
              uploadedImgs.push({
                url: img.url,
                caminho: img.caminho,
                is_capa: img.is_capa,
              });
            });
          } else if (prod.foto_principal) {
            uploadedImgs.push({
              url: prod.foto_principal,
              caminho: '',
              is_capa: true,
            });
          }
          setImages(uploadedImgs);
        }
      } catch (err) {
        console.error('Error loading product for edit', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

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

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const capaImg = images.find((img) => img.is_capa) || images[0];
      const fotoPrincipal = capaImg ? capaImg.url : null;

      await saveProduto({
        id,
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
          produto_id: id,
          url: img.url,
          caminho: img.caminho,
          ordem: i,
          is_capa: img.is_capa,
        })),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/produtos');
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar produto.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        <p className="mt-3 text-xs text-zinc-400">Carregando dados do produto...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="rounded-3xl border border-[#E2DED4] bg-white p-12 text-center shadow-xs">
        <h2 className="text-lg font-bold text-[#171717]">Produto não encontrado</h2>
        <Link
          href="/admin/produtos"
          className="mt-4 inline-block text-xs font-semibold text-[#B99122] hover:underline"
        >
          Voltar para listagem
        </Link>
      </div>
    );
  }

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
              Editar Produto
            </h1>
            <p className="text-xs text-[#666666]">
              Atualize as informações cadastrais e fotos deste item.
            </p>
          </div>
        </div>

        <Link
          href={`/produtos/${produto.slug}`}
          target="_blank"
          className="rounded-xl border border-[#E2DED4] bg-white px-4 py-2 text-xs font-semibold text-[#666666] hover:border-[#D4AF37] hover:text-[#171717] shadow-xs"
        >
          Ver no Catálogo ↗
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
          <span>Produto atualizado com sucesso! Redirecionando...</span>
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: FOTOS */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
            Fotos do Produto
          </h2>
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
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                URL Amigável (Slug) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
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
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Modelo
              </label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
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
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
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
                Descrição
              </label>
              <textarea
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#D4AF37] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: PREÇOS & ESTOQUE ATUAL */}
        <div className="rounded-3xl border border-[#E2DED4] bg-white p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#B99122]">
            Preços e Situação do Estoque
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
                required
                className="mt-1.5 w-full rounded-2xl border border-[#D4AF37] bg-white p-3 text-xs font-bold text-[#B99122] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717]">
                Estoque Atual (Auditado)
              </label>
              <div className="mt-1.5 flex items-center justify-between rounded-2xl border border-[#E2DED4] bg-[#FAF9F6] px-4 py-3 text-xs">
                <span className="font-bold text-[#171717]">{produto.estoque_atual} un</span>
                <Link
                  href="/admin/estoque"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#B99122] hover:underline"
                >
                  <Boxes className="h-3.5 w-3.5" />
                  Movimentar
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-[#666666] bg-[#FAF9F6] p-3 rounded-xl border border-[#E2DED4]">
            <Info className="h-4 w-4 shrink-0 text-[#B99122]" />
            <span>
              O estoque não pode ser alterado diretamente nesta tela para proteger a rastreabilidade e histórico fiscal/físico. Use a tela de <strong>Controle de Estoque</strong> para entradas, saídas ou ajustes.
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
            Voltar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-8 py-3 text-xs font-bold text-[#171717] transition hover:bg-[#B99122] hover:text-white shadow-sm disabled:opacity-50"
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
      </form>
    </div>
  );
}
