import { describe, expect, it } from "vitest";
import { auditarTipologias } from "./auditoriaTipologias";

describe("auditoria entre cadastro geral e plantas", () => {
  const campos = {
    quartosMin: "2", quartosMax: "3",
    vagasMin: "1", vagasMax: "2",
    areaMin: "45", areaMax: "60",
  };

  it("não alerta quando os valores da planta estão dentro das faixas", () => {
    const avisos = auditarTipologias(campos, [
      { nome: "Planta 2Q", quartos: 2, vagas: 1, area_m2: 49 },
    ]);
    expect(avisos).toEqual([]);
  });

  it("alerta separadamente sobre quartos, vagas e área divergentes", () => {
    const avisos = auditarTipologias(campos, [
      { nome: "Planta teste", quartos: 4, vagas: 3, area_m2: 70 },
    ]);
    expect(avisos).toHaveLength(3);
    expect(avisos.map(({ mensagem }) => mensagem).join(" ")).toContain("Planta teste");
    expect(avisos.some(({ mensagem }) => mensagem.includes("quartos"))).toBe(true);
    expect(avisos.some(({ mensagem }) => mensagem.includes("vagas"))).toBe(true);
    expect(avisos.some(({ mensagem }) => mensagem.includes("m²"))).toBe(true);
  });

  it("ignora limites gerais vazios sem presumir uma faixa", () => {
    expect(auditarTipologias(
      { quartosMin: "", quartosMax: null, areaMin: "", areaMax: "" },
      [{ nome: "Planta", quartos: 4, area_m2: 99 }]
    )).toEqual([]);
  });

  it("respeita quando apenas um limite foi preenchido", () => {
    const avisos = auditarTipologias(
      { quartosMin: "2", quartosMax: "", vagasMin: "", vagasMax: "1" },
      [{ nome: "Studio", quartos: 1, vagas: 2 }]
    );
    expect(avisos).toHaveLength(2);
    expect(avisos[0].mensagem).toContain("a partir de 2 quartos");
    expect(avisos[1].mensagem).toContain("até 1 vaga");
  });

  it("considera zero quartos válido para studio", () => {
    expect(auditarTipologias(
      { quartosMin: 1, quartosMax: 3 },
      [{ nome: "Studio", quartos: 0 }]
    )).toHaveLength(1);
  });

  it("não compara valores desconhecidos ou inválidos", () => {
    expect(auditarTipologias(campos, [
      { nome: "Sem definição", quartos: null, vagas: "", area_m2: 0 },
      { nome: "Incorreto", quartos: "abc", vagas: -1, area_m2: "xyz" },
    ])).toEqual([]);
  });

  it("não sinaliza faixa geral invertida, já tratada pela validação do formulário", () => {
    expect(auditarTipologias(
      { quartosMin: "3", quartosMax: "2" },
      [{ nome: "Planta", quartos: 1 }]
    )).toEqual([]);
  });

  it("usa a ordem da lista para criar chaves estáveis por avaliação", () => {
    const avisos = auditarTipologias({ quartosMax: 1 }, [
      { nome: "Planta A", quartos: 2 },
      { nome: "Planta B", quartos: 3 },
    ]);
    expect(avisos).toHaveLength(2);
    expect(avisos.map((aviso) => aviso.chave)).toEqual(["0-quartos", "1-quartos"]);
  });
});
