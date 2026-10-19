import { CONTATO } from "@/components/site/SiteFooter";
import FormularioContato from "@/components/site/FormularioContato";
import Reveal from "@/components/site/Reveal";
import { Icon } from "@/components/ui/Icon";
import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ContatoPage() {
  usePageTitle("Contato");
  const { itens } = useEmpreendimentosPublicos();
  const canais = [
    ["messageCircle", "Como funciona", "Você envia seus dados e um especialista retorna para você", null],
    ["clock", "Horário de atendimento", CONTATO.horario, null],
  ];
  return (
    <main className="pb-editorial-page mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold">Contato</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">Vamos conversar sobre o seu próximo imóvel</h1>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          {canais.map(([icone, rotulo, valor, link], i) => {
            const miolo = (
              <>
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold"><Icon name={icone} className="size-6" /></span>
                <span className="min-w-0">
                  <span className="block text-[12px] uppercase tracking-wide text-ink-3">{rotulo}</span>
                  <span className="block truncate text-[15px] font-medium">{valor}</span>
                </span>
              </>
            );
            return (
              <Reveal key={rotulo} atraso={i * 80}>
                {link ? (
                  <a href={link} target={link.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition-colors hover:border-gold/60">{miolo}</a>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">{miolo}</div>
                )}
              </Reveal>
            );
          })}
        </div>

        <Reveal atraso={120}>
          <div className="rounded-3xl border border-gold/40 bg-card p-6 shadow-xl shadow-black/30 sm:p-8">
            <h2 className="text-xl font-semibold">Deixe seus dados</h2>
            <p className="mb-5 mt-1 text-[13px] text-ink-2">Um especialista entra em contato para ajudar você a escolher.</p>
            <FormularioContato opcoes={itens} canal="página de contato" />
          </div>
        </Reveal>
      </div>
    </main>
  );
}
