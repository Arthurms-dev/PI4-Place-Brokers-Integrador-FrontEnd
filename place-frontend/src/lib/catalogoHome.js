// Regras da vitrine pública (home): segmentos, filtros e resumos.
// Mantém a mesma regra de preço do catálogo: MCMV mostra parcela; os demais, valor total;
// prontos e usados mostram o preço cheio (entrada à vista), mesmo no MCMV.

import { mostraParcela } from "./precoCatalogo.js";

export const SEGMENTOS_HOME = [
  { id: "mcmv", rotulo: "Minha Casa Minha Vida", curto: "MCMV", chamada: "Saia do aluguel com parcelas que cabem no bolso" },
  { id: "medio_padrao", rotulo: "Médio padrão", curto: "Médio", chamada: "Mais espaço e lazer completo" },
  { id: "alto_padrao", rotulo: "Alto padrão", curto: "Alto", chamada: "Endereços nobres e acabamento superior" },
  { id: "litoral", rotulo: "Litoral", curto: "Litoral", chamada: "Pé na areia para morar ou investir" },
];

export const ETAPAS_HOME = ["Lançamento", "Em obras", "Pronto"];

export const FILTROS_VAZIOS = { texto: "", segmento: "", tag: "", prazo: "", faixa: "", quartos: "" };

/** Filtro de prazo: pronto ou entrega até o fim de um ano. */
export const PRAZOS_HOME = [
  { valor: "2027", rotulo: "Até dez/2027" },
  { valor: "2028", rotulo: "Até dez/2028" },
  { valor: "2029", rotulo: "Até dez/2029" },
];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "Pronto para morar", "ago/2028" ou null — usado no detalhe do empreendimento. */
export function prazoCurto(item) {
  if (item.tag === "Pronto") return "Pronto para morar";
  const [ano, mes] = String(item.entregaEm ?? "").slice(0, 7).split("-").map(Number);
  return ano && mes ? `${MESES[mes - 1]}/${ano}` : null;
}

function atendePrazo(item, prazo) {
  if (!prazo) return true;
  if (item.tag === "Pronto") return true;
  if (prazo === "pronto") return false;
  const ano = Number(String(item.entregaEm ?? "").slice(0, 4));
  return Boolean(ano) && ano <= Number(prazo);
}

const brl = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(valor);

/** "R$ 250 mil", "R$ 1,2 mi" — para chamadas curtas. */
export function valorCurto(valor) {
  if (valor == null) return null;
  if (valor >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  }
  return `R$ ${Math.round(valor / 1000)} mil`;
}

export const normalizarTexto = (texto = "") =>
  String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Faixas do filtro "até": parcelas para MCMV, valor total para os demais. */
export function opcoesDeFaixa(segmento) {
  if (segmento === "mcmv") {
    return [399, 499, 599, 699, 799, 899].map((v) => ({ valor: String(v), rotulo: `Parcela até ${brl(v)}` }));
  }
  return [350_000, 500_000, 750_000, 1_000_000, 1_500_000].map((v) => ({
    valor: String(v),
    rotulo: `Até ${valorCurto(v)}`,
  }));
}

export function filtrarCatalogo(itens, filtros = FILTROS_VAZIOS) {
  const consulta = normalizarTexto((filtros.texto ?? "").trim());
  const faixa = filtros.faixa ? Number(filtros.faixa) : null;

  return itens.filter((item) => {
    if (consulta && !normalizarTexto(
      `${item.title} ${item.cidade} ${item.bairro} ${item.construtora ?? ""}`
    ).includes(consulta)) return false;
    if (filtros.segmento && item.segmento !== filtros.segmento) return false;
    if (filtros.tag && item.tag !== filtros.tag) return false;
    if (!atendePrazo(item, filtros.prazo)) return false;
    if (filtros.quartos && (item.quartosMax ?? 0) < Number(filtros.quartos)) return false;
    if (faixa != null) {
      if (filtros.segmento === "mcmv") {
        if (item.parcelaMin == null || item.parcelaMin > faixa) return false;
      } else if (item.precoMin == null || item.precoMin > faixa) {
        return false;
      }
    }
    return true;
  });
}

/** Quantidade e menor valor de cada segmento, para a vitrine. */
export function resumirSegmentos(itens) {
  return SEGMENTOS_HOME.map((segmento) => {
    const doSegmento = itens.filter((item) => item.segmento === segmento.id);
    const parcelas = doSegmento.filter(mostraParcela).map((i) => i.parcelaMin);
    const precos = doSegmento.map((i) => i.precoMin).filter((v) => v != null);
    const capa = doSegmento.find((i) => i.destaque && i.image) ?? doSegmento.find((i) => i.image) ?? null;

    let chamadaPreco = null;
    if (segmento.id === "mcmv" && parcelas.length) {
      chamadaPreco = { rotulo: "Parcelas a partir de", valor: `${brl(Math.min(...parcelas))}/mês` };
    } else if (precos.length) {
      chamadaPreco = { rotulo: "A partir de", valor: valorCurto(Math.min(...precos)) };
    }

    return { ...segmento, quantidade: doSegmento.length, capa, chamadaPreco };
  }).filter((segmento) => segmento.quantidade > 0);
}

/** Vitrine "Pronto para morar": hoje são os prontos dos lançamentos; depois entram os usados captados. */
export function resumirProntos(itens) {
  const prontos = itens.filter((item) => item.tag === "Pronto");
  if (!prontos.length) return null;
  const precos = prontos.map((i) => i.precoMin).filter((v) => v != null);
  const parcelas = prontos.map((i) => i.parcelaMin).filter((v) => v != null);
  const capa = prontos.find((i) => i.destaque && i.image) ?? prontos.find((i) => i.image) ?? null;
  const chamadaPreco = precos.length
    ? { rotulo: "A partir de", valor: valorCurto(Math.min(...precos)) }
    : parcelas.length ? { rotulo: "Parcelas a partir de", valor: `${brl(Math.min(...parcelas))}/mês` } : null;
  return { quantidade: prontos.length, capa, chamadaPreco };
}

/** Números do topo da home. */
export function numerosDoCatalogo(itens) {
  const construtoras = new Set(itens.map((i) => i.construtora).filter(Boolean));
  const cidades = new Set(itens.map((i) => i.cidade).filter(Boolean));
  const parcelas = itens.filter(mostraParcela).map((i) => i.parcelaMin);
  return {
    empreendimentos: itens.length,
    construtoras: construtoras.size,
    cidades: cidades.size,
    menorParcela: parcelas.length ? Math.min(...parcelas) : null,
    prontos: itens.filter((i) => i.tag === "Pronto").length,
  };
}

export function ordenarCatalogo(lista, ordem) {
  const copia = [...lista];
  if (ordem === "menor") {
    // Quem mostra parcela (MCMV em lançamento ou obras) vem primeiro, da menor parcela para a maior;
    // depois, os que mostram o preço cheio (demais segmentos, prontos e usados) pelo valor total.
    const parcela = (i) => (mostraParcela(i) ? i.parcelaMin : Infinity);
    const total = (i) => i.precoMin ?? Infinity;
    const comparar = (x, y) => (x === y ? 0 : x - y);
    copia.sort((a, b) => comparar(parcela(a), parcela(b)) || comparar(total(a), total(b)));
  } else if (ordem === "entrega") {
    const quando = (i) => (i.tag === "Pronto" ? 0 : i.entregaEm ? Date.parse(i.entregaEm) : Infinity);
    copia.sort((a, b) => quando(a) - quando(b));
  } else {
    copia.sort((a, b) =>
      Number(b.destaque) - Number(a.destaque) ||
      Number(Boolean(b.image)) - Number(Boolean(a.image)) ||
      (b.galeria?.length ?? 0) - (a.galeria?.length ?? 0)
    );
  }
  return copia;
}

// ---- Acesso exclusivo (plantas, implantação, tabela e galeria completa) ----
const CHAVE_ACESSO = "pb_acesso_exclusivo";
export const FOTOS_LIVRES = 6;

export function acessoLiberado() {
  try {
    return window.localStorage.getItem(CHAVE_ACESSO) === "1";
  } catch {
    return false;
  }
}

export function liberarAcesso() {
  try {
    window.localStorage.setItem(CHAVE_ACESSO, "1");
  } catch {
    /* navegador sem armazenamento: libera só nesta visita */
  }
  window.dispatchEvent(new Event("pb-acesso-liberado"));
}

/**
 * "Receber os valores e resolver online" só aparece onde faz sentido fechar a distância:
 * alto padrão, litoral, imóvel pronto e o pedido de usado/pronto. Minha Casa Minha Vida e médio
 * padrão dependem de análise de crédito e documentação, então seguem com o especialista.
 */
export function aceitaResolverOnline(item) {
  if (!item) return false;
  if (item.pedirDetalhes) return true;
  return item.segmento === "alto_padrao" || item.segmento === "litoral" || item.tag === "Pronto";
}
