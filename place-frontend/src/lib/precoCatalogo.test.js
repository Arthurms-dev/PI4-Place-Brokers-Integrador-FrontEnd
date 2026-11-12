import { describe, expect, it } from "vitest";
import { avisoDeSegmento, mostraPrecoCheio, prazoDoEmpreendimento, precoDoEmpreendimento } from "./precoCatalogo";

const limpa = (s) => s.replace(/\s/g, " ");

describe("precoDoEmpreendimento", () => {
  it("MCMV mostra parcelas a partir de", () => {
    const p = precoDoEmpreendimento({ segmento: "mcmv", parcela_min: 499, preco_min: 238848 });
    expect(p.rotulo).toBe("Parcelas a partir de");
    expect(limpa(p.valor)).toBe("R$ 499");
    expect(p.sufixo).toBe("/mês");
  });

  it("demais segmentos mostram o valor total da unidade mais barata", () => {
    const p = precoDoEmpreendimento({ segmento: "litoral", preco_min: "350000.00" });
    expect(p.rotulo).toBe("A partir de");
    expect(limpa(p.valor)).toBe("R$ 350.000");
  });

  it("MCMV sem parcela cai no valor total; sem nada vira sob consulta", () => {
    expect(precoDoEmpreendimento({ segmento: "mcmv", preco_min: 225000 }).rotulo).toBe("A partir de");
    expect(precoDoEmpreendimento({}).valor).toBe("Sob consulta");
  });

  it("pronto e usado mostram o preço cheio, mesmo no MCMV (entrada à vista)", () => {
    const pronto = precoDoEmpreendimento({ segmento: "mcmv", status: "pronto", parcela_min: 899, preco_min: "276000.00" });
    expect(pronto.rotulo).toBe("A partir de");
    expect(limpa(pronto.valor)).toBe("R$ 276.000");
    expect(pronto.sufixo).toBe("");
    expect(precoDoEmpreendimento({ segmento: "mcmv", status: "usado", parcela_min: 399, preco_min: 180000 }).rotulo).toBe("A partir de");
  });

  it("MCMV em lançamento ou obras continua com a parcela", () => {
    expect(precoDoEmpreendimento({ segmento: "mcmv", status: "obras", parcela_min: 899, preco_min: 269900 }).rotulo).toBe("Parcelas a partir de");
    expect(precoDoEmpreendimento({ segmento: "mcmv", status: "lancamento", parcela_min: 799, preco_min: 279000 }).sufixo).toBe("/mês");
  });

  it("pronto sem preço cheio cadastrado ainda mostra a parcela", () => {
    expect(precoDoEmpreendimento({ segmento: "mcmv", status: "pronto", parcela_min: 899 }).rotulo).toBe("Parcelas a partir de");
  });

  it("reconhece o status do banco e a etiqueta do card", () => {
    expect(mostraPrecoCheio({ status: "pronto" })).toBe(true);
    expect(mostraPrecoCheio({ tag: "Pronto" })).toBe(true);
    expect(mostraPrecoCheio({ tag: "Usado" })).toBe(true);
    expect(mostraPrecoCheio({ status: "obras" })).toBe(false);
    expect(mostraPrecoCheio()).toBe(false);
  });
});

describe("avisoDeSegmento", () => {
  it("médio padrão é acima de R$ 300 mil", () => {
    expect(avisoDeSegmento({ segmento: "medio_padrao", precoMin: "279000" })).toMatch(/o segmento é MCMV/);
    expect(avisoDeSegmento({ segmento: "mcmv", precoMin: 314000 })).toMatch(/Médio padrão/);
  });
  it("não avisa quando está dentro da regra ou sem preço", () => {
    expect(avisoDeSegmento({ segmento: "mcmv", precoMin: 300000 })).toBeNull();
    expect(avisoDeSegmento({ segmento: "medio_padrao", precoMin: 300001 })).toBeNull();
    expect(avisoDeSegmento({ segmento: "litoral", precoMin: 219322 })).toBeNull();
    expect(avisoDeSegmento({ segmento: "medio_padrao", precoMin: "" })).toBeNull();
  });
});

describe("prazoDoEmpreendimento", () => {
  it("pronto para morar tem prioridade", () => {
    expect(prazoDoEmpreendimento({ status: "pronto", previsao_entrega: "2027-04-01" })).toBe("Pronto para morar");
  });
  it("formata mês/ano da previsão", () => {
    expect(prazoDoEmpreendimento({ status: "obras", previsao_entrega: "2028-08-01" })).toBe("Entrega prevista: ago/2028");
  });
  it("sem previsão retorna null", () => {
    expect(prazoDoEmpreendimento({ status: "lancamento" })).toBeNull();
  });
});
