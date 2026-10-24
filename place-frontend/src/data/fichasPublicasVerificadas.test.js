import { describe, expect, it } from "vitest";
import { obterFichaPublicaVerificada } from "./fichasPublicasVerificadas";
import { normalizarApi } from "./empreendimentosPublicos";
import { formatarFaixa } from "@/services/empreendimentos";

describe("fichas auditadas do catálogo público", () => {
  it("não perde a informação de suíte do Candeias Life Club", () => {
    expect(obterFichaPublicaVerificada("Candeias Life Club")?.suitesTexto).toMatch(/1 suíte/);
  });

  it("não generaliza suíte para todas as unidades do Brisa do Mar", () => {
    expect(obterFichaPublicaVerificada("Brisa do Mar")?.suitesTexto).toBe("Opções com suíte");
  });

  it("exibe suíte no cadastro normalizado do Candeias Life Club", () => {
    const item = normalizarApi({
      id: 5,
      nome: "Candeias Life Club",
      quartos_min: 2,
      quartos_max: 2,
      cidade: "Jaboatão dos Guararapes",
      uf: "PE",
    });

    expect(item.quartosTexto).toBe("2 quartos");
    expect(item.suitesTexto).toMatch(/1 suíte/);
  });

  it("usa a galeria real recebida no detalhe, sem inventar URLs", () => {
    const item = normalizarApi({
      id: 7,
      nome: "Empreendimento sem ficha",
      quartos_min: 2,
      cidade: "Recife",
      uf: "PE",
      imagens: [
        { url: "https://example.test/b.jpg", ordem: 2 },
        { url: "https://example.test/a.jpg", ordem: 1 },
      ],
    });

    expect(item.galeria).toEqual([
      "https://example.test/a.jpg",
      "https://example.test/b.jpg",
    ]);
  });

  it("usa fonte neutra quando o empreendimento não foi confirmado", () => {
    expect(obterFichaPublicaVerificada("Empreendimento desconhecido")).toBeNull();
  });

  it("mostra a faixa de metragem cadastrada no empreendimento", () => {
    const item = normalizarApi({
      id: 10,
      nome: "Imóvel de teste",
      cidade: "Recife",
      uf: "PE",
      area_min: 47,
      area_max: 49,
    });

    expect(item.area).toBe("47 a 49 m²");
  });

  it("não usa uma planta isolada como metragem geral", () => {
    const item = normalizarApi({
      id: 11,
      nome: "Imóvel de teste",
      cidade: "Recife",
      uf: "PE",
      area_min: null,
      area_max: null,
      tipologias: [{ id: "planta-1", area_m2: 49 }],
    });

    expect(item.area).toBeNull();
  });

  it("não exibe faixa de metragem invertida", () => {
    const item = normalizarApi({
      id: 12,
      nome: "Imóvel de teste",
      cidade: "Recife",
      uf: "PE",
      area_min: 60,
      area_max: 40,
    });

    expect(item.area).toBeNull();
  });

  it("trata faixas com apenas o limite máximo", () => {
    expect(formatarFaixa(null, 3, "quarto", "quartos")).toBe("Até 3 quartos");
    expect(formatarFaixa(null, 1, "vaga", "vagas")).toBe("Até 1 vaga");
  });

  it("não mostra intervalos numéricos invertidos", () => {
    expect(formatarFaixa(3, 2, "quarto", "quartos")).toBe("");
    expect(formatarFaixa(2, 2, "quarto", "quartos")).toBe("2 quartos");
  });
});
