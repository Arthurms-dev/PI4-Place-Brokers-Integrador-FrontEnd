import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const MAX = 5;
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DOT_COLOR = {
  5: "bg-gold",
  4: "bg-[#7d8fae]",
  3: "bg-[#7d8fae]",
  2: "bg-danger",
  1: "bg-danger",
};

export function RatingSummary({ data }) {
  const ratio = Math.min(data.average / MAX, 1);
  const hasRating = data.average > 0;

  return (
    <Card>
      <CardHeader title="Avaliações dos Clientes" description="Satisfação dos clientes com a nossa plataforma" />

      <div className="flex flex-col items-start gap-5 pt-1.5 sm:flex-row sm:items-center sm:gap-5.5">
        <div className="relative size-28 shrink-0">
          <svg viewBox="0 0 112 112" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="56" cy="56" r={RADIUS} fill="none" stroke="rgba(233,173,90,.18)" strokeWidth="9" />
            {hasRating && (
              <circle
                cx="56"
                cy="56"
                r={RADIUS}
                fill="none"
                stroke="#e9ad5a"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE * ratio} ${CIRCUMFERENCE}`}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <strong className="text-2xl leading-none">
              {hasRating ? data.average.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "–"}
            </strong>
            <small className="mb-1 mt-0.5 text-[11px] text-ink-2">de {MAX},0</small>
            <div className={cn("flex gap-px", hasRating ? "text-gold" : "text-line")}>
              {Array.from({ length: MAX }, (_, i) => (
                <Icon key={i} name="star" className="size-2.25" fill="currentColor" stroke="none" />
              ))}
            </div>
          </div>
        </div>

        <ul className="flex w-full flex-1 flex-col gap-2.75">
          {data.distribution.map(({ stars, percent }) => (
            <li key={stars} className="flex items-center gap-2.5 text-xs text-ink-2">
              <span className={cn("size-2.5 shrink-0 rounded-full", DOT_COLOR[stars])} />
              {stars} {stars === 1 ? "estrela" : "estrelas"}
              <span className="ml-auto font-medium text-ink">{percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}