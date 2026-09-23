import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Imóveis", href: "/imoveis" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

const SOCIALS = [
  { label: "Instagram", icon: "instagram", href: "#" },
  { label: "Facebook", icon: "facebook", href: "#" },
  { label: "LinkedIn", icon: "linkedin", href: "#" },
  { label: "YouTube", icon: "youtube", href: "#" },
];

export function Footer() {
  return (
    <footer className="grid items-center justify-items-center gap-5 border-t border-line-soft px-4.5 py-5 text-center text-[10px] text-ink-2 lg:grid-cols-[1fr_auto_1fr] lg:justify-items-stretch lg:px-7.5 lg:text-left">
      <Link to="/admin/dashboard" aria-label="Place Brokers - início">
        <Logo className="h-8.5" />
      </Link>

      <nav aria-label="Rodapé" className="flex gap-6 lg:gap-12">
        {LINKS.map((link) => (
          <Link key={link.href} to={link.href} className="hover:text-gold">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-2.5 lg:items-end">
        <div className="flex gap-3.5">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} aria-label={s.label} className="hover:text-gold">
              <Icon name={s.icon} className="size-3.5" />
            </a>
          ))}
        </div>
        <span>© {new Date().getFullYear()} Place Brokers. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}