import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, apiRequest } from "./apiClient";
import { getToken } from "@/lib/authToken";

vi.mock("@/lib/authToken", () => ({ getToken: vi.fn() }));
const resposta = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(body),
});

describe("apiClient", () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    getToken.mockReturnValue("token-teste");
  });

  it("centraliza base URL, bearer e serialização JSON", async () => {
    fetch.mockResolvedValue(resposta(201, { cliente: { id: 123 } }));
    await expect(api.post("/clientes", { nome: "Teste" })).resolves.toEqual({ cliente: { id: 123 } });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toMatch(/\/clientes$/);
    expect(options.headers.get("Authorization")).toBe("Bearer token-teste");
    expect(options.headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({ nome: "Teste" });
  });

  it("não envia bearer em rota pública", async () => {
    fetch.mockResolvedValue(resposta(201, { lead: { recebido: true } }));
    await api.post("/leads", { nome: "Teste" }, { auth: false });
    expect(fetch.mock.calls[0][1].headers.has("Authorization")).toBe(false);
  });

  it("não define Content-Type para FormData", async () => {
    fetch.mockResolvedValue(resposta(200, { ok: true }));
    const dados = new FormData();
    dados.append("imagem", new Blob(["teste"]), "imagem.txt");
    await api.post("/empreendimentos/123/imagens/capa", dados);
    const options = fetch.mock.calls[0][1];
    expect(options.body).toBe(dados);
    expect(options.headers.has("Content-Type")).toBe(false);
  });

  it.each([
    [{ error: { code: "VALIDATION_ERROR", message: "Inválido", fieldErrors: { email: "E-mail inválido" } } }, "VALIDATION_ERROR"],
    [{ code: "CONFLICT", message: "Conflito", fieldErrors: {} }, "CONFLICT"],
  ])("normaliza os dois formatos de erro", async (body, code) => {
    fetch.mockResolvedValue(resposta(400, body));
    await expect(apiRequest("/teste")).rejects.toMatchObject({ code, status: 400 });
  });

  it("responde ao status sem JSON sem causar falha", async () => {
    fetch.mockResolvedValue({ ok: true, status: 204, json: vi.fn().mockRejectedValue(new SyntaxError()) });
    await expect(api.delete("/equipe/times/123")).resolves.toEqual({});
  });
});
