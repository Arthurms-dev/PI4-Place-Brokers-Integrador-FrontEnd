import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function Foto({ p, className = "" }) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [p.image]);
  return p.image && !falhou ? (
    <img src={p.image} alt={p.title} onError={() => setFalhou(true)} loading="lazy" decoding="async" className={className} />
  ) : (
    <div
      className={`relative grid place-items-center overflow-hidden bg-card-2 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(120% 120% at 20% 0%, rgb(233 173 90 / 0.14), transparent 60%), radial-gradient(100% 100% at 100% 100%, rgb(233 173 90 / 0.08), transparent 55%)",
      }}
    >
      <Icon name="building" className="size-10 text-gold/40" />
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wide text-ink-3/70">
        Foto em breve
      </span>
    </div>
  );
}

export function Etiquetas({ p }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-full bg-page/80 px-3 py-1 text-[11px] font-medium text-gold backdrop-blur">{p.tag}</span>
      {!p.disponivel && <span className="rounded-full bg-danger/90 px-3 py-1 text-[11px] font-medium text-white">Esgotado</span>}
    </div>
  );
}

export function Ficha({ p, className = "" }) {
  const partes = [p.quartosTexto, p.suitesTexto, p.tipoTexto, p.vagasTexto, p.area].filter(Boolean);
  return partes.length ? <p className={`text-[13px] text-ink-2 ${className}`}>{partes.join(" · ")}</p> : null;
}