import AndamentoObra from "./AndamentoObra";

/**
 * Para o cliente que prefere decidir sozinho (material exclusivo, depois do cadastro):
 * números curtos e reais. Sem nada, não desenha nada.
 */
export default function DadosParaDecidir({ andamento, procura }) {
  if (!andamento && !procura) return null;
  return (
    <section aria-label="Dados do empreendimento" className="space-y-4 rounded-2xl border border-line-soft bg-card p-4 sm:p-5">
      {procura && (
        <p className="flex items-baseline gap-3">
          <strong className="text-3xl font-extrabold tabular-nums text-gold">{procura.pessoas}</strong>
          <span className="text-[14px] leading-snug text-ink-2">
            pessoas viram este empreendimento {procura.periodo === "semana" ? "nos últimos 7 dias" : "nos últimos 30 dias"}
          </span>
        </p>
      )}
      {procura && andamento && <div className="h-px bg-line-soft" />}
      <AndamentoObra andamento={andamento} />
    </section>
  );
}
