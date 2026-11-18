import { describe, expect, it } from "vitest";
import { andamentoParaCliente, diasDesdeMedicao, lerAndamento, textoMes, textoPercentual } from "./andamentoObra";

const BELEM = {
  status: "obras",
  andamento_obra: [{ modulo: "Módulo 01", percentual: 86.29 }, { modulo: "Módulo 02", percentual: "59.91" }],
  andamento_referencia: "2026-08-01",
  andamento_fonte_url: "https://aclf.com.br",
};

describe("andamento da obra", () => {
  it("lê os módulos e o mês", () => {
    const a = lerAndamento(BELEM, new Date(2026, 8, 10));
    expect(a.modulos).toEqual([{ modulo: "Módulo 01", percentual: 86.29 }, { modulo: "Módulo 02", percentual: 59.91 }]);
    expect(a.mes).toBe("ago/2026");
    expect(a.desatualizado).toBe(false);
  });

  it("conta os dias a partir do fim do mês da medição", () => {
    expect(diasDesdeMedicao("2026-08-01", new Date(2026, 8, 30, 12))).toBe(29);
    expect(diasDesdeMedicao(null)).toBeNull();
  });

  it("medição de agosto em 18/11 já passou de 60 dias: fica marcada como desatualizada", () => {
    const a = lerAndamento(BELEM, new Date(2026, 10, 18));
    expect(a.desatualizado).toBe(true);
    expect(a.dias).toBeGreaterThan(60);
  });

  it("cliente cadastrado: só medição de até 60 dias e só obra não terminada", () => {
    expect(andamentoParaCliente(BELEM, new Date(2026, 9, 20))).not.toBeNull();
    expect(andamentoParaCliente(BELEM, new Date(2026, 10, 18))).toBeNull();
    expect(andamentoParaCliente({ ...BELEM, status: "pronto" }, new Date(2026, 8, 10))).toBeNull();
    expect(andamentoParaCliente(null)).toBeNull();
  });

  it("sem mês da medição conta como desatualizado; lista vazia não mostra nada", () => {
    expect(lerAndamento({ ...BELEM, andamento_referencia: null }).desatualizado).toBe(true);
    expect(lerAndamento({ andamento_obra: [] })).toBeNull();
    expect(lerAndamento({})).toBeNull();
  });

  it("formatos", () => {
    expect(textoMes("2026-08-01")).toBe("ago/2026");
    expect(textoPercentual(86.29)).toBe("86,29%");
    expect(textoPercentual(60)).toBe("60%");
  });
});
