import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enviarCandidatura, whatsappDoCandidato } from "./trabalheConosco";
import { VERSAO_POLITICA } from "@/lib/consentimento";

describe("enviarCandidatura", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ candidatura: { recebido: true } }) }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("manda multipart, sem token, com a versão da política e o PDF", async () => {
    const pdf = new File(["%PDF-1.7"], "cv.pdf", { type: "application/pdf" });
    await enviarCandidatura({ nome: "Ana", area: "corretor", vagaId: "", aceite: true }, pdf);
    const [, opcoes] = fetch.mock.calls[0];
    expect(opcoes.body).toBeInstanceOf(FormData);
    expect(opcoes.headers.get("Authorization")).toBeNull();
    expect(opcoes.body.get("consentimentoVersao")).toBe(VERSAO_POLITICA);
    expect(opcoes.body.get("curriculo")).toBeInstanceOf(File);
    expect(opcoes.body.has("vagaId")).toBe(false);
  });
});

describe("whatsappDoCandidato", () => {
  it("corretor aprovado recebe o link de cadastro", () => {
    const url = whatsappDoCandidato({ nome: "Ana Souza", telefone: "81996298692", area: "corretor", status: "aprovado" }, "https://placebrokers.com.br");
    expect(url.startsWith("https://wa.me/5581996298692?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("https://placebrokers.com.br/register");
  });

  it("os demais recebem só a saudação", () => {
    const url = whatsappDoCandidato({ nome: "Ana", telefone: "81996298692", area: "marketing", status: "entrevista" }, "https://x");
    expect(decodeURIComponent(url)).not.toContain("/register");
  });
});
