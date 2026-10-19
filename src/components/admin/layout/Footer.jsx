import { Link } from "react-router-dom";

/** Rodapé exclusivo do ambiente interno, sem links ou redes sociais fictícios. */
export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line-soft px-4 py-5 text-[12px] text-ink-3 sm:px-6 lg:px-8 xl:px-10">
      <span>© {new Date().getFullYear()} Place Brokers · Ambiente de gestão</span>
      <nav aria-label="Links institucionais" className="flex flex-wrap items-center gap-5">
        <Link to="/" className="transition-colors hover:text-gold">Site</Link>
        <Link to="/sobre" className="transition-colors hover:text-gold">Sobre</Link>
        <Link to="/contato" className="transition-colors hover:text-gold">Contato</Link>
      </nav>
    </footer>
  );
}
