import { useEffect, useMemo, useState } from "react";

// Um efeito apenas visual. O texto acessivel e sempre o valor real fornecido pela API.
function interpretar(texto) {
  if (typeof texto !== "string" && typeof texto !== "number") return null;
  const original = String(texto).trim();
  const moeda = original.startsWith("R$");
  const porcentagem = original.endsWith("%");
  const numero = original.replace(/^R\$\s*/, "").replace(/%$/, "").trim();
  if (!/^\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^\d+(?:,\d+)?$/.test(numero)) return null;
  const casas = numero.includes(",") ? numero.split(",")[1].length : 0;
  const valor = Number(numero.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(valor) || valor < 0) return null;
  return { valor, moeda, porcentagem, casas };
}

export function NumeroAnimado({ texto }) {
  const parsed = useMemo(() => interpretar(texto), [texto]);
  const [progresso, setProgresso] = useState(1);

  useEffect(() => {
    if (!parsed) return undefined;
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduzir) { setProgresso(1); return undefined; }
    let quadro = null;
    let inicio = null;
    const duracao = 800;
    setProgresso(0);
    const passo = (agora) => {
      if (inicio === null) inicio = agora;
      const t = Math.min(1, (agora - inicio) / duracao);
      setProgresso(1 - (1 - t) ** 3);
      if (t < 1) quadro = window.requestAnimationFrame(passo);
    };
    quadro = window.requestAnimationFrame(passo);
    return () => { if (quadro !== null) window.cancelAnimationFrame(quadro); };
  }, [parsed]);

  if (!parsed) return <>{texto}</>;
  const n = parsed.valor * progresso;
  const formatado = n.toLocaleString("pt-BR", {
    minimumFractionDigits: parsed.casas,
    maximumFractionDigits: parsed.casas,
  });
  const visivel = `${parsed.moeda ? "R$ " : ""}${formatado}${parsed.porcentagem ? "%" : ""}`;
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true" className="pb-kpi-number">{visivel}</span>
    </>
  );
}
