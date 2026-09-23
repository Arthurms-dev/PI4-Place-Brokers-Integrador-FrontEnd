import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useElementWidth } from "@/hooks/useElementWidth";
import { niceScale } from "@/lib/chart";
import { formatNumber, formatShortDate } from "@/lib/format";

const HEIGHT = 230;
const PAD = { left: 40, right: 10, top: 18, bottom: 30 };

const tickLabel = (v) => (v === 0 ? "0" : v >= 1000 ? `${(v / 1000).toString().replace(".", ",")}k` : String(v));

export function VisitsChart({ data }) {
  const [ref, width] = useElementWidth();
  const [hover, setHover] = useState(null);

  const values = data.map((d) => d.value);
  const peak = Math.max(0, ...values);
  const peakIndex = peak > 0 ? values.indexOf(peak) : null;
  const active = hover ?? peakIndex;
  const { max, ticks } = niceScale(peak, 4, 20000);

  const innerW = Math.max(width - PAD.left - PAD.right, 0);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (data.length > 1 ? (innerW * i) / (data.length - 1) : 0);
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const linePoints = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");

  function handleMove(e) {
    const mouseX = e.clientX - e.currentTarget.getBoundingClientRect().left;
    let best = 0;
    let bestDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(x(i) - mouseX);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setHover(best);
  }

  return (
    <Card>
      <CardHeader
        title="Acessos no Site"
        description={`Quantidade de acessos únicos nos últimos ${data.length} dias`}
        action={<Icon name="calendar" className="size-3.5 text-gold" />}
      />

      <div ref={ref} className="relative w-full" style={{ height: HEIGHT }}>
        {width > 0 && (
          <>
            <svg
              width={width}
              height={HEIGHT}
              role="img"
              aria-label="Gráfico de acessos únicos por dia"
              onMouseMove={handleMove}
              onMouseLeave={() => setHover(null)}
            >
              <defs>
                <linearGradient id="visits-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e9ad5a" stopOpacity=".28" />
                  <stop offset="100%" stopColor="#e9ad5a" stopOpacity="0" />
                </linearGradient>
              </defs>

              {ticks.map((t) => (
                <g key={t}>
                  <line x1={PAD.left} x2={PAD.left + innerW} y1={y(t)} y2={y(t)} stroke="#1c3459" opacity=".7" />
                  <text x={PAD.left - 10} y={y(t) + 3} textAnchor="end" className="fill-ink-2 text-[10px]">
                    {tickLabel(t)}
                  </text>
                </g>
              ))}

              {data.map((d, i) => (
                <g key={d.date}>
                  <line x1={x(i)} x2={x(i)} y1={PAD.top} y2={PAD.top + innerH} stroke="#1c3459" opacity=".45" />
                  <text x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-ink-2 text-[10px]">
                    {formatShortDate(d.date)}
                  </text>
                </g>
              ))}

              <polygon points={`${x(0)},${y(0)} ${linePoints} ${x(data.length - 1)},${y(0)}`} fill="url(#visits-area)" />
              <polyline points={linePoints} fill="none" stroke="#e9ad5a" strokeWidth="1.8" strokeLinejoin="round" />
              {data.map((d, i) => (
                <circle
                  key={d.date}
                  cx={x(i)}
                  cy={y(d.value)}
                  r={active === i ? 5 : 3.5}
                  fill="#e9ad5a"
                  stroke="#0d2040"
                  strokeWidth="1.5"
                />
              ))}
            </svg>

            {active !== null && (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-line bg-side px-2.5 py-1.5 text-center text-[11px] shadow-lg"
                style={{ left: x(active), top: y(data[active].value) - 12 }}
              >
                <b className="block font-medium text-ink-2">{formatShortDate(data[active].date)}</b>
                {formatNumber(data[active].value)} acessos
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}