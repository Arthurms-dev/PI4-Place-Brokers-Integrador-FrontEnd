import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DadosParaDecidir from "./DadosParaDecidir";

const andamento = { modulos: [{ modulo: "Módulo 01", percentual: 86.29 }], mes: "out/2026", dias: 10, desatualizado: false, fonte: null };

describe("DadosParaDecidir", () => {
  it("mostra a procura real e o andamento", () => {
    render(<DadosParaDecidir andamento={andamento} procura={{ pessoas: 57, periodo: "semana" }} />);
    expect(screen.getByText("57")).toBeInTheDocument();
    expect(screen.getByText(/nos últimos 7 dias/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /Módulo 01/ })).toBeInTheDocument();
  });

  it("sem procura (abaixo do mínimo) mostra só o andamento", () => {
    render(<DadosParaDecidir andamento={andamento} procura={null} />);
    expect(screen.queryByText(/pessoas viram/)).toBeNull();
    expect(screen.getByText("Medição de out/2026")).toBeInTheDocument();
  });

  it("sem nada, não desenha nada", () => {
    const { container } = render(<DadosParaDecidir andamento={null} procura={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
