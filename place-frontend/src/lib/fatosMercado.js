// Fatos de mercado com fonte e evolução do preço "a partir de" (dado próprio da Place).
// Nada de promessa: só o que foi publicado, com link e data, ou o que o próprio histórico mostra.
import { textoMes } from "./andamentoObra";

export const MESES_VALIDADE_FATO = 18;

const brlCurto = (v) => (v >= 1_000_000
  ? `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`
  : `R$ ${Math.round(v / 1000).toLocaleString("pt-BR")} mil`);

/** Fatos com fonte, do mais novo para o mais antigo, escondendo os de mais de 18 meses. */
export function fatosVisiveis(emp, hoje = new Date()) {
  const limite = new Date(hoje.getFullYear(), hoje.getMonth() - MESES_VALIDADE_FATO, 1).toISOString().slice(0, 7);
  return (Array.isArray(emp?.fatos_mercado) ? emp.fatos_mercado : [])
    .filter((f) => f?.texto && f?.fonte && /^https:\/\//.test(f?.url ?? "") && /^\d{4}-\d{2}/.test(f?.mes ?? "") && f.mes >= limite)
    .sort((a, b) => b.mes.localeCompare(a.mes))
    .map((f) => ({ ...f, mesTexto: textoMes(`${f.mes}-01`) }));
}

/** "subiu 10,4% desde nov/2026" + "de R$ 480 mil para R$ 530 mil" */
export function textoEvolucao(ev) {
  if (!ev) return null;
  const pct = Math.abs(ev.variacao).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return {
    titulo: `${ev.variacao >= 0 ? "Subiu" : "Caiu"} ${pct}%`,
    detalhe: `O preço de entrada foi de ${brlCurto(ev.de)} para ${brlCurto(ev.para)} desde ${textoMes(ev.desde)}.`,
  };
}
