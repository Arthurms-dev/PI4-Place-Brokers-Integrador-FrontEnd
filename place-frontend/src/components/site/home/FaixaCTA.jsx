import { Icon } from "@/components/ui/Icon";
import Reveal from "../Reveal";

export default function FaixaCTA({ onFalar }) {
  return (
    <section aria-label="Fale com um especialista" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-linear-to-br from-card via-card-2 to-page p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold sm:text-4xl">Não sabe por onde começar?</h2>
              <p className="mt-2 text-[15px] text-ink-2">Conte o que você procura e um especialista indica o lançamento que combina com você, sem compromisso.</p>
            </div>
            <button type="button" onClick={() => onFalar(null)} className="inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-gold-gradient px-8 text-[15px] font-semibold text-[#1a1408] transition hover:brightness-110 active:scale-95">
              <Icon name="messageCircle" className="size-5" /> Fale com um especialista
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
