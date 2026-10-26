import { describe, expect, it } from "vitest";
import { prazoDoEmpreendimento, precoDoEmpreendimento } from "./precoCatalogo";

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
