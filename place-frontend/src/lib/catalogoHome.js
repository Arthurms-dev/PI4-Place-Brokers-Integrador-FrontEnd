// Regras da vitrine pública (home): segmentos, filtros e resumos.
// Mantém a mesma regra de preço do catálogo: MCMV mostra parcela; os demais, valor total.

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
    return [399, 499, 599, 699].map((v) => ({ valor: String(v), rotulo: `Parcela até ${brl(v)}` }));
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
    const parcelas = doSegmento.map((i) => i.parcelaMin).filter((v) => v != null);
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

/** Números do topo da home. */
export function numerosDoCatalogo(itens) {
  const construtoras = new Set(itens.map((i) => i.construtora).filter(Boolean));
  const cidades = new Set(itens.map((i) => i.cidade).filter(Boolean));
  const parcelas = itens.map((i) => i.parcelaMin).filter((v) => v != null);
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
    // MCMV primeiro pelo valor total também, para a ordem fazer sentido entre segmentos.
    copia.sort((a, b) => (a.precoMin ?? Infinity) - (b.precoMin ?? Infinity));
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
