import { Icon } from "@/components/ui/Icon";
import Reveal from "../Reveal";

const PASSOS = [
  { icone: "list", titulo: "Escolha o lançamento", texto: "Filtre por cidade, fase e quartos e veja fotos, localização e valores de cada empreendimento." },
  { icone: "messageCircle", titulo: "Fale com um especialista", texto: "Deixe seus dados e um corretor da Place Brokers entra em contato para tirar todas as dúvidas." },
  { icone: "calendar", titulo: "Visite e feche com segurança", texto: "Agende a visita, receba book e tabela atualizados e acompanhe a negociação até a entrega." },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="titulo-como" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-16 sm:px-6 sm:pt-20">
      <Reveal className="mb-5 max-w-2xl sm:mb-8">
        <h2 id="titulo-como" className="text-2xl font-semibold sm:text-3xl">Do primeiro contato às chaves, com quem entende</h2>
      </Reveal>
      <ol className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {PASSOS.map((p, i) => (
          <Reveal as="li" key={p.titulo} atraso={i * 110}>
            {/* No celular: ícone ao lado do texto, cartão baixo. Do tablet para cima, como antes. */}
            <div className="relative h-full rounded-2xl border border-line bg-card p-6 transition-colors duration-300 hover:border-gold/50 max-sm:flex max-sm:items-start max-sm:gap-4 max-sm:p-4">
              <span className="absolute right-5 top-4 text-5xl font-semibold text-white/5 max-sm:hidden" aria-hidden="true">{i + 1}</span>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold max-sm:size-11"><Icon name={p.icone} className="size-6 max-sm:size-5" /></span>
              <div className="min-w-0">
                <h3 className="mt-4 text-lg font-semibold max-sm:mt-0 max-sm:text-[16px] max-sm:leading-snug">{p.titulo}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2 max-sm:mt-1 max-sm:leading-snug">{p.texto}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
