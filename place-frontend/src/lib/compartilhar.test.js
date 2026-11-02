import { describe, expect, it } from "vitest";
import { linkPublicoDoEmpreendimento, linkWhatsApp, mensagemDoEmpreendimento } from "./compartilhar";

const emp = { id: "6a1b0c2d-0000-4000-8000-000000000001", nome: "Vila Alta Vista", bairro: "Janga", cidade: "Paulista", uf: "PE", segmento: "mcmv", parcela_min: 499, status: "lancamento", previsao_entrega: "2029-12-01" };

describe("compartilhar empreendimento", () => {
  it("monta o link público da janela do empreendimento", () => {
    expect(linkPublicoDoEmpreendimento(emp, "https://placebrokers.com/")).toBe(`https://placebrokers.com/imoveis/${emp.id}`);
  });

  it("mensagem com nome, bairro, parcela, prazo e link, sem book nem tabela", () => {
    const texto = mensagemDoEmpreendimento(emp, { link: "https://x/imoveis/1", primeiroNomeCliente: "Ana" });
    expect(texto).toContain("Olá, Ana!");
    expect(texto).toContain("*Vila Alta Vista* — Janga, Paulista");
    expect(texto).toContain("499");
    expect(texto).toContain("https://x/imoveis/1");
    expect(texto.toLowerCase()).not.toContain("tabela");
  });

  it("bairro 'A confirmar' não aparece", () => {
    const texto = mensagemDoEmpreendimento({ ...emp, bairro: "A confirmar" }, { link: "l" });
    expect(texto).toContain("— Paulista.");
  });

  it("link do WhatsApp com e sem telefone", () => {
    expect(linkWhatsApp("oi tudo bem")).toBe("https://wa.me/?text=oi%20tudo%20bem");
    expect(linkWhatsApp("oi", "(81) 99999-8888")).toBe("https://wa.me/5581999998888?text=oi");
  });
});
