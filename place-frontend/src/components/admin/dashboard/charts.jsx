import { useEffect, useId, useRef, useState } from "react";

export function useEntrada() {
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setPronto(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return pronto;
}

export const diaMes = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export function Meter({ pct, className = "", atraso = 0 }) {
  const pronto = useEntrada();
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className="h-full rounded-full bg-gold-gradient transition-[width] duration-1000 ease-out"
        style={{ width: pronto ? `${Math.max(0, Math.min(100, pct))}%` : "0%", transitionDelay: `${atraso}ms` }}
      />
    </div>
  );
}

export function AreaChart({ dados = [], rotulo = "acessos" }) {
  const pronto = useEntrada();
  const gradId = useId();
  const caixa = useRef(null);
  const [ativo, setAtivo] = useState(null);

  if (dados.length < 2) return <p className="grid h-52 place-items-center text-sm text-ink-3">Sem dados no período.</p>;

  const W = 600, H = 220, topo = 18, base = 200;
  const max = Math.max(...dados.map((d) => d.value), 1);
  const pts = dados.map((d, i) => ({ x: (i / (dados.length - 1)) * W, y: base - (d.value / max) * (base - topo) }));
  const linha = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const a = pts[i - 1];
    const mx = (a.x + p.x) / 2;
    return `C ${mx} ${a.y}, ${mx} ${p.y}, ${p.x} ${p.y}`;
  }).join(" ");
  const area = `${linha} L ${W} ${base} L 0 ${base} Z`;

  const mover = (e) => {
    const r = caixa.current.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (dados.length - 1));
    setAtivo(Math.max(0, Math.min(dados.length - 1, i)));
  };
  const p = ativo != null ? pts[ativo] : null;

  return (
    <div>
      <div ref={caixa} className="relative h-52 touch-pan-y" onPointerMove={mover} onPointerLeave={() => setAtivo(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full overflow-visible" role="img" aria-label={`Gráfico de ${rotulo} por dia`}>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e9ad5a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#e9ad5a" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1="0" x2={W} y1={base - f * (base - topo)} y2={base - f * (base - topo)} stroke="rgba(255,255,255,0.07)" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill={`url(#${gradId})`} className="transition-opacity duration-1000" style={{ opacity: pronto ? 1 : 0 }} />
          <path
            d={linha} fill="none" stroke="#e9ad5a" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"
            pathLength="1" strokeDasharray="1" strokeDashoffset={pronto ? 0 : 1}
            style={{ transition: "stroke-dashoffset 1.4s ease-out" }}
          />
        </svg>
        {p && (
          <>
            <span className="pointer-events-none absolute inset-y-0 w-px bg-white/20" style={{ left: `${(p.x / W) * 100}%` }} />
            <span className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-page bg-gold" style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }} />
            <div
              className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-line bg-card px-3 py-1.5 text-xs shadow-lg"
              style={{ left: `${Math.min(88, Math.max(12, (p.x / W) * 100))}%`, top: 0 }}
            >
              <div className="text-ink-3">{diaMes(dados[ativo].date)}</div>
              <div className="font-semibold">{dados[ativo].value} {rotulo}</div>
            </div>
          </>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-ink-3">
        <span>{diaMes(dados[0].date)}</span>
        <span>{diaMes(dados[Math.floor(dados.length / 2)].date)}</span>
        <span>{diaMes(dados[dados.length - 1].date)}</span>
      </div>
    </div>
  );
}

export function BarChart({ dados = [], rotulo = "agendamentos" }) {
  const pronto = useEntrada();
  if (!dados.length) return <p className="grid h-44 place-items-center text-sm text-ink-3">Sem dados no período.</p>;
  const max = Math.max(...dados.map((d) => d.value), 1);
  return (
    <div>
      <div className="flex h-44 items-end gap-[3px]">
        {dados.map((d, i) => (
          <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${diaMes(d.date)}: ${d.value} ${rotulo}`}>
            <div
              className="w-full rounded-t-md bg-linear-to-t from-gold/30 to-gold transition-[height] duration-700 ease-out group-hover:brightness-125"
              style={{ height: pronto ? `${Math.max((d.value / max) * 100, d.value ? 4 : 1.5)}%` : "0%", transitionDelay: `${Math.min(i, 40) * 18}ms` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-ink-3">
        <span>{diaMes(dados[0].date)}</span>
        <span>{diaMes(dados[dados.length - 1].date)}</span>
      </div>
    </div>
  );
}