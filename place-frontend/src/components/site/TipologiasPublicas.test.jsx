
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TipologiasPublicas from "./TipologiasPublicas";

describe("Tipologias públicas", () => {
  it("não mostra a seção quando não existem plantas", () => {
    const { container } = render(
      <TipologiasPublicas tipologias={[]} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("mostra as características cadastradas", () => {
    render(
      <TipologiasPublicas
        tipologias={[
          {
            id: "planta-1",
            nome: "Planta de 2 quartos",
            quartos: 2,
            suites: 1,
            vagas: null,
            area_m2: 54,
            ordem: 0,
          },
        ]}
      />
    );

    expect(screen.getByText("Planta de 2 quartos")).toBeTruthy();
    expect(screen.getByText("2 quartos")).toBeTruthy();
    expect(screen.getByText("1 suíte")).toBeTruthy();
    expect(screen.getByText("54 m²")).toBeTruthy();
    expect(screen.queryByText("0 vagas")).toBeNull();
  });

  it("preserva o valor zero quando cadastrado", () => {
    render(
      <TipologiasPublicas
        tipologias={[
          {
            id: "planta-2",
            nome: "Planta sem garagem",
            vagas: 0,
          },
        ]}
      />
    );

    expect(screen.getByText("0 vagas")).toBeTruthy();
  });
});
