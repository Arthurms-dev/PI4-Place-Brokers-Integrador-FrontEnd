import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { deveVoltarAoTopo } from "@/lib/rolagem";
import { ContatoProvider } from "./ContatoProvider";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

// Trocou de página pelo menu ou por um link: abre no topo (o React Router não faz isso sozinho).
function VoltarAoTopo() {
  const { pathname, hash, state } = useLocation();
  const tipo = useNavigationType();
  const anterior = useRef(pathname);
  useLayoutEffect(() => {
    if (deveVoltarAoTopo({ anterior: anterior.current, atual: pathname, tipo, hash, rolar: state?.rolar })) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    anterior.current = pathname;
  }, [pathname, hash, state, tipo]);
  return null;
}

export default function SiteLayout() {
  return (
    <ContatoProvider>
      <VoltarAoTopo />
      <div className="pb-site min-h-screen bg-page text-ink">
        <SiteHeader />
        <Outlet />
        <SiteFooter />
      </div>
    </ContatoProvider>
  );
}
