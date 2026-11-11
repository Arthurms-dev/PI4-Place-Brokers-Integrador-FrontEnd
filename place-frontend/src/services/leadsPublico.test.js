import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enviarLead } from "./leadsPublico";

describe("enviarLead (LGPD)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ lead: { recebido: true } }) }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("registra o consentimento e a escolha de avisos na mensagem do lead", async () => {
    await enviarLead({ nome: "Ana", email: "ana@x.com", telefone: "81999998888", empreendimento: null, canal: "home - acesso exclusivo", consentimento: { novidades: true } });
    const corpo = JSON.parse(fetch.mock.calls[0][1].body);
    expect(corpo.mensagem).toContain("via home - acesso exclusivo");
    expect(corpo.mensagem).toContain("Autorizou o contato (política de privacidade de 02/11/2026)");
    expect(corpo.mensagem).toContain("Quer receber avisos de lançamentos");
  });

  it("pedido de pronto/usado leva o que o cliente procura e não manda empreendimentoId", async () => {
    await enviarLead({
      nome: "Ana", email: "ana@x.com", telefone: "81999998888",
      empreendimento: { id: "prontos-e-usados", title: "Imóvel pronto ou usado" },
      canal: "prontos e usados", detalhes: "3 quartos em Boa Viagem", consentimento: { novidades: false },
    });
    const corpo = JSON.parse(fetch.mock.calls[0][1].body);
    expect(corpo.mensagem).toMatch(/^Interesse em: Imóvel pronto ou usado — via prontos e usados\nProcura: 3 quartos em Boa Viagem/);
    expect(corpo.empreendimentoId).toBeUndefined();
  });

  it("sem marcar avisos, deixa claro que não quer", async () => {
    await enviarLead({ nome: "Ana", email: "ana@x.com", telefone: "81999998888", consentimento: { novidades: false } });
    expect(JSON.parse(fetch.mock.calls[0][1].body).mensagem).toContain("Não quer avisos de lançamentos");
  });
});
