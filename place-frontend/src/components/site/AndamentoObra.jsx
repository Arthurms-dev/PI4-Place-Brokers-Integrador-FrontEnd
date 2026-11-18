import { textoPercentual } from "@/lib/andamentoObra";

/**
 * Barras do andamento da obra por módulo/torre.
 * @param andamento resultado de lerAndamento
 * @param interno mostra a fonte e o aviso de desatualizado (corretor e cadastro)
 */
export default function AndamentoObra({ andamento, interno = false }) {
  if (!andamento) return null;
  return (
    <section aria-labelledby="titulo-andamento" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-andamento" className="text-[13px] font-semibold uppercase tracking-wide text-gold">Andamento da obra</h2>
        <span className={`text-[12px] ${interno && andamento.desatualizado ? "font-semibold text-danger" : "text-ink-3"}`}>
          {andamento.mes ? `Medição de ${andamento.mes}` : "Sem mês da medição"}
          {interno && andamento.desatualizado && andamento.dias != null ? ` · desatualizado há ${andamento.dias} dias` : ""}
        </span>
      </div>
      <ul className="space-y-3">
        {andamento.modulos.map((m) => (
          <li key={m.modulo}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px]">
              <span className="font-medium">{m.modulo}</span>
              <strong className="tabular-nums">{textoPercentual(m.percentual)}</strong>
            </div>
            <div
              role="progressbar"
              aria-label={`${m.modulo}: ${textoPercentual(m.percentual)} concluído`}
              aria-valuenow={m.percentual}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-line"
            >
              <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${m.percentual}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {interno && andamento.fonte && (
        <a href={andamento.fonte} target="_blank" rel="noreferrer" className="inline-block text-[12px] text-gold underline">Ver na página da construtora</a>
      )}
      {!interno && <p className="text-[11.5px] text-ink-3">Percentual informado pela construtora.</p>}
    </section>
  );
}
