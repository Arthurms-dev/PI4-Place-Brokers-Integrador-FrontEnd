// Origem de campanha (Meta Ads, Google, links de corretor): guarda os parâmetros utm_* da
// URL de entrada na sessão e manda junto com o lead, para o admin saber de onde ele veio.

export const CAMPOS_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const CHAVE = "pb_utm";
const LIMITE = 100;

const limpar = (valor) => String(valor ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, LIMITE);

/** Lê os utm_* de uma query string. Sem nenhum, devolve null. */
export function utmsDaUrl(search = "") {
  const params = new URLSearchParams(search);
  const utms = {};
  for (const campo of CAMPOS_UTM) {
    const valor = limpar(params.get(campo));
    if (valor) utms[campo] = valor;
  }
  return Object.keys(utms).length ? utms : null;
}

/** Na entrada do site: se a URL trouxer utm_*, guarda na sessão (a campanha mais recente vale). */
export function capturarUtms(search = "") {
  const utms = utmsDaUrl(search);
  if (!utms) return;
  try {
    window.sessionStorage.setItem(CHAVE, JSON.stringify(utms));
  } catch {
    /* sem sessionStorage: segue sem origem */
  }
}

/** @returns {Record<string, string> | null} */
export function utmsDaSessao() {
  try {
    const salvo = JSON.parse(window.sessionStorage.getItem(CHAVE) ?? "null");
    if (!salvo || typeof salvo !== "object") return null;
    const utms = {};
    for (const campo of CAMPOS_UTM) {
      const valor = limpar(salvo[campo]);
      if (valor) utms[campo] = valor;
    }
    return Object.keys(utms).length ? utms : null;
  } catch {
    return null;
  }
}

/** "Origem: utm_source=instagram, utm_campaign=lancamento-nov" (ou "" sem campanha). */
export function linhaDeOrigem(utms) {
  if (!utms) return "";
  const partes = CAMPOS_UTM.filter((c) => utms[c]).map((c) => `${c}=${utms[c]}`);
  return partes.length ? `Origem: ${partes.join(", ")}` : "";
}
