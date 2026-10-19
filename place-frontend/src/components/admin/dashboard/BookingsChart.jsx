import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useElementWidth } from "@/hooks/useElementWidth";
import { niceScale } from "@/lib/chart";
import { formatNumber, formatShortDate } from "@/lib/format";

const HEIGHT = 200;
const PAD = { left: 28, right: 4, top: 8, bottom: 26 };
const LABELED = [0, 4, 9, 14, 19, 24, 29];

export function BookingsChart({ data, total }) {
  const [ref, width] = useElementWidth();

  const peak = Math.max(0, ...data.map((d) => d.value));
  const { max, ticks } = niceScale(peak, 4, 40);

  const innerW = Math.max(width - PAD.left - PAD.right, 0);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const slot = data.length ? innerW / data.length : 0;
  const barW = Math.max(3, slot * 0.55);
  const y = (v) => PAD.top + innerH - (v / max) * innerH;

  return (
    <Card>
      <CardHeader
        title="Agendamentos de Visitas"
        description={`Evolução dos agendamentos nos últimos ${data.length} dias`}
        className="mb-2"
        action={
          <div className="flex items-center gap-2.5">
            <Icon name="calendar" className="size-3.5 text-gold" />
            <div>
              <strong className="block text-lg leading-none">{formatNumber(total)}</strong>
              <small className="text-[10px] text-ink-2">total de agendamentos</small>
            </div>
          </div>
        }
      />

      <div ref={ref} className="w-full" style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} role="img" aria-label="Gráfico de agendamentos por dia">
            <defs>
              <linearGradient id="bookings-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0bb6e" />
                <stop offset="100%" stopColor="#c98b3f" />
              </linearGradient>
            </defs>

            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={PAD.left + innerW} y1={y(t)} y2={y(t)} stroke="#1c3459" opacity=".7" />
                <text x={PAD.left - 8} y={y(t) + 3} textAnchor="end" className="fill-ink-2 text-[10px]">
                  {t}
                </text>
              </g>
            ))}

            {data.map((d, i) => (
              <rect
                key={d.date}
                x={PAD.left + slot * i + (slot - barW) / 2}
                y={y(d.value)}
                width={barW}
                height={y(0) - y(d.value)}
                rx="1.5"
                fill="url(#bookings-bar)"
              >
                <title>{`${formatShortDate(d.date)}: ${d.value} agendamentos`}</title>
              </rect>
            ))}

            {LABELED.filter((i) => data[i]).map((i) => (
              <text
                key={i}
                x={PAD.left + slot * i + slot / 2}
                y={HEIGHT - 6}
                textAnchor="middle"
                className="fill-ink-2 text-[10px]"
              >
                {formatShortDate(data[i].date)}
              </text>
            ))}
          </svg>
        )}
      </div>
    </Card>
  );
}