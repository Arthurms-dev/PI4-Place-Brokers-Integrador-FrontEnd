// Regras de exibição de preço e prazo do catálogo (definidas pela Place):
// - MCMV: "Parcelas a partir de" (conforme localização e produto) -> campo parcela_min
// - Prontos e usados: sempre o preço cheio (preco_min), mesmo no MCMV, porque a entrada é à vista
// - Médio padrão, alto padrão e litoral: "A partir de" = valor total da unidade mais barata -> preco_min
// - Médio padrão é acima de R$ 300 mil (pela unidade mais barata); até esse valor, o segmento é MCMV
// - Prazo: "Pronto para morar" quando status = pronto; senão "Entrega prevista: mês/ano" (previsao_entrega)

export const SEGMENTOS = {
  mcmv: "Minha Casa Minha Vida",
  medio_padrao: "Médio padrão",
  alto_padrao: "Alto padrão",
  litoral: "Litoral",
};

const brl = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const numero = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Regra da Place: médio padrão é acima deste valor (pela unidade mais barata). */
export const PISO_MEDIO_PADRAO = 300_000;

/** Aviso para o cadastro quando o segmento não combina com o preço; null quando está certo. */
export function avisoDeSegmento({ segmento, precoMin } = {}) {
  const preco = numero(precoMin);
  if (preco == null) return null;
  if (segmento === "medio_padrao" && preco <= PISO_MEDIO_PADRAO) {
    return "Pela regra da Place, médio padrão é acima de R$ 300 mil. Com este preço, o segmento é MCMV.";
  }
  if (segmento === "mcmv" && preco > PISO_MEDIO_PADRAO) {
    return "Pela regra da Place, acima de R$ 300 mil o segmento é Médio padrão.";
  }
  return null;
}

/** Etapas em que a entrada é à vista: o catálogo mostra o preço cheio, mesmo no MCMV. */
export const ETAPAS_PRECO_CHEIO = ["pronto", "usado"];

/** Aceita o status do banco ("pronto") ou a etiqueta do card ("Pronto"). */
export function mostraPrecoCheio({ status, tag } = {}) {
  return ETAPAS_PRECO_CHEIO.includes(String(status ?? tag ?? "").toLowerCase());
}

/** Mostra "Parcelas a partir de"? Só MCMV com parcela cadastrada que não seja pronto nem usado. */
export function mostraParcela(emp = {}) {
  return emp.segmento === "mcmv" && numero(emp.parcela_min ?? emp.parcelaMin) != null && !mostraPrecoCheio(emp);
}

/**
 * @param {{ segmento?: string, status?: string, parcela_min?: number|string, preco_min?: number|string }} emp
 * @returns {{ rotulo: string, valor: string, sufixo: string, temValor: boolean }}
 */
export function precoDoEmpreendimento(emp = {}) {
  const total = numero(emp.preco_min);
  if (mostraParcela(emp)) {
    return { rotulo: "Parcelas a partir de", valor: brl(numero(emp.parcela_min)), sufixo: "/mês", temValor: true };
  }
  if (total != null) return { rotulo: "A partir de", valor: brl(total), sufixo: "", temValor: true };
  // Pronto/usado sem preço cheio cadastrado: melhor a parcela do que "sob consulta".
  const parcela = numero(emp.parcela_min);
  if (emp.segmento === "mcmv" && parcela != null) {
    return { rotulo: "Parcelas a partir de", valor: brl(parcela), sufixo: "/mês", temValor: true };
  }
  return { rotulo: "Valores", valor: "Sob consulta", sufixo: "", temValor: false };
}

/** "Pronto para morar", "Entrega prevista: ago/2028" ou null. */
export function prazoDoEmpreendimento(emp = {}) {
  if (emp.status === "pronto") return "Pronto para morar";
  if (!emp.previsao_entrega) return null;
  const [ano, mes] = String(emp.previsao_entrega).slice(0, 7).split("-").map(Number);
  if (!ano || !mes) return null;
  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `Entrega prevista: ${nomeMes}/${ano}`;
}
