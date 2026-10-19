import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { useContato } from "./ContatoProvider";

export const CONTATO = {
  email: "suporte@placebrokers.com.br",
  instagram: "https://www.instagram.com/placebrokers.imobiliaria/",
  horario: "Segunda a sexta, das 08h às 18h",
};

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const titulo = "mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold";
const item = "block py-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink";

export default function SiteFooter() {
  const { abrirContato } = useContato();
  return (
    <footer className="mt-24 border-t border-line-soft bg-side/70 pb-24 sm:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Logo className="h-10" />
          <p className="max-w-xs text-[13px] leading-relaxed text-ink-3">Lançamentos imobiliários em Pernambuco, com atendimento de especialistas do primeiro contato à entrega das chaves.</p>
          <a href={CONTATO.instagram} target="_blank" rel="noreferrer" aria-label="Instagram da Place Brokers" className="grid size-11 place-items-center rounded-full border border-line text-ink-2 transition duration-300 hover:scale-105 hover:border-gold hover:text-gold">
            <InstagramIcon className="size-5" />
          </a>
        </div>

        <div>
          <h3 className={titulo}>Navegue</h3>
          <Link to="/" className={item}>Lançamentos</Link>
          <Link to="/sobre" className={item}>Sobre nós</Link>
          <Link to="/contato" className={item}>Contato</Link>
        </div>

        <div>
          <h3 className={titulo}>Para a equipe</h3>
          <Link to="/login" className={item}>Área restrita</Link>
          <Link to="/register" className={item}>Seja um corretor parceiro</Link>
        </div>

        <div>
          <h3 className={titulo}>Fale com a gente</h3>
          <button type="button" onClick={() => abrirContato(null, "rodapé")} className="mb-2 mt-1 h-11 rounded-full bg-gold-gradient px-5 text-[13px] font-semibold text-[#1a1408] transition hover:brightness-110">Fale com um especialista</button>
          <a href={`mailto:${CONTATO.email}`} className={`${item} flex items-center gap-2`}><Icon name="mail" className="size-4 text-gold" /> {CONTATO.email}</a>
          <p className={`${item} flex items-center gap-2`}><Icon name="clock" className="size-4 text-gold" /> {CONTATO.horario}</p>
        </div>
      </div>
      <div className="border-t border-line-soft">
        <p className="mx-auto max-w-7xl px-4 py-5 text-[12px] text-ink-3 sm:px-6">© 2026 Place Brokers. Todos os direitos reservados. Valores e condições sujeitos a alteração sem aviso prévio.</p>
      </div>
    </footer>
  );
}
