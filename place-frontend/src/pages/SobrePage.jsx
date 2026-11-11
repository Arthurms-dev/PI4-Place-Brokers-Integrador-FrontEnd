import { useContato } from "@/components/site/ContatoProvider";
import { NumerosDaPlace, Premiacoes, VideosDoTime } from "@/components/site/home/ProvaSocial";
import Reveal from "@/components/site/Reveal";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PERFIL_INSTAGRAM } from "@/lib/provaSocial";
import fotoDoTime from "@/assets/instagram/time-place.webp";

const PILARES = [
  ["messageCircle", "Atendimento especializado", "Cada cliente fala com um corretor que conhece o imóvel a fundo."],
  ["book", "Informação clara", "Book, tabela de preços e condições sempre atualizados, sem letra miúda."],
  ["building", "Acompanhamento até as chaves", "Da primeira visita à entrega do imóvel, a gente continua por perto."],
];

export default function SobrePage() {
  usePageTitle("Sobre nós");
  const { abrirContato } = useContato();
  return (
    <main className="pb-editorial-page mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-[850px]">
        <Reveal>
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold">Sobre nós</p>
        </Reveal>
        <Reveal atraso={90}>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Imóveis com <span className="pb-texto-ouro">gente de verdade</span> ao seu lado</h1>
        </Reveal>
        <Reveal atraso={180}>
        <p className="mt-5 text-[16px] leading-relaxed text-ink-2">
          A Place Brokers é uma imobiliária de alta performance em Recife. Atuamos na Região Metropolitana, em Caruaru e no litoral, com lançamentos de diversas construtoras e imóveis prontos para morar. Cada cliente é atendido por um corretor do nosso time, que ajuda a escolher com segurança.
        </p>
        </Reveal>
      </div>

      <div className="mt-12 grid items-center gap-8 md:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <figure className="relative w-full">
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
            <a href={PERFIL_INSTAGRAM.url} target="_blank" rel="noreferrer" aria-label="Ver o time no Instagram da Place" className="group block overflow-hidden rounded-3xl border border-line transition duration-500 hover:-translate-y-1 hover:border-gold/60 hover:shadow-2xl">
              <img src={fotoDoTime} alt="Time da Place Brokers reunido em treinamento no escritório" width="1024" height="768" loading="lazy" decoding="async" className="animate-kenburns aspect-4/3 w-full object-cover" />
            </a>
            <figcaption className="mt-2 text-center text-[12px] text-ink-3">O time da Place reunido no escritório.</figcaption>
          </figure>
        </Reveal>
        <Reveal atraso={100}>
          <h2 className="text-2xl font-semibold sm:text-3xl">A Place em números</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-2">Dados que você mesmo pode conferir: a nota no Google, o nosso Instagram e o registro no CRECI.</p>
          <NumerosDaPlace tema="escuro" className="mt-5" />
          <a href={PERFIL_INSTAGRAM.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-gold underline-offset-4 hover:underline">
            <Icon name="instagram" className="size-5" /> Acompanhe o dia a dia em @{PERFIL_INSTAGRAM.usuario}
          </a>
        </Reveal>
      </div>

      <section className="mt-14" aria-label="Prêmios da Place">
        <Premiacoes tema="escuro" />
      </section>

      <section className="mt-14" aria-labelledby="titulo-dia-a-dia">
        <h2 id="titulo-dia-a-dia" className="mb-4 text-xl font-semibold sm:text-2xl">O time no dia a dia</h2>
        <VideosDoTime />
      </section>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {PILARES.map(([icone, titulo, texto], i) => (
          <Reveal key={titulo} atraso={i * 100}>
            <div className="group h-full rounded-2xl border border-line bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl">
              <span className="grid size-12 place-items-center rounded-xl bg-gold/15 text-gold transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-gold/25"><Icon name={icone} className="size-6" /></span>
              <h2 className="mt-4 text-lg font-semibold">{titulo}</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{texto}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <button type="button" onClick={() => abrirContato(null, "página sobre")} className="h-14 rounded-full bg-gold-gradient px-8 text-[15px] font-semibold text-[#1a1408] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg active:scale-95">Fale com um especialista</button>
      </Reveal>
    </main>
  );
}
