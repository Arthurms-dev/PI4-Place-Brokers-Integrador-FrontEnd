import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";

export function AdminShell({ user, children, items, home, promo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const aoTeclar = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuOpen]);

  return (
    <div className="pb-workspace min-h-screen lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a href="#painel-conteudo" className="pb-skip-link">Pular para o conteúdo</a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} items={items} home={home} promo={promo} />

      <div className="flex min-w-0 flex-col pb-shell-content">
        <Topbar user={user} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} home={home} items={items} />
        <main id="painel-conteudo" className="pb-main flex min-w-0 flex-1 flex-col gap-6 px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-9 xl:px-10">{children}</main>
        <Footer />
      </div>
    </div>
  );
}