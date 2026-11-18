import { describe, expect, it } from "vitest";
import { fatosVisiveis, textoEvolucao } from "./fatosMercado";

const FATO = { texto: "Porto de Galinhas recebeu mais turistas em 2025.", fonte: "Governo de PE", url: "https://www.pe.gov.br/x", mes: "2026-02" };

describe("fatos de mercado", () => {
  it("mostra fato com fonte e mês, do mais novo para o mais antigo", () => {
    const lista = fatosVisiveis({ fatos_mercado: [FATO, { ...FATO, mes: "2026-09" }] }, new Date(2026, 10, 18));
    expect(lista.map((f) => f.mes)).toEqual(["2026-09", "2026-02"]);
    expect(lista[0].mesTexto).toBe("set/2026");
  });

  it("esconde fato velho (mais de 18 meses) e fato sem link https", () => {
    expect(fatosVisiveis({ fatos_mercado: [{ ...FATO, mes: "2024-01" }] }, new Date(2026, 10, 18))).toEqual([]);
    expect(fatosVisiveis({ fatos_mercado: [{ ...FATO, url: "http://x" }] }, new Date(2026, 10, 18))).toEqual([]);
    expect(fatosVisiveis({})).toEqual([]);
  });

  it("texto da evolução do preço (subida e queda)", () => {
    expect(textoEvolucao({ de: 480000, para: 530000, desde: "2026-11-18", variacao: 10.4 })).toEqual({
      titulo: "Subiu 10,4%",
      detalhe: "O preço de entrada foi de R$ 480 mil para R$ 530 mil desde nov/2026.",
    });
    expect(textoEvolucao({ de: 1_200_000, para: 1_080_000, desde: "2026-11-01", variacao: -10 }).titulo).toBe("Caiu 10%");
    expect(textoEvolucao(null)).toBeNull();
  });
});
