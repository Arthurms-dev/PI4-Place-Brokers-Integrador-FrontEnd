import { describe, expect, it } from "vitest";
import {
  FILTROS_VAZIOS,
  prazoCurto,
  filtrarCatalogo,
  numerosDoCatalogo,
  opcoesDeFaixa,
  ordenarCatalogo,
  resumirSegmentos,
  valorCurto,
} from "./catalogoHome";

const itens = [
  { id: "1", title: "Viva Vida Primavera", cidade: "São Lourenço da Mata", bairro: "Nova Tiúma", construtora: "Direcional", segmento: "mcmv", parcelaMin: 399, precoMin: 197300, tag: "Em obras", quartosMax: 2, image: "a.webp", entregaEm: "2029-04-01" },
  { id: "2", title: "Wave Boa Viagem", cidade: "Recife", bairro: "Boa Viagem", construtora: "Direcional", segmento: "medio_padrao", parcelaMin: null, precoMin: 409600, tag: "Em obras", quartosMax: 2, image: "b.webp", entregaEm: "2028-12-01" },
  { id: "3", title: "Parc Jardin", cidade: "Recife", bairro: "Boa Viagem", construtora: "Ceta", segmento: "alto_padrao", parcelaMin: null, precoMin: 530000, tag: "Pronto", quartosMax: 3, image: null, entregaEm: null },
  { id: "4", title: "Premier Residence", cidade: "Recife", bairro: "Iputinga", construtora: "MRV", segmento: "mcmv", parcelaMin: 599, precoMin: 274990, tag: "Em obras", quartosMax: 2, image: null, entregaEm: "2029-02-01" },
];

describe("filtrarCatalogo", () => {
  it("busca por bairro, construtora e sem acento", () => {
    expect(filtrarCatalogo(itens, { ...FILTROS_VAZIOS, texto: "sao lourenco" }).map((i) => i.id)).toEqual(["1"]);
    expect(filtrarCatalogo(itens, { ...FILTROS_VAZIOS, texto: "ceta" }).map((i) => i.id)).toEqual(["3"]);
  });

  it("em MCMV a faixa compara a parcela; nos demais, o valor total", () => {
    expect(filtrarCatalogo(itens, { ...FILTROS_VAZIOS, segmento: "mcmv", faixa: "499" }).map((i) => i.id)).toEqual(["1"]);
    expect(filtrarCatalogo(itens, { ...FILTROS_VAZIOS, faixa: "500000" }).map((i) => i.id)).toEqual(["1", "2", "4"]);
  });

  it("filtra por situação e quartos", () => {
    expect(filtrarCatalogo(itens, { ...FILTROS_VAZIOS, tag: "Pronto" }).map((i) => i.id)).toEqual(["3"]);
    expect(filtrarCatalogo(itens, { ...FILTROS_VAZIOS, quartos: "3" }).map((i) => i.id)).toEqual(["3"]);
  });
});

describe("prazo", () => {
  it("filtra por prazo: pronto conta em qualquer faixa", () => {
    expect(filtrarCatalogo(itens, { ...FILTROS_VAZIOS, prazo: "pronto" }).map((i) => i.id)).toEqual(["3"]);
    expect(filtrarCatalogo(itens, { ...FILTROS_VAZIOS, prazo: "2028" }).map((i) => i.id)).toEqual(["2", "3"]);
  });
  it("prazo curto para o detalhe", () => {
    expect(prazoCurto(itens[2])).toBe("Pronto para morar");
    expect(prazoCurto(itens[1])).toBe("dez/2028");
    expect(prazoCurto({ tag: "Lançamento", entregaEm: null })).toBeNull();
  });
});

describe("resumos", () => {
  it("vitrine mostra parcela mínima no MCMV e valor curto nos demais", () => {
    const [mcmv, medio, alto] = resumirSegmentos(itens);
    expect(mcmv.quantidade).toBe(2);
    expect(mcmv.chamadaPreco.valor.replace(/\s/g, " ")).toBe("R$ 399/mês");
    expect(medio.chamadaPreco).toEqual({ rotulo: "A partir de", valor: "R$ 410 mil" });
    expect(alto.capa).toBeNull();
  });

  it("números do topo", () => {
    expect(numerosDoCatalogo(itens)).toEqual({ empreendimentos: 4, construtoras: 3, cidades: 2, menorParcela: 399, prontos: 1 });
  });

  it("faixas e valores curtos", () => {
    expect(opcoesDeFaixa("mcmv").map((o) => o.valor)).toEqual(["399", "499", "599", "699"]);
    expect(valorCurto(1_188_760)).toBe("R$ 1,2 mi");
  });
});

describe("ordenarCatalogo", () => {
  it("entrega mais próxima coloca prontos primeiro", () => {
    expect(ordenarCatalogo(itens, "entrega").map((i) => i.id)).toEqual(["3", "2", "4", "1"]);
  });
  it("menor valor usa o valor total", () => {
    expect(ordenarCatalogo(itens, "menor").map((i) => i.id)).toEqual(["1", "4", "2", "3"]);
  });
});
