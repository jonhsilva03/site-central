const servicos = [
  {
    icone: "📱",
    titulo: "Troca de Tela",
    descricao: "Substituição de telas quebradas ou danificadas.",
  },
  {
    icone: "🔋",
    titulo: "Troca de Bateria",
    descricao: "Recupere a autonomia e o desempenho do seu aparelho.",
  },
  {
    icone: "🔧",
    titulo: "Reparo de Placa",
    descricao: "Diagnóstico e reparos especializados em placas.",
  },
  {
    icone: "💻",
    titulo: "Notebooks",
    descricao: "Formatação, upgrades, manutenção e recuperação de dados.",
  },
  {
    icone: "🎮",
    titulo: "Videogames",
    descricao: "Manutenção e reparos para consoles e controles.",
  },
  {
    icone: "🛠️",
    titulo: "Manutenção",
    descricao: "Manutenção preventiva e corretiva de eletrônicos.",
  },
];

const diferenciais = [
  "Atendimento especializado",
  "Orçamento antes do serviço",
  "Garantia nos serviços",
  "Transparência com o cliente",
];

export default function Home() {
  const whatsapp =
    "https://wa.me/5532935054792?text=Olá%20Central%20Phones!%20Gostaria%20de%20solicitar%20um%20orçamento.";

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <a href="#" className="group">
            <div className="text-2xl font-black tracking-wide">
              CENTRAL{" "}
              <span className="text-[#D4AF37]">PHONES</span>
            </div>

            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
              Tecnologia & Assistência
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#inicio"
              className="text-sm text-gray-300 transition hover:text-[#D4AF37]"
            >
              Início
            </a>

            <a
              href="#servicos"
              className="text-sm text-gray-300 transition hover:text-[#D4AF37]"
            >
              Serviços
            </a>

            <a
              href="#produtos"
              className="text-sm text-gray-300 transition hover:text-[#D4AF37]"
            >
              Produtos
            </a>

            <a
              href="#sobre"
              className="text-sm text-gray-300 transition hover:text-[#D4AF37]"
            >
              Sobre
            </a>

            <a
              href="#contato"
              className="text-sm text-gray-300 transition hover:text-[#D4AF37]"
            >
              Contato
            </a>
          </nav>

          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#f0cf63]"
          >
            WhatsApp
          </a>

        </div>
      </header>

      {/* ================= HERO ================= */}

      <section id="inicio" className="relative overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(212,175,55,0.12),transparent_35%)]" />

        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">

          <div>

            <div className="mb-6 inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Assistência Técnica Especializada
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
              Seu aparelho.
              <br />
              <span className="text-[#D4AF37]">
                Nossa responsabilidade.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-400">
              A Central Phones cuida do seu celular, notebook, videogame e
              eletrônicos com atendimento especializado, transparência e
              qualidade.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">

              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#D4AF37] px-8 py-4 text-center font-bold text-black transition hover:scale-105 hover:bg-[#f0cf63]"
              >
                Solicitar orçamento
              </a>

              <a
                href="#servicos"
                className="rounded-full border border-white/20 px-8 py-4 text-center font-bold transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
              >
                Ver serviços
              </a>

            </div>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">

              {diferenciais.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-gray-400"
                >
                  <span className="text-[#D4AF37]">✓</span>
                  {item}
                </div>
              ))}

            </div>

          </div>

          {/* APARELHO DESTAQUE */}

          <div className="flex justify-center">

            <div className="relative h-[500px] w-[320px] rounded-[45px] border border-[#D4AF37]/30 bg-gradient-to-b from-zinc-800 via-zinc-950 to-black p-3 shadow-2xl shadow-[#D4AF37]/10">

              <div className="flex h-full flex-col items-center justify-between rounded-[36px] border border-white/5 bg-black px-6 py-10">

                <div className="mt-4 h-2 w-20 rounded-full bg-zinc-800" />

                <div className="text-center">

                  <div className="mb-6 text-8xl">
                    📱
                  </div>

                  <div className="text-xl font-bold">
                    CENTRAL
                  </div>

                  <div className="text-2xl font-black text-[#D4AF37]">
                    PHONES
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    Tecnologia que conecta você.
                  </p>

                </div>

                <div className="grid w-full grid-cols-3 gap-2">

                  <div className="rounded-xl bg-zinc-900 p-3 text-center">
                    <div>🔧</div>
                    <div className="mt-1 text-[9px] text-gray-500">
                      Reparo
                    </div>
                  </div>

                  <div className="rounded-xl bg-zinc-900 p-3 text-center">
                    <div>📱</div>
                    <div className="mt-1 text-[9px] text-gray-500">
                      Celular
                    </div>
                  </div>

                  <div className="rounded-xl bg-zinc-900 p-3 text-center">
                    <div>💻</div>
                    <div className="mt-1 text-[9px] text-gray-500">
                      Notebook
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= SERVIÇOS ================= */}

      <section id="servicos" className="border-y border-white/5 bg-zinc-950 px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Nossos serviços
            </div>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Tecnologia com quem entende.
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Conte com a Central Phones para manutenção, reparos e cuidados
              com seus equipamentos.
            </p>

          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {servicos.map((servico) => (

              <div
                key={servico.titulo}
                className="group rounded-3xl border border-white/10 bg-black p-7 transition duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/40"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-3xl">
                  {servico.icone}
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {servico.titulo}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {servico.descricao}
                </p>

                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block text-sm font-semibold text-[#D4AF37]"
                >
                  Solicitar orçamento →
                </a>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= PRODUTOS ================= */}

      <section id="produtos" className="px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                Loja
              </div>

              <h2 className="mt-3 text-4xl font-black">
                Produtos em destaque
              </h2>

              <p className="mt-4 max-w-xl text-gray-500">
                Em breve você poderá consultar nossos celulares e acessórios
                diretamente pelo site.
              </p>

            </div>

            <span className="rounded-full border border-[#D4AF37]/30 px-5 py-2 text-sm text-[#D4AF37]">
              Em breve
            </span>

          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">

              <div className="flex h-52 items-center justify-center rounded-2xl bg-black text-7xl">
                📱
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Smartphones
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Celulares novos e usados selecionados pela Central Phones.
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">

              <div className="flex h-52 items-center justify-center rounded-2xl bg-black text-7xl">
                🎧
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Acessórios
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Cabos, carregadores, películas, capas e muito mais.
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">

              <div className="flex h-52 items-center justify-center rounded-2xl bg-black text-7xl">
                💻
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Informática
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Notebooks e equipamentos selecionados para você.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ================= SOBRE ================= */}

      <section id="sobre" className="bg-zinc-950 px-6 py-24">

        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">

          <div>

            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Sobre a Central Phones
            </div>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Mais do que assistência.
              <br />
              <span className="text-[#D4AF37]">
                Confiança.
              </span>
            </h2>

          </div>

          <div>

            <p className="leading-8 text-gray-400">
              A Central Phones nasceu para oferecer tecnologia, assistência
              técnica e atendimento de qualidade em um só lugar.
            </p>

            <p className="mt-5 leading-8 text-gray-400">
              Nosso objetivo é resolver o problema do cliente de forma
              transparente, oferecendo orientação antes, durante e depois do
              serviço.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-white/10 p-5">
                <div className="text-3xl font-black text-[#D4AF37]">
                  ✓
                </div>
                <div className="mt-2 font-semibold">
                  Qualidade
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 p-5">
                <div className="text-3xl font-black text-[#D4AF37]">
                  ✓
                </div>
                <div className="mt-2 font-semibold">
                  Transparência
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section id="contato" className="px-6 py-24">

        <div className="mx-auto max-w-5xl overflow-hidden rounded-[40px] border border-[#D4AF37]/30 bg-gradient-to-br from-zinc-900 to-black p-10 text-center md:p-16">

          <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Atendimento
          </div>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Precisa de um orçamento?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-gray-400">
            Fale diretamente com a Central Phones pelo WhatsApp e conte o que
            aconteceu com seu aparelho.
          </p>

          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex rounded-full bg-[#D4AF37] px-9 py-4 font-bold text-black transition hover:scale-105 hover:bg-[#f0cf63]"
          >
            Falar pelo WhatsApp
          </a>

          <div className="mt-8 text-sm text-gray-500">
            📍 São João del-Rei - MG
          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-white/10 px-6 py-10">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">

          <div>

            <div className="text-xl font-black">
              CENTRAL <span className="text-[#D4AF37]">PHONES</span>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              Tecnologia, assistência e confiança.
            </p>

          </div>

          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Central Phones
          </div>

        </div>

      </footer>

    </main>
  );
}