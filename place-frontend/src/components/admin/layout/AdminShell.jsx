import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";

/**
 * Casca do painel privado (sidebar + topbar + rodapé).
 * Layout-base do ADMIN: todas as telas em /admin/* renderizam dentro dele.
 */
export function AdminShell({ user, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[13rem_1fr]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-col">
        <Topbar user={user} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
        <main className="flex flex-1 flex-col gap-4 px-4.5 pb-7.5 pt-5.5 lg:px-7.5">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
