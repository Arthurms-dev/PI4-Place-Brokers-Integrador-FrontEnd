import { describe, expect, it } from "vitest";
import {
  atalhosLembrete,
  digitosTelefone,
  formatarTelefone,
  gerarIcsLembrete,
  linkLigar,
  linkWhatsApp,
  tempoDesde,
  urgencia,
} from "./atendimento";

const agora = new Date("2026-10-29T12:00:00");

describe("atendimento do lead", () => {
  it("telefone: tira o 55, formata e monta os links", () => {
    expect(digitosTelefone("5581999998888")).toBe("81999998888");
    expect(formatarTelefone("81999998888")).toBe("(81) 99999-8888");
    expect(linkLigar("(81) 99999-8888")).toBe("tel:+5581999998888");
    expect(linkWhatsApp("81999998888")).toBe("https://wa.me/5581999998888");
  });

  it("tempo de espera em texto curto", () => {
    expect(tempoDesde(new Date(agora - 20 * 1000), agora)).toBe("agora");
    expect(tempoDesde(new Date(agora - 7 * 60000), agora)).toBe("há 7 min");
    expect(tempoDesde(new Date(agora - 3 * 3600000), agora)).toBe("há 3 h");
    expect(tempoDesde(new Date(agora - 26 * 3600000), agora)).toBe("há 1 dia");
  });

  it("urgência: até 5 min ok, até 15 atenção, depois atrasado", () => {
    expect(urgencia(new Date(agora - 4 * 60000), agora)).toBe("ok");
    expect(urgencia(new Date(agora - 10 * 60000), agora)).toBe("atencao");
    expect(urgencia(new Date(agora - 40 * 60000), agora)).toBe("atrasado");
  });

  it("atalhos do lembrete somem quando já passou da hora", () => {
    expect(atalhosLembrete(agora).map((a) => a.rotulo)).toEqual(["Em 1 hora", "Hoje, 18h", "Amanhã, 9h"]);
    expect(atalhosLembrete(new Date("2026-10-29T17:50:00")).map((a) => a.rotulo)).toEqual(["Em 1 hora", "Amanhã, 9h"]);
  });

  it(".ics do lembrete tem alarme na hora marcada", () => {
    const ics = gerarIcsLembrete(
      { id: "a1", nome: "Matheus Silva", telefone: "81999998888", empreendimento: "Araçá Prime", nota: "Ligar depois do almoço", quando: "2026-10-30T15:00:00Z" },
      new Date("2026-10-29T12:00:00Z"),
    );
    expect(ics).toContain("DTSTART:20261030T150000Z");
    expect(ics).toContain("TRIGGER:PT0M");
    expect(ics).toContain("SUMMARY:Retornar: Matheus Silva (Araçá Prime)");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
