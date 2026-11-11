import { useEffect, useRef, useState } from "react";

export default function Contagem({ valor, formato = (n) => Math.round(n) }) {
  const [v, setV] = useState(0);
  const de = useRef(0);
  useEffect(() => {
    const inicio = performance.now();
    const origem = de.current;
    let raf;
    const passo = (t) => {
      const p = Math.min(1, (t - inicio) / 900);
      setV(origem + (valor - origem) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(passo);
      else de.current = valor;
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return <>{formato(v)}</>;
}