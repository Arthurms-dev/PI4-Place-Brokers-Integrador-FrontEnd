import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";

const formato = (id, valor) => {
  if (id === "vgv") return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  return formatNumber(valor, id === "rating" ? 1 : 0);
};

// Somente a apresentacao muda; os KPIs sempre chegam da API existente.
export function ContadorKpi({ id, valor }) {
  const numero = Number(valor);
  const valido = valor != null && Number.isFinite(numero);
  const [atual, setAtual] = useState(() => valido ? 0 : null);

  useEffect(() => {
    if (!valido) { setAtual(null); return undefined; }
    if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) { setAtual(numero); return undefined; }
    let raf = null;
    let inicio = null;
    const duracao = 1000;
    setAtual(0);
    const animar = (agora) => {
      if (inicio == null) inicio = agora;
      const progresso = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - Math.pow(1 - progresso, 3);
      setAtual(numero * suave);
      if (progresso < 1) raf = window.requestAnimationFrame(animar);
    };
    raf = window.requestAnimationFrame(animar);
    return () => { if (raf != null) window.cancelAnimationFrame(raf); };
  }, [numero, valido]);

  if (!valido) return <span>—</span>;
  return <span aria-label={formato(id, numero)} className="pb-c-counter" aria-live="off">{formato(id, atual ?? numero)}</span>;
}
