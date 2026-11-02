import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registrarEvento } from "./eventos";

describe("registrarEvento", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({}) }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("corretor logado: manda o token para a visita contar em Abertos recentemente", () => {
    localStorage.setItem("placebrokers_token", "token-do-corretor");
    registrarEvento({ tipo: "visualizacao_empreendimento", empreendimentoId: "e1" });
    const [url, opcoes] = fetch.mock.calls[0];
    expect(url).toMatch(/\/metricas\/eventos$/);
    expect(opcoes.headers.get("Authorization")).toBe("Bearer token-do-corretor");
    expect(opcoes.keepalive).toBe(true);
  });

  it("visitante sem login: vai sem token", () => {
    registrarEvento({ tipo: "visualizacao_site" });
    const [, opcoes] = fetch.mock.calls[0];
    expect(opcoes.headers.has("Authorization")).toBe(false);
    expect(JSON.parse(opcoes.body).tipo).toBe("visualizacao_site");
  });
});
