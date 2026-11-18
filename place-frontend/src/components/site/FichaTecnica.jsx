import { fichaTecnica } from "@/lib/fichaTecnica";

/** Ficha técnica e registro da incorporação (públicos). Não aparece se nada foi cadastrado. */
export default function FichaTecnica({ empreendimento }) {
  const { itens, registro } = fichaTecnica(empreendimento);
  if (!itens.length && !registro) return null;
  return (
    <section aria-labelledby="titulo-ficha" className="space-y-2.5">
      <h2 id="titulo-ficha" className="text-[13px] font-semibold uppercase tracking-wide text-gold">Ficha técnica</h2>
      {itens.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {itens.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt className="text-[12px] text-ink-3">{rotulo}</dt>
              <dd className="text-[14px] font-semibold">{valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {registro && <p className="text-[12px] leading-relaxed text-ink-3">{registro}</p>}
    </section>
  );
}
