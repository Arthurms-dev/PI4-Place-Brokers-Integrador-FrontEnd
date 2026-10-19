import { useContato } from "@/components/site/ContatoProvider";
import Reveal from "@/components/site/Reveal";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";

const PILARES = [
  ["messageCircle", "Atendimento especializado", "Cada cliente fala com um corretor que conhece o lançamento a fundo."],
  ["book", "Informação clara", "Book, tabela de preços e condições sempre atualizados, sem letra miúda."],
  ["building", "Acompanhamento até as chaves", "Da primeira visita à entrega do imóvel, a gente continua por perto."],
];

export default function SobrePage() {
  usePageTitle("Sobre nós");
  const { abrirContato } = useContato();
  return (
    <main className="pb-editorial-page mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold">Sobre nós</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Imóveis novos, com gente de verdade ao seu lado</h1>
        <p className="mt-5 text-[16px] leading-relaxed text-ink-2">
          A Place Brokers é uma imobiliária focada em lançamentos em Pernambuco. Reunimos os melhores empreendimentos do litoral à Região Metropolitana e conectamos cada cliente a um especialista que ajuda a escolher com segurança.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {PILARES.map(([icone, titulo, texto], i) => (
          <Reveal key={titulo} atraso={i * 100}>
            <div className="h-full rounded-2xl border border-line bg-card p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-gold/15 text-gold"><Icon name={icone} className="size-6" /></span>
              <h2 className="mt-4 text-lg font-semibold">{titulo}</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{texto}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <button type="button" onClick={() => abrirContato(null, "página sobre")} className="h-14 rounded-full bg-gold-gradient px-8 text-[15px] font-semibold text-[#1a1408] transition hover:brightness-110">Fale com um especialista</button>
      </Reveal>
    </main>
  );
}
