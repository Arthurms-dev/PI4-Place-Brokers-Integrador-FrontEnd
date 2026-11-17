// Período do dashboard: últimos 7/30/90 dias, um mês fechado ou datas escolhidas.
// A API aceita no máximo 366 dias (metricasservice.MAX_DIAS).
export const MAX_DIAS = 366;

const doisDigitos = (n) => String(n).padStart(2, "0");
export const isoLocal = (d) => `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const MES = /^\d{4}-\d{2}$/;
const diasEntre = (de, ate) => Math.round((Date.parse(`${ate}T12:00:00Z`) - Date.parse(`${de}T12:00:00Z`)) / 86_400_000) + 1;

/**
 * @param {{ tipo: "dias", dias: number } | { tipo: "mes", mes: string } | { tipo: "datas", de: string, ate: string }} filtro
 * @param {Date} [hoje]
 * @returns {{ ok: true, de: string, ate: string } | { ok: false, erro: string }}
 */
export function intervaloDoFiltro(filtro, hoje = new Date()) {
  const hojeIso = isoLocal(hoje);
  if (filtro.tipo === "dias") {
    const de = new Date(hoje);
    de.setDate(de.getDate() - (filtro.dias - 1));
    return { ok: true, de: isoLocal(de), ate: hojeIso };
  }
  if (filtro.tipo === "mes") {
    if (!MES.test(filtro.mes ?? "")) return { ok: false, erro: "Escolha o mês." };
    const [ano, mes] = filtro.mes.split("-").map(Number);
    const de = `${filtro.mes}-01`;
    if (de > hojeIso) return { ok: false, erro: "Esse mês ainda não começou." };
    const fim = isoLocal(new Date(ano, mes, 0));
    // Mês atual: vai até hoje.
    return { ok: true, de, ate: fim > hojeIso ? hojeIso : fim };
  }
  const { de, ate } = filtro;
  if (!DATA.test(de ?? "") || !DATA.test(ate ?? "")) return { ok: false, erro: "Escolha as duas datas." };
  if (de > ate) return { ok: false, erro: "A data inicial vem depois da final." };
  if (de > hojeIso) return { ok: false, erro: "Escolha um período que já começou." };
  const ateAjustado = ate > hojeIso ? hojeIso : ate;
  if (diasEntre(de, ateAjustado) > MAX_DIAS) return { ok: false, erro: "O período máximo é de 1 ano." };
  return { ok: true, de, ate: ateAjustado };
}

/** "1 a 17 de nov. de 2026", para mostrar qual período está na tela. */
export function rotuloDoIntervalo({ de, ate }) {
  const f = (iso, opcoes) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", opcoes);
  if (de === ate) return f(de, { day: "numeric", month: "short", year: "numeric" });
  const mesmoAno = de.slice(0, 4) === ate.slice(0, 4);
  const mesmoMes = mesmoAno && de.slice(5, 7) === ate.slice(5, 7);
  if (mesmoMes) return `${Number(de.slice(8))} a ${f(ate, { day: "numeric", month: "short", year: "numeric" })}`;
  return `${f(de, mesmoAno ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" })} a ${f(ate, { day: "numeric", month: "short", year: "numeric" })}`;
}
