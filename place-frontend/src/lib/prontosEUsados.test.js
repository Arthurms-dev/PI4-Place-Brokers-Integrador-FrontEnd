import { describe, expect, it } from "vitest";
import { BUSCA_PRONTOS_E_USADOS, LIMITE_DETALHES, linhaDoPedido, pedeProntoOuUsado } from "./prontosEUsados";

describe("prontos e usados", () => {
  it("monta a linha do pedido sem quebras e com limite", () => {
    expect(linhaDoPedido("  3 quartos\n em Boa Viagem  ")).toBe("Procura: 3 quartos em Boa Viagem");
    expect(linhaDoPedido("")).toBe("");
    expect(linhaDoPedido("x".repeat(LIMITE_DETALHES + 50)).length).toBe("Procura: ".length + LIMITE_DETALHES);
  });

  it("reconhece o lead que pediu pronto ou usado", () => {
    expect(pedeProntoOuUsado(`Interesse em: ${BUSCA_PRONTOS_E_USADOS.title} — via prontos e usados\nProcura: casa em Olinda`)).toBe(true);
    expect(pedeProntoOuUsado("Interesse em: Edifício Mar Azul — via lista da home")).toBe(false);
    expect(pedeProntoOuUsado(null)).toBe(false);
  });
});
