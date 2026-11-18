import { useEffect, useState } from "react";
import { CANDIDATURAS_MUDARAM, contarCandidaturasNovas } from "@/services/trabalheConosco";

const INTERVALO_MS = 2 * 60 * 1000;

/** Número de candidaturas novas para o menu do RH (e do admin). Reconta a cada 2 min, ao voltar para a aba e quando o RH muda uma. */
export function useCandidaturasNovas(ativo) {
  const [novas, setNovas] = useState(0);

  useEffect(() => {
    if (!ativo) return undefined;
    let vivo = true;
    async function contar() {
      try {
        const total = await contarCandidaturasNovas();
        if (vivo) setNovas(total);
      } catch {
        // Sem conexão ou API dormindo: mantém o último número.
      }
    }
    void contar();
    const relogio = setInterval(contar, INTERVALO_MS);
    window.addEventListener(CANDIDATURAS_MUDARAM, contar);
    window.addEventListener("focus", contar);
    return () => {
      vivo = false;
      clearInterval(relogio);
      window.removeEventListener(CANDIDATURAS_MUDARAM, contar);
      window.removeEventListener("focus", contar);
    };
  }, [ativo]);

  return ativo ? novas : 0;
}

/** Coloca o número no item do menu que leva às candidaturas. */
export const comContador = (itens, href, total) =>
  itens.map((item) => (item.href === href && total > 0 ? { ...item, badge: total } : item));
