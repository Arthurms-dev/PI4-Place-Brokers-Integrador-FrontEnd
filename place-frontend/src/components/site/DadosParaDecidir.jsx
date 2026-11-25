import AndamentoObra from "./AndamentoObra";
import { textoEvolucao } from "@/lib/fatosMercado";

function Numero({ grande, children }) {
  return (
    <p className="flex items-baseline gap-3">
      <strong className="shrink-0 text-3xl font-extrabold tabular-nums text-gold">{grande}</strong>
      <span className="text-[14px] leading-snug text-ink-2">{children}</span>
    </p>
  );
}

/**
 * Para quem prefere decidir sozinho (material exclusivo, depois do cadastro): só número real ou fato com fonte.
 * @param interno versão do corretor (mostra mesmo dado velho, com aviso)
 */
export default function DadosParaDecidir({ andamento = null, procura = null, evolucao = null, fatos = [], interno = false }) {
  const ev = textoEvolucao(evolucao);
  if (!andamento && !procura && !ev && !fatos.length) return null;
  const blocos = [
    procura && (
      <Numero key="procura" grande={procura.pessoas}>
        pessoas viram este empreendimento {procura.periodo === "semana" ? "nos últimos 7 dias" : "nos últimos 30 dias"}
      </Numero>
    ),
    ev && <Numero key="evolucao" grande={ev.titulo}>{ev.detalhe} <span className="text-xs text-ink-3">Histórico da Place. Resultado passado não garante o futuro.</span></Numero>,
    andamento && <AndamentoObra key="andamento" andamento={andamento} interno={interno} />,
    fatos.length > 0 && (
      <section key="fatos" aria-labelledby="titulo-fatos" className="space-y-2.5">
        <h2 id="titulo-fatos" className="text-[13px] font-semibold uppercase tracking-wide text-gold">Fatos da região</h2>
        <ul className="space-y-2.5">
          {fatos.map((f) => (
            <li key={`${f.url}-${f.mes}`} className="text-[14px] leading-snug">
              {f.texto}{" "}
              <a href={f.url} target="_blank" rel="noreferrer" className="whitespace-nowrap text-[12px] text-gold underline">{f.fonte}, {f.mesTexto}</a>
            </li>
          ))}
        </ul>
      </section>
    ),
  ].filter(Boolean);
  return (
    <section aria-label="Dados do empreendimento" className="space-y-4 rounded-2xl border border-line-soft bg-card p-4 sm:p-5">
      {blocos.map((b, i) => (
        <div key={b.key} className="space-y-4">
          {i > 0 && <div className="h-px bg-line-soft" />}
          {b}
        </div>
      ))}
    </section>
  );
}
