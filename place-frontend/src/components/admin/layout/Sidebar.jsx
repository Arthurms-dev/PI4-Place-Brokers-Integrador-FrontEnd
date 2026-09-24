import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Imóveis", href: "/admin/imoveis", icon: "home" },
  { label: "Leads", href: "/admin/leads", icon: "users" },
  { label: "Clientes", href: "/admin/clientes", icon: "user" },
  { label: "Agendamentos", href: "/admin/agendamentos", icon: "calendar" },
  { label: "Relatórios", href: "/admin/relatorios", icon: "chart" },
  { label: "Equipe", href: "/admin/equipe", icon: "team" },
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

export function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/55 lg:hidden"
        />
      )}

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-52 flex-col border-r border-line-soft bg-side pb-6 transition-transform",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center border-b border-line-soft px-6">
          <Link to="/admin/dashboard" aria-label="Place Brokers - início">
            <Logo />
          </Link>
        </div>

        <nav aria-label="Menu principal" className="flex flex-col gap-1 px-3.5 pt-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3.5 rounded-lg px-4.5 text-[13px] transition-colors",
                  active
                    ? "bg-gold-gradient font-medium text-[#1a1408] shadow-[0_4px_14px_rgba(233,173,90,.25)]"
                    : "text-ink-2 hover:bg-white/5 hover:text-ink",
                )}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <SidebarPromo />
      </aside>
    </>
  );
}

function SidebarPromo() {
  return (
    <div className="relative mx-4 mt-auto overflow-hidden rounded-xl border border-line bg-linear-to-br from-[#1b3a66] to-[#0c1d3a] px-4 pb-4 pt-22">
      <svg
        viewBox="0 0 160 110"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-28 w-full opacity-55"
      >
        <g fill="#2a4a7d">
          <rect x="18" y="30" width="42" height="80" />
          <rect x="66" y="8" width="38" height="102" />
          <rect x="110" y="42" width="34" height="68" />
        </g>
        <g fill="#e9ad5a" opacity=".75">
          <rect x="24" y="40" width="4" height="6" /><rect x="34" y="52" width="4" height="6" /><rect x="44" y="40" width="4" height="6" />
          <rect x="72" y="20" width="4" height="6" /><rect x="84" y="34" width="4" height="6" /><rect x="72" y="58" width="4" height="6" /><rect x="92" y="20" width="4" height="6" />
          <rect x="118" y="54" width="4" height="6" /><rect x="128" y="68" width="4" height="6" />
        </g>
      </svg>
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-page/85 to-page" />
      <div className="relative">
        <h4 className="text-[13px] font-bold leading-tight">
          Mais visibilidade
          <br />
          para o seu imóvel
        </h4>
        <p className="mb-3.5 mt-1.5 text-[11px] text-ink-2">Invista em tecnologia e alcance mais clientes.</p>
        <ButtonLink to="/admin/imoveis/novo" className="w-full">
          Cadastrar imóvel
        </ButtonLink>
      </div>
    </div>
  );
}
