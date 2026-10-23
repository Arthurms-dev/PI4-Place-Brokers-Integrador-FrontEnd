import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { label: "Início", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Leads", href: "/admin/leads", icon: "users" },
  { label: "Clientes", href: "/admin/clientes", icon: "user" },
  { label: "Agendamentos", href: "/admin/agendamentos", icon: "calendar" },
  { label: "Relatórios", href: "/admin/relatorios", icon: "chart" },
  { label: "Equipe", href: "/admin/equipe", icon: "team" },
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

export function Sidebar({
  open,
  onClose,
  items = NAV_ITEMS,
  home = "/admin/dashboard",
  promo = <SidebarPromo />,
}) {
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
          "pb-sidebar fixed inset-y-0 left-0 z-30 flex w-[16.5rem] flex-col overflow-y-auto border-r border-line-soft bg-side pb-6 transition-transform",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-h-24 items-center border-b border-line-soft px-6">
          <Link to={home} aria-label="Place Brokers - início" className="flex flex-col gap-1.5">
            <Logo className="max-h-12" />
          </Link>
        </div>

        <nav aria-label="Menu principal" className="flex flex-col gap-1 px-3 pt-6">
          <p className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.19em] text-ink-3">Navegação</p>
          {items.map((item) => {
            const active = item.end
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pb-nav-item relative flex min-h-11 items-center gap-3 rounded-xl px-4 text-[13px] font-medium transition-colors",
                  active
                    ? "pb-nav-active bg-gold/10 text-gold"
                    : "text-ink-2 hover:bg-white/5 hover:text-ink",
                )}
              >
                <Icon name={item.icon} className="size-[18px] shrink-0" />
                <span>{item.label}</span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-gold" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {promo}
      </aside>
    </>
  );
}

export function SidebarPromo() {
  return (
    <div className="pb-sidebar-quick mx-4 mt-auto pt-8">
      <div className="rounded-2xl border border-line bg-card-2 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Acesso rápido</p>
        <h4 className="mt-2 text-[14px] font-semibold leading-snug">Seu catálogo em um lugar</h4>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-2">Consulte e gerencie os empreendimentos da plataforma.</p>
        <ButtonLink to="/admin/imoveis" className="mt-4 w-full">Ver empreendimentos</ButtonLink>
      </div>
    </div>
  );
}
