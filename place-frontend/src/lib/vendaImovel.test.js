import { describe, expect, it } from "vitest";
import { LIMITE_OBSERVACOES, VENDER_IMOVEL, linhaDoImovel, querVenderImovel } from "./vendaImovel";

describe("venda de imóvel", () => {
  it("resume o imóvel numa linha só", () => {
    expect(linhaDoImovel({ tipo: "Apartamento", local: " Boa  Viagem, Recife ", quartos: "3", area: "92,5", valor: "R$ 750 mil", situacao: "Quitado" }))
      .toBe("Imóvel para vender: Apartamento · Boa Viagem, Recife · 3 quartos · 93 m² · quer R$ 750 mil · Quitado");
    expect(linhaDoImovel({ tipo: "Casa", quartos: 1 })).toBe("Imóvel para vender: Casa · 1 quarto");
  });

  it("junta as observações e corta no limite", () => {
    const linha = linhaDoImovel({ tipo: "Casa", observacoes: `vista mar\n${"x".repeat(LIMITE_OBSERVACOES + 40)}` });
    expect(linha.startsWith("Imóvel para vender: Casa\nObservações: vista mar x")).toBe(true);
    expect(linha.split("\nObservações: ")[1].length).toBe(LIMITE_OBSERVACOES);
  });

  it("ignora campos vazios ou inválidos", () => {
    expect(linhaDoImovel({})).toBe("");
    expect(linhaDoImovel({ quartos: "0", area: "abc" })).toBe("");
    expect(linhaDoImovel({ observacoes: "ligar depois das 18h" })).toBe("Imóvel para vender: sem detalhes\nObservações: ligar depois das 18h");
  });

  it("reconhece o lead de quem quer vender", () => {
    expect(querVenderImovel(`Interesse em: ${VENDER_IMOVEL.title} — via página prontos e seminovos\nImóvel para vender: Casa`)).toBe(true);
    expect(querVenderImovel("Interesse em: Edifício Mar Azul — via lista da home")).toBe(false);
    expect(querVenderImovel(null)).toBe(false);
  });
});
