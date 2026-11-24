import { Link } from "react-router-dom";
import { Selo } from "@/components/admin/equipe/ui";
import { LINK_PENDENCIA, ROTULO_PENDENCIA } from "@/services/viabilizador";

/** Selos das pendências; os que o viabilizador resolve levam à tela certa. */
export function Pendencias({ lista }) {
  if (!lista?.length) return null;
  return (
    <div className="flex flex-wrap gap-x-1.5">
      {lista.map((k) =>
        LINK_PENDENCIA[k] ? (
          <Link key={k} to={LINK_PENDENCIA[k]} className="inline-flex min-h-11 items-center rounded-full transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-gold">
            <Selo tom="alerta">{ROTULO_PENDENCIA[k]} →</Selo>
          </Link>
        ) : (
          <span key={k} className="inline-flex min-h-11 items-center"><Selo tom="neutro">{ROTULO_PENDENCIA[k]} (com o admin)</Selo></span>
        )
      )}
    </div>
  );
}
