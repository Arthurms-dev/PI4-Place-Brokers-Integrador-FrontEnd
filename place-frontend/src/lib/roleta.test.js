import { describe, expect, it } from "vitest";
import { diaPorExtenso, horaRecife, motivoAguardando, situacaoDoCorretor } from "./roleta";

const base = { horario: { situacao: "chegada" }, iniciada: false, recebidosHoje: 0 };

describe("roleta nas telas", () => {
  it("hora e dia no fuso de Recife", () => {
    expect(horaRecife("2026-10-30T11:42:00Z")).toBe("08:42");
    expect(diaPorExtenso("2026-10-30")).toBe("sexta-feira, 30 de outubro");
  });

  it("corretor apto vê a posição e quantos leads recebeu", () => {
    const s = situacaoDoCorretor({ ...base, iniciada: true, recebidosHoje: 2, chegada: { ordem: 3, apto: true, chegouEm: "2026-10-30T11:05:00Z" } });
    expect(s.tom).toBe("ok");
    expect(s.titulo).toBe("Roleta de hoje: você é o nº 3");
    expect(s.detalhe).toContain("Chegou às 08:05 · 2 leads recebidos hoje");
  });

  it("chegou depois das 09h não recebe", () => {
    const s = situacaoDoCorretor({ ...base, horario: { situacao: "distribuindo" }, chegada: { ordem: 9, apto: false, chegouEm: "2026-10-30T12:20:00Z" } });
    expect(s.titulo).toBe("Chegou às 09:20, depois do fechamento da lista");
  });

  it("sem chegada: lembra de avisar a recepção até 09h; domingo não mostra nada", () => {
    expect(situacaoDoCorretor({ ...base, chegada: null }).tom).toBe("aviso");
    expect(situacaoDoCorretor({ ...base, horario: { situacao: "fechada" }, chegada: null })).toBeNull();
  });

  it("explica por que o lead está aguardando", () => {
    expect(motivoAguardando({ horario: { situacao: "chegada" }, iniciada: null })).toContain("09h");
    expect(motivoAguardando({ horario: { situacao: "distribuindo" }, iniciada: { em: "x" } })).toContain("foco");
  });
});
