import { Icon } from "@/components/ui/Icon";

export function Foto({ p, className = "" }) {
  return p.image ? (
    <img src={p.image} alt={p.title} loading="lazy" decoding="async" className={className} />
  ) : (
    <div className={`grid place-items-center bg-card-2 text-gold/50 ${className}`}><Icon name="building" className="size-10" /></div>
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
  const partes = [p.quartosTexto, p.vagasTexto, p.area].filter(Boolean);
  return partes.length ? <p className={`text-[13px] text-ink-2 ${className}`}>{partes.join(" · ")}</p> : null;
}
