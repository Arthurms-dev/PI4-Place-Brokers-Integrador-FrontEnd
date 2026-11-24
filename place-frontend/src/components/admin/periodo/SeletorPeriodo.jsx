import { useState } from "react";
import { intervaloDoFiltro, isoLocal } from "@/lib/periodoDashboard";

const PERIODOS = [[7, "7 dias"], [30, "30 dias"], [90, "90 dias"]];
const CAMPO_DATA = "h-11 rounded-lg border border-line bg-card-2 px-3 text-base text-ink outline-none transition-colors scheme-dark focus:border-gold sm:text-sm";

/**
 * Período usado no Dashboard e em Relatórios (antes cada tela tinha opções diferentes):
 * últimos 7/30/90 dias, "Tudo" (opcional), um mês fechado ou datas escolhidas.
 * Só avisa a página quando o período é válido.
 */
export function SeletorPeriodo({ filtro, onMudar, comTudo = false }) {
  const hoje = isoLocal(new Date());
  const [modo, setModo] = useState(filtro.tipo);
  const [mes, setMes] = useState(hoje.slice(0, 7));
  const [datas, setDatas] = useState({ de: filtro.de ?? `${hoje.slice(0, 7)}-01`, ate: filtro.ate ?? hoje });
  const [erro, setErro] = useState("");

  function aplicar(novo) {
    if (novo.tipo === "tudo") {
      setErro("");
      onMudar(novo);
      return;
    }
    const r = intervaloDoFiltro(novo);
    setErro(r.ok ? "" : r.erro);
    if (r.ok) onMudar(novo);
  }
  const botao = (ativo) => `h-11 rounded-lg px-3.5 text-sm font-medium transition-colors sm:px-4 ${ativo ? "bg-gold/15 text-gold" : "text-ink-2 hover:text-ink"}`;

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="pb-period-selector flex flex-wrap rounded-xl border border-line bg-card-2 p-1" role="group" aria-label="Período">
        {PERIODOS.map(([d, r]) => (
          <button key={d} type="button" onClick={() => { setModo("dias"); aplicar({ tipo: "dias", dias: d }); }}
            aria-pressed={modo === "dias" && filtro.dias === d} className={botao(modo === "dias" && filtro.dias === d)}>
            {r}
          </button>
        ))}
        <button type="button" onClick={() => { setModo("mes"); aplicar({ tipo: "mes", mes }); }} aria-pressed={modo === "mes"} className={botao(modo === "mes")}>Mês</button>
        <button type="button" onClick={() => { setModo("datas"); aplicar({ tipo: "datas", ...datas }); }} aria-pressed={modo === "datas"} className={botao(modo === "datas")}>Datas</button>
        {comTudo && (
          <button type="button" onClick={() => { setModo("tudo"); aplicar({ tipo: "tudo" }); }} aria-pressed={modo === "tudo"} className={botao(modo === "tudo")}>Tudo</button>
        )}
      </div>
      {modo === "mes" && (
        <label className="flex items-center gap-2 text-xs text-ink-2">
          Mês
          <input type="month" value={mes} max={hoje.slice(0, 7)} aria-label="Mês"
            onChange={(e) => { setMes(e.target.value); aplicar({ tipo: "mes", mes: e.target.value }); }} className={CAMPO_DATA} />
        </label>
      )}
      {modo === "datas" && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-2">
          <label className="flex items-center gap-2">
            De
            <input type="date" value={datas.de} max={hoje} aria-label="Data inicial"
              onChange={(e) => { const n = { ...datas, de: e.target.value }; setDatas(n); aplicar({ tipo: "datas", ...n }); }} className={CAMPO_DATA} />
          </label>
          <label className="flex items-center gap-2">
            até
            <input type="date" value={datas.ate} max={hoje} aria-label="Data final"
              onChange={(e) => { const n = { ...datas, ate: e.target.value }; setDatas(n); aplicar({ tipo: "datas", ...n }); }} className={CAMPO_DATA} />
          </label>
        </div>
      )}
      {erro && <p role="alert" className="text-xs text-danger">{erro}</p>}
    </div>
  );
}
