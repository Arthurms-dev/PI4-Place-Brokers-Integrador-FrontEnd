import { describe, expect, it } from "vitest";
import { normalizarTelefone } from "./telefone";

describe("normalizarTelefone", () => {
  it("o mesmo celular digitado de jeitos diferentes vira um só número", () => {
    for (const v of ["(81) 99876-5432", "+55 81 99876-5432", "081998765432", "0 41 81 99876-5432"]) {
      expect(normalizarTelefone(v).digitos).toBe("81998765432");
    }
  });

  it("celular antigo ganha o 9 e fixo fica com 10 dígitos", () => {
    expect(normalizarTelefone("(81) 8876-5432").digitos).toBe("81988765432");
    expect(normalizarTelefone("(81) 3222-1100").digitos).toBe("8132221100");
  });

  it("recusa DDD inexistente, celular sem 9 e número repetido", () => {
    expect(normalizarTelefone("(20) 99876-5432")).toEqual({ ok: false, erro: "DDD inválido." });
    expect(normalizarTelefone("(81) 89876-5432").ok).toBe(false);
    expect(normalizarTelefone("(81) 99999-9999").ok).toBe(false);
  });
});
