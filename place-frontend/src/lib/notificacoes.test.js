import { describe, expect, it } from "vitest";
import { chaveParaBytes } from "./notificacoes";

describe("chave das notificações", () => {
  it("converte base64url sem preenchimento", () => {
    expect(Array.from(chaveParaBytes("AQID_-8"))).toEqual([1, 2, 3, 255, 239]);
  });
});
