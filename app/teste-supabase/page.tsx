import { supabase } from "@/lib/supabase";

export default async function TesteSupabase() {
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome, descricao")
    .order("nome");

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-3xl font-bold">
        Teste da Central Phones
      </h1>

      {error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 p-5">
          <h2 className="font-bold text-red-400">
            Erro ao consultar o Supabase
          </h2>

          <p className="mt-2 text-sm">
            {error.message}
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold">
            Categorias cadastradas
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((categoria) => (
              <div
                key={categoria.id}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold">
                  {categoria.nome}
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  {categoria.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}