
function formatarQuantidade(valor, singular, plural) {
  if (valor == null) return null;

  const numero = Number(valor);
  return `${numero} ${numero === 1 ? singular : plural}`;
}

function caracteristicasDaPlanta(planta) {
  return [
    formatarQuantidade(planta.quartos, "quarto", "quartos"),
    formatarQuantidade(planta.suites, "suíte", "suítes"),
    formatarQuantidade(planta.vagas, "vaga", "vagas"),
    planta.area_m2 != null
      ? `${Number(planta.area_m2).toLocaleString("pt-BR", {
          maximumFractionDigits: 2,
        })} m²`
      : null,
  ].filter(Boolean);
}

export default function TipologiasPublicas({ tipologias = [] }) {
  if (!Array.isArray(tipologias) || tipologias.length === 0) {
    return null;
  }

  const plantas = [...tipologias].sort(
    (a, b) =>
      (a.ordem ?? 0) - (b.ordem ?? 0) ||
      a.nome.localeCompare(b.nome, "pt-BR")
  );

  return (
    <section
      aria-labelledby="titulo-plantas"
      className="space-y-4"
    >
      <div className="space-y-1">
        <h2
          id="titulo-plantas"
          className="text-xl font-bold tracking-tight text-ink"
        >
          Plantas e tipologias
        </h2>

        <p className="text-sm text-ink-2">
          Conheça as configurações cadastradas para este empreendimento.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {plantas.map((planta) => {
          const caracteristicas = caracteristicasDaPlanta(planta);

          return (
            <li
              key={planta.id}
              className="rounded-2xl border border-line bg-card p-4 transition-colors hover:border-gold/60"
            >
              <h3 className="text-base font-bold text-ink">
                {planta.nome}
              </h3>

              {caracteristicas.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {caracteristicas.map((caracteristica) => (
                    <span
                      key={caracteristica}
                      className="rounded-lg bg-card-2 px-3 py-2 text-xs font-medium text-ink-2"
                    >
                      {caracteristica}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-ink-3">
                  Características sob consulta.
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-xs leading-relaxed text-ink-3">
        As características podem variar conforme a unidade.
        Consulte um especialista para confirmar a disponibilidade.
      </p>
    </section>
  );
}
