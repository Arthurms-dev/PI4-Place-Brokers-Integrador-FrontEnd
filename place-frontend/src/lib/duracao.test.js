import { describe, expect, it } from "vitest";
import { duracao } from "./duracao";

describe("duração em texto", () => {
  it("minutos, horas e dias", () => {
    expect(duracao(null)).toBe("—");
    expect(duracao(8)).toBe("8 min");
    expect(duracao(60)).toBe("1 h");
    expect(duracao(80)).toBe("1 h 20");
    expect(duracao(60 * 49)).toBe("2 dias");
  });
});
