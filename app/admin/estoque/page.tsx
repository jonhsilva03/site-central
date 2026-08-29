"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

type Produto = {
  id: string;
  nome: string;
  sku: string | null;
  marca: string | null;
  modelo: string | null;
  estoque: number;
  estoque_minimo: number;
};

type ProdutoDaMovimentacao = {
  nome: string;
  sku: string | null;
};

type Movimentacao = {
  id: string;
  produto_id: string;
  tipo: string;
  quantidade: number;
  estoque_anterior: number;
  estoque_posterior: number;
  motivo: string | null;
  observacao: string | null;
  created_at: string;
  produto: ProdutoDaMovimentacao | null;
};

const tipos = [
  {
    valor: "entrada",
    nome: "Entrada",
    simbolo: "+",
    descricao: "Adicionar produtos ao estoque",
  },
  {
    valor: "saida",
    nome: "Saída",
    simbolo: "−",
    descricao: "Retirar produtos do estoque",
  },
  {
    valor: "ajuste",
    nome: "Ajuste",
    simbolo: "↔",
    descricao: "Definir o estoque atual",
  },
  {
    valor: "devolucao",
    nome: "Devolução",
    simbolo: "↩",
    descricao: "Registrar devolução de produto",
  },
] as const;

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const [produtoId, setProdutoId] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observacao, setObservacao] = useState("");

  const [pesquisaProduto, setPesquisaProduto] = useState("");
  const [pesquisaHistorico, setPesquisaHistorico] = useState("");
  const [filtroTipoHistorico, setFiltroTipoHistorico] = useState("todos");
  const [mensagemModal, setMensagemModal] = useState("");
  const [erroCarregamento, setErroCarregamento] = useState("");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErroCarregamento("");

    const [produtosResult, movimentacoesResult] = await Promise.all([
      supabase
        .from("produtos")
        .select("id,nome,sku,marca,modelo,estoque,estoque_minimo")
        .order("nome", { ascending: true }),
      supabase
        .from("movimentacoes_estoque")
        .select(
          `
            id,
            produto_id,
            tipo,
            quantidade,
            estoque_anterior,
            estoque_posterior,
            motivo,
            observacao,
            created_at,
            produto:produtos!movimentacoes_estoque_produto_id_fkey (
              nome,
              sku
            )
          `,
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    const erros: string[] = [];

    if (produtosResult.error) {
      console.error(produtosResult.error);
      erros.push(`Produtos: ${produtosResult.error.message}`);
    } else {
      setProdutos(produtosResult.data ?? []);
    }

    if (movimentacoesResult.error) {
      console.error(movimentacoesResult.error);
      erros.push(`Histórico: ${movimentacoesResult.error.message}`);
    } else {
      setMovimentacoes(
        (movimentacoesResult.data ?? []) as unknown as Movimentacao[],
      );
    }

    setErroCarregamento(erros.join(" | "));
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  function abrirMovimentacao(tipoSelecionado: string, produtoInicial = "") {
    setTipo(tipoSelecionado);
    setProdutoId(produtoInicial);
    setQuantidade("");
    setMotivo("");
    setObservacao("");
    setMensagemModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
    setMensagemModal("");
  }

  async function salvarMovimentacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!produtoId) {
      setMensagemModal("Selecione um produto.");
      return;
    }

    const quantidadeNumero = Number(quantidade);

    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
      setMensagemModal("Informe uma quantidade inteira maior que zero.");
      return;
    }

    setSalvando(true);
    setMensagemModal("");

    const { error } = await supabase.rpc("movimentar_estoque", {
      p_produto_id: produtoId,
      p_tipo: tipo,
      p_quantidade: quantidadeNumero,
      p_motivo: motivo.trim() || null,
      p_observacao: observacao.trim() || null,
    });

    if (error) {
      console.error(error);
      setMensagemModal(`Erro ao movimentar estoque: ${error.message}`);
      setSalvando(false);
      return;
    }

    await carregarDados();
    setMensagemModal("✅ Estoque atualizado e movimentação registrada!");
    setSalvando(false);

    window.setTimeout(() => {
      setModalAberto(false);
      setMensagemModal("");
    }, 900);
  }

  function formatarData(data: string) {
    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) return "Data inválida";

    return dataConvertida.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function nomeTipo(tipoMovimentacao: string) {
    return (
      tipos.find((item) => item.valor === tipoMovimentacao)?.nome ??
      tipoMovimentacao
    );
  }

  function estiloTipo(tipoMovimentacao: string) {
    if (tipoMovimentacao === "entrada") {
      return "bg-green-100 text-green-700";
    }

    if (tipoMovimentacao === "saida") {
      return "bg-red-100 text-red-700";
    }

    if (tipoMovimentacao === "devolucao") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  function quantidadeFormatada(movimentacao: Movimentacao) {
    if (["entrada", "devolucao"].includes(movimentacao.tipo)) {
      return `+${movimentacao.quantidade}`;
    }

    if (movimentacao.tipo === "saida") {
      return `−${movimentacao.quantidade}`;
    }

    return `=${movimentacao.estoque_posterior}`;
  }

  const produtosFiltrados = useMemo(() => {
    const termo = pesquisaProduto.toLocaleLowerCase("pt-BR").trim();

    if (!termo) return produtos;

    return produtos.filter((produto) =>
      [produto.nome, produto.sku, produto.marca, produto.modelo].some((valor) =>
        valor?.toLocaleLowerCase("pt-BR").includes(termo),
      ),
    );
  }, [produtos, pesquisaProduto]);

  const movimentacoesFiltradas = useMemo(() => {
    const termo = pesquisaHistorico.toLocaleLowerCase("pt-BR").trim();

    return movimentacoes.filter((movimentacao) => {
      const correspondeAoTipo =
        filtroTipoHistorico === "todos" ||
        movimentacao.tipo === filtroTipoHistorico;

      const correspondeAoTexto =
        !termo ||
        [
          movimentacao.produto?.nome,
          movimentacao.produto?.sku,
          movimentacao.motivo,
          movimentacao.observacao,
        ].some((valor) => valor?.toLocaleLowerCase("pt-BR").includes(termo));

      return correspondeAoTipo && correspondeAoTexto;
    });
  }, [filtroTipoHistorico, movimentacoes, pesquisaHistorico]);

  const totalProdutos = produtos.length;
  const estoqueBaixo = produtos.filter(
    (produto) =>
      produto.estoque > 0 && produto.estoque <= produto.estoque_minimo,
  ).length;
  const semEstoque = produtos.filter((produto) => produto.estoque <= 0).length;
  const quantidadeTotal = produtos.reduce(
    (total, produto) => total + Number(produto.estoque || 0),
    0,
  );
  const produtoSelecionado = produtos.find(
    (produto) => produto.id === produtoId,
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
            <p className="mt-1 text-gray-500">
              Controle entradas, saídas e movimentações da Central Phones.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarDados()}
            disabled={carregando}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {carregando ? "Atualizando..." : "Atualizar dados"}
          </button>
        </header>

        {erroCarregamento && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Não foi possível carregar todos os dados.</strong>
            <p className="mt-1">{erroCarregamento}</p>
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Produtos</p>
            <p className="mt-2 text-2xl font-bold">{totalProdutos}</p>
          </article>

          <article className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Quantidade em estoque</p>
            <p className="mt-2 text-2xl font-bold">{quantidadeTotal}</p>
          </article>

          <article className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Estoque baixo</p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {estoqueBaixo}
            </p>
          </article>

          <article className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Sem estoque</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{semEstoque}</p>
          </article>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {tipos.map((item) => (
            <button
              key={item.valor}
              type="button"
              onClick={() => abrirMovimentacao(item.valor)}
              className="rounded-xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
            >
              <span className="mb-2 block text-2xl font-bold">
                {item.simbolo}
              </span>
              <span className="block font-semibold">{item.nome}</span>
              <span className="mt-1 block text-xs text-gray-500">
                {item.descricao}
              </span>
            </button>
          ))}
        </section>

        <section className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Estoque atual</h2>
                <p className="text-sm text-gray-500">
                  {produtosFiltrados.length} produto(s)
                </p>
              </div>

              <label className="w-full md:max-w-sm">
                <span className="sr-only">Pesquisar produto</span>
                <input
                  type="search"
                  value={pesquisaProduto}
                  onChange={(evento) => setPesquisaProduto(evento.target.value)}
                  placeholder="Pesquisar nome, SKU, marca ou modelo"
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </label>
            </div>
          </div>

          {carregando ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum produto encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left">Produto</th>
                    <th className="p-4 text-left">SKU</th>
                    <th className="p-4 text-left">Estoque</th>
                    <th className="p-4 text-left">Mínimo</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {produtosFiltrados.map((produto) => {
                    const sem = produto.estoque <= 0;
                    const baixo =
                      produto.estoque > 0 &&
                      produto.estoque <= produto.estoque_minimo;

                    return (
                      <tr
                        key={produto.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div className="font-semibold">{produto.nome}</div>
                          <div className="text-xs text-gray-500">
                            {[produto.marca, produto.modelo]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </div>
                        </td>
                        <td className="p-4">{produto.sku || "—"}</td>
                        <td className="p-4 text-lg font-bold">
                          {produto.estoque}
                        </td>
                        <td className="p-4">{produto.estoque_minimo}</td>
                        <td className="p-4">
                          {sem ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Sem estoque
                            </span>
                          ) : baixo ? (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Estoque baixo
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() =>
                              abrirMovimentacao("entrada", produto.id)
                            }
                            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                          >
                            Movimentar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Histórico de movimentações
                </h2>
                <p className="text-sm text-gray-500">
                  {movimentacoesFiltradas.length} de {movimentacoes.length}
                  movimentação(ões) exibida(s)
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_180px] lg:max-w-2xl">
                <label>
                  <span className="sr-only">Pesquisar no histórico</span>
                  <input
                    type="search"
                    value={pesquisaHistorico}
                    onChange={(evento) =>
                      setPesquisaHistorico(evento.target.value)
                    }
                    placeholder="Pesquisar produto, SKU ou motivo"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </label>

                <label>
                  <span className="sr-only">Filtrar tipo</span>
                  <select
                    value={filtroTipoHistorico}
                    onChange={(evento) =>
                      setFiltroTipoHistorico(evento.target.value)
                    }
                    className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="todos">Todos os tipos</option>
                    {tipos.map((item) => (
                      <option key={item.valor} value={item.valor}>
                        {item.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          {carregando ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma movimentação encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left">Data</th>
                    <th className="p-4 text-left">Produto</th>
                    <th className="p-4 text-left">Tipo</th>
                    <th className="p-4 text-left">Quantidade</th>
                    <th className="p-4 text-left">Antes</th>
                    <th className="p-4 text-left">Depois</th>
                    <th className="p-4 text-left">Motivo</th>
                    <th className="p-4 text-left">Observação</th>
                  </tr>
                </thead>

                <tbody>
                  {movimentacoesFiltradas.map((movimentacao) => (
                    <tr
                      key={movimentacao.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap p-4 text-sm">
                        {formatarData(movimentacao.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">
                          {movimentacao.produto?.nome ||
                            "Produto não encontrado"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {movimentacao.produto?.sku || "Sem SKU"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${estiloTipo(
                            movimentacao.tipo,
                          )}`}
                        >
                          {nomeTipo(movimentacao.tipo)}
                        </span>
                      </td>
                      <td className="p-4 font-bold">
                        {quantidadeFormatada(movimentacao)}
                      </td>
                      <td className="p-4">{movimentacao.estoque_anterior}</td>
                      <td className="p-4 font-semibold">
                        {movimentacao.estoque_posterior}
                      </td>
                      <td className="max-w-xs p-4">
                        {movimentacao.motivo || "—"}
                      </td>
                      <td className="max-w-xs p-4">
                        {movimentacao.observacao || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-estoque"
            className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 id="titulo-modal-estoque" className="text-xl font-bold">
                  Movimentar estoque
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Registre uma movimentação.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar"
                className="text-2xl text-gray-500 hover:text-black disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarMovimentacao} className="space-y-5 p-6">
              <label className="block">
                <span className="mb-2 block font-medium">
                  Tipo de movimentação
                </span>
                <select
                  value={tipo}
                  onChange={(evento) => setTipo(evento.target.value)}
                  className="w-full rounded-lg border bg-white p-3"
                >
                  {tipos.map((item) => (
                    <option key={item.valor} value={item.valor}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-medium">Produto *</span>
                <select
                  value={produtoId}
                  onChange={(evento) => setProdutoId(evento.target.value)}
                  required
                  className="w-full rounded-lg border bg-white p-3"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                      {produto.sku ? ` — ${produto.sku}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              {produtoSelecionado && (
                <div className="rounded-lg bg-gray-100 p-4">
                  <p className="text-sm text-gray-500">Estoque atual</p>
                  <p className="text-2xl font-bold">
                    {produtoSelecionado.estoque}
                  </p>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block font-medium">
                  {tipo === "ajuste" ? "Novo estoque *" : "Quantidade *"}
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantidade}
                  onChange={(evento) => setQuantidade(evento.target.value)}
                  required
                  placeholder="0"
                  className="w-full rounded-lg border p-3"
                />
                {tipo === "ajuste" && (
                  <span className="mt-1 block text-xs text-gray-500">
                    No ajuste, informe o novo estoque total.
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block font-medium">Motivo</span>
                <input
                  type="text"
                  value={motivo}
                  onChange={(evento) => setMotivo(evento.target.value)}
                  placeholder="Ex.: compra de mercadoria"
                  className="w-full rounded-lg border p-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-medium">Observação</span>
                <textarea
                  value={observacao}
                  onChange={(evento) => setObservacao(evento.target.value)}
                  rows={3}
                  placeholder="Informações adicionais"
                  className="w-full rounded-lg border p-3"
                />
              </label>

              {mensagemModal && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    mensagemModal.startsWith("✅")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {mensagemModal}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="rounded-lg border px-5 py-3 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {salvando ? "Processando..." : "Confirmar movimentação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
