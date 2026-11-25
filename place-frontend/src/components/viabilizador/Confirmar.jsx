import { createPortal } from "react-dom";
import { Folha } from "@/components/admin/equipe/ui";

/**
 * Pede confirmação antes de uma ação que os corretores veem na hora.
 * Abre no corpo da página: dentro de um card animado, o "fixed" ficaria preso no card.
 */
export function Confirmar({ titulo, children, rotulo, perigo = false, ocupado = false, onConfirmar, onClose }) {
  return createPortal(
    <Folha titulo={titulo} onClose={onClose}>
      <div className="space-y-5">
        <div className="space-y-2 text-sm text-ink-2">{children}</div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="h-12 rounded-xl border border-line text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink">Cancelar</button>
          <button
            type="button"
            disabled={ocupado}
            onClick={onConfirmar}
            className={`h-12 rounded-xl text-sm font-semibold transition disabled:opacity-60 ${perigo ? "bg-danger text-white hover:brightness-110" : "bg-gold-gradient text-[#1a1408] hover:brightness-110"}`}
          >
            {ocupado ? "Aguarde..." : rotulo}
          </button>
        </div>
      </div>
    </Folha>,
    document.body,
  );
}
