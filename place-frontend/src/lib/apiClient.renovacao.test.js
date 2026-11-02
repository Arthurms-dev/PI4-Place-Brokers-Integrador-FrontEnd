import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./apiClient";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./authToken";

const resposta = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

describe("renovação da sessão no site", () => {
  beforeEach(() => {
    localStorage.setItem(AUTH_TOKEN_KEY, "token-vencido");
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-1");
  });
  afterEach(() => localStorage.clear());

  it("token vencido: renova e repete o pedido sem deslogar", async () => {
    const fetchImpl = vi.fn(async (url, op) => {
      if (url.endsWith("/auth/renovar")) return resposta(200, { token: "token-novo", refreshToken: "refresh-2" });
      return op.headers.get("Authorization") === "Bearer token-novo" ? resposta(200, { leads: [1] }) : resposta(401, { code: "UNAUTHENTICATED" });
    });
    const r = await apiRequest("/leads/meus", { fetchImpl, baseUrl: "http://api" });
    expect(r).toEqual({ leads: [1] });
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("token-novo");
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-2");
  });

  it("refresh recusado: sai da conta", async () => {
    const fetchImpl = vi.fn(async () => resposta(401, { code: "UNAUTHENTICATED", message: "Sessão expirada" }));
    await expect(apiRequest("/leads/meus", { fetchImpl, baseUrl: "http://api" })).rejects.toMatchObject({ status: 401 });
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it("rota pública não tenta renovar", async () => {
    const fetchImpl = vi.fn(async () => resposta(401, {}));
    await expect(apiRequest("/auth/login", { auth: false, fetchImpl, baseUrl: "http://api" })).rejects.toMatchObject({ status: 401 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
