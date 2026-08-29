"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Produto = {
  id: string;
  nome: string;
  sku: string | null;
  categoria_id: string | null;
  marca: string | null;
  modelo: string | null;
  descricao: string | null;
  preco_custo: number;
  preco_venda: number;
  estoque: number;
  estoque_minimo: number;
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [pesquisa, setPesquisa] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [produtoEditando, setProdutoEditando] =
    useState<Produto | null>(null);

  const [nome, setNome] = useState("");
  const [sku, setSku] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [estoque, setEstoque] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");

  const [mensagem, setMensagem] = useState("");

  async function carregarProdutos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("produtos")
      .select(
        "id,nome,sku,categoria_id,marca,modelo,descricao,preco_custo,preco_venda,estoque,estoque_minimo"
      )
      .order("nome", { ascending: true });

    if (error) {
      console.error(error);
      setMensagem("Erro ao carregar produtos: " + error.message);
    } else {
      setProdutos(data || []);
    }

    setCarregando(false);
  }

  useEffect(() => {
    // O primeiro carregamento consulta um sistema externo (Supabase).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarProdutos();
  }, []);

  function limparFormulario() {
    setNome("");
    setSku("");
    setMarca("");
    setModelo("");
    setDescricao("");
    setPrecoCusto("");
    setPrecoVenda("");
    setEstoque("");
    setEstoqueMinimo("");
    setProdutoEditando(null);
    setModoEdicao(false);
  }

  function abrirNovoProduto() {
    limparFormulario();
    setMensagem("");
    setModalAberto(true);
  }

  function abrirEdicao(produto: Produto) {
    setModoEdicao(true);
    setProdutoEditando(produto);

    setNome(produto.nome || "");
    setSku(produto.sku || "");
    setMarca(produto.marca || "");
    setModelo(produto.modelo || "");
    setDescricao(produto.descricao || "");
    setPrecoCusto(String(produto.preco_custo ?? ""));
    setPrecoVenda(String(produto.preco_venda ?? ""));
    setEstoque(String(produto.estoque ?? ""));
    setEstoqueMinimo(String(produto.estoque_minimo ?? ""));

    setMensagem("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    limparFormulario();
  }

  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      setMensagem("Informe o nome do produto.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    const dadosProduto = {
      nome: nome.trim(),
      sku: sku.trim() || null,
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      descricao: descricao.trim() || null,
      preco_custo: Number(precoCusto) || 0,
      preco_venda: Number(precoVenda) || 0,
      estoque: Number(estoque) || 0,
      estoque_minimo: Number(estoqueMinimo) || 0,
    };

    if (modoEdicao && produtoEditando) {
      const { error } = await supabase
        .from("produtos")
        .update(dadosProduto)
        .eq("id", produtoEditando.id);

      if (error) {
        console.error(error);
        setMensagem("Erro ao atualizar produto: " + error.message);
        setSalvando(false);
        return;
      }

      setMensagem("✅ Produto atualizado com sucesso!");
    } else {
      const { error } = await supabase
        .from("produtos")
        .insert(dadosProduto);

      if (error) {
        console.error(error);
        setMensagem("Erro ao salvar produto: " + error.message);
        setSalvando(false);
        return;
      }

      setMensagem("✅ Produto salvo com sucesso!");
    }

    await carregarProdutos();

    setTimeout(() => {
      setModalAberto(false);
      limparFormulario();
      setMensagem("");
    }, 700);

    setSalvando(false);
  }

  async function excluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o produto "${produto.nome}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", produto.id);

    if (error) {
      console.error(error);
      setMensagem("Erro ao excluir produto: " + error.message);
      return;
    }

    setMensagem("✅ Produto excluído com sucesso!");

    await carregarProdutos();
  }

  function formatarMoeda(valor: number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function calcularMargem(produto: Produto) {
    if (!produto.preco_venda || produto.preco_venda === 0) {
      return 0;
    }

    return (
      ((produto.preco_venda - produto.preco_custo) /
        produto.preco_venda) *
      100
    );
  }

  function statusEstoque(produto: Produto) {
    if (produto.estoque <= 0) {
      return {
        texto: "Sem estoque",
        classe: "bg-red-100 text-red-700",
      };
    }

    if (produto.estoque <= produto.estoque_minimo) {
      return {
        texto: "Estoque baixo",
        classe: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      texto: "Normal",
      classe: "bg-green-100 text-green-700",
    };
  }

  const produtosFiltrados = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();

    if (!termo) return produtos;

    return produtos.filter((produto) => {
      return (
        produto.nome?.toLowerCase().includes(termo) ||
        produto.sku?.toLowerCase().includes(termo) ||
        produto.marca?.toLowerCase().includes(termo) ||
        produto.modelo?.toLowerCase().includes(termo)
      );
    });
  }, [produtos, pesquisa]);

  const totalProdutos = produtos.length;

  const estoqueBaixo = produtos.filter(
    (produto) =>
      produto.estoque > 0 && produto.estoque <= produto.estoque_minimo
  ).length;

  const semEstoque = produtos.filter(
    (produto) => produto.estoque <= 0
  ).length;

  const valorEstoque = produtos.reduce(
    (total, produto) =>
      total +
      Number(produto.preco_custo || 0) *
        Number(produto.estoque || 0),
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Produtos
            </h1>

            <p className="text-gray-500 mt-1">
              Gerencie seus produtos e estoque.
            </p>
          </div>

          <button
            onClick={abrirNovoProduto}
            className="bg-black text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            + Novo produto
          </button>

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Total de produtos
            </p>

            <p className="text-2xl font-bold mt-2">
              {totalProdutos}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Estoque baixo
            </p>

            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {estoqueBaixo}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Sem estoque
            </p>

            <p className="text-2xl font-bold text-red-600 mt-2">
              {semEstoque}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Valor do estoque
            </p>

            <p className="text-2xl font-bold mt-2">
              {formatarMoeda(valorEstoque)}
            </p>
          </div>

        </div>

        {/* PESQUISA */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">

          <input
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="🔎 Pesquisar por nome, SKU, marca ou modelo..."
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />

        </div>

        {/* MENSAGEM */}
        {mensagem && !modalAberto && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            {mensagem}
          </div>
        )}

        {/* TABELA */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          <div className="p-5 border-b">
            <h2 className="font-semibold text-lg">
              Produtos cadastrados
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {produtosFiltrados.length} produto(s) encontrado(s)
            </p>
          </div>

          {carregando ? (

            <div className="p-8 text-center text-gray-500">
              Carregando produtos...
            </div>

          ) : produtosFiltrados.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              {pesquisa
                ? "Nenhum produto encontrado para essa pesquisa."
                : "Nenhum produto cadastrado."}
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead className="bg-gray-50">
                  <tr>

                    <th className="text-left p-4">
                      Produto
                    </th>

                    <th className="text-left p-4">
                      SKU
                    </th>

                    <th className="text-left p-4">
                      Marca
                    </th>

                    <th className="text-left p-4">
                      Modelo
                    </th>

                    <th className="text-left p-4">
                      Custo
                    </th>

                    <th className="text-left p-4">
                      Venda
                    </th>

                    <th className="text-left p-4">
                      Margem
                    </th>

                    <th className="text-left p-4">
                      Estoque
                    </th>

                    <th className="text-left p-4">
                      Status
                    </th>

                    <th className="text-left p-4">
                      Ações
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {produtosFiltrados.map((produto) => {

                    const status = statusEstoque(produto);

                    return (
                      <tr
                        key={produto.id}
                        className="border-t hover:bg-gray-50"
                      >

                        <td className="p-4 font-semibold">
                          {produto.nome}
                        </td>

                        <td className="p-4">
                          {produto.sku || "-"}
                        </td>

                        <td className="p-4">
                          {produto.marca || "-"}
                        </td>

                        <td className="p-4">
                          {produto.modelo || "-"}
                        </td>

                        <td className="p-4">
                          {formatarMoeda(
                            produto.preco_custo
                          )}
                        </td>

                        <td className="p-4 font-semibold">
                          {formatarMoeda(
                            produto.preco_venda
                          )}
                        </td>

                        <td className="p-4">
                          {calcularMargem(produto).toFixed(1)}%
                        </td>

                        <td className="p-4 font-semibold">
                          {produto.estoque}
                        </td>

                        <td className="p-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${status.classe}`}
                          >
                            {status.texto}
                          </span>

                        </td>

                        <td className="p-4">

                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                abrirEdicao(produto)
                              }
                              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                            >
                              ✏️ Editar
                            </button>

                            <button
                              onClick={() =>
                                excluirProduto(produto)
                              }
                              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm"
                            >
                              🗑️ Excluir
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* MODAL */}
      {modalAberto && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            <div className="p-6 border-b flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  {modoEdicao
                    ? "Editar produto"
                    : "Novo produto"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {modoEdicao
                    ? "Atualize as informações do produto."
                    : "Cadastre um novo produto."}
                </p>
              </div>

              <button
                onClick={fecharModal}
                className="text-gray-500 hover:text-black text-2xl"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={salvarProduto}
              className="p-6 space-y-5"
            >

              <div>
                <label className="block font-medium mb-2">
                  Nome do produto *
                </label>

                <input
                  value={nome}
                  onChange={(e) =>
                    setNome(e.target.value)
                  }
                  required
                  className="w-full border rounded-lg p-3"
                  placeholder="Ex: Samsung Galaxy A15"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-medium mb-2">
                    SKU
                  </label>

                  <input
                    value={sku}
                    onChange={(e) =>
                      setSku(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Marca
                  </label>

                  <input
                    value={marca}
                    onChange={(e) =>
                      setMarca(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

              </div>

              <div>
                <label className="block font-medium mb-2">
                  Modelo
                </label>

                <input
                  value={modelo}
                  onChange={(e) =>
                    setModelo(e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Descrição
                </label>

                <textarea
                  value={descricao}
                  onChange={(e) =>
                    setDescricao(e.target.value)
                  }
                  rows={3}
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-medium mb-2">
                    Preço de custo
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={precoCusto}
                    onChange={(e) =>
                      setPrecoCusto(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Preço de venda
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={precoVenda}
                    onChange={(e) =>
                      setPrecoVenda(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-medium mb-2">
                    Estoque
                  </label>

                  <input
                    type="number"
                    value={estoque}
                    onChange={(e) =>
                      setEstoque(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Estoque mínimo
                  </label>

                  <input
                    type="number"
                    value={estoqueMinimo}
                    onChange={(e) =>
                      setEstoqueMinimo(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

              </div>

              {mensagem && (
                <div className="bg-gray-100 rounded-lg p-3">
                  {mensagem}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="px-5 py-3 rounded-lg border hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando..."
                    : modoEdicao
                    ? "Salvar alterações"
                    : "Cadastrar produto"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}
