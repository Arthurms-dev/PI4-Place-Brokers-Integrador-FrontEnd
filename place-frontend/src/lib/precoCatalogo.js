// Regras de exibição de preço e prazo do catálogo (definidas pela Place):
// - MCMV: "Parcelas a partir de" (R$ 399, 499, 599 ou 699, conforme localização e produto) -> campo parcela_min
// - Médio padrão, alto padrão e litoral: "A partir de" = valor total da unidade mais barata -> preco_min
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

/**
 * @param {{ segmento?: string, parcela_min?: number|string, preco_min?: number|string }} emp
 * @returns {{ rotulo: string, valor: string, sufixo: string, temValor: boolean }}
 */
export function precoDoEmpreendimento(emp = {}) {
  const parcela = numero(emp.parcela_min);
  if (emp.segmento === "mcmv" && parcela != null) {
    return { rotulo: "Parcelas a partir de", valor: brl(parcela), sufixo: "/mês", temValor: true };
  }
  const total = numero(emp.preco_min);
  if (total != null) return { rotulo: "A partir de", valor: brl(total), sufixo: "", temValor: true };
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
