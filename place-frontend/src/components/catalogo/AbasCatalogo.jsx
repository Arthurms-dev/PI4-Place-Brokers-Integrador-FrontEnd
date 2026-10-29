import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Lista, mapa e books são três jeitos de ver o mesmo catálogo: ficam juntos numa entrada do menu. */
export function AbasCatalogo() {
  const { pathname } = useLocation();
  const area = pathname.startsWith("/gerente") ? "gerente" : "corretor";
  const abas = [
    { href: `/${area}/empreendimentos`, rotulo: "Lista", icone: "list" },
    ...(area === "corretor" ? [{ href: "/corretor/mapa", rotulo: "Mapa", icone: "map" }] : []),
    { href: `/${area}/books`, rotulo: "Books e tabelas", icone: "book" },
  ];
  return (
    <nav aria-label="Formas de ver o catálogo" className="flex gap-1 rounded-xl border border-line bg-card-2 p-1 sm:inline-flex">
      {abas.map((a) => {
        const ativa = pathname === a.href || pathname.startsWith(`${a.href}/`);
        return (
          <Link key={a.href} to={a.href} aria-current={ativa ? "page" : undefined}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] transition-colors sm:flex-none",
              ativa ? "bg-gold/15 font-medium text-gold" : "text-ink-2 hover:text-ink",
            )}>
            <Icon name={a.icone} className="size-4" /> {a.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
