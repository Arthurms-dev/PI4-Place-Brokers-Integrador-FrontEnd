import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AndamentoObra from "./AndamentoObra";
import { lerAndamento } from "@/lib/andamentoObra";

const emp = {
  andamento_obra: [{ modulo: "Módulo 01", percentual: 86.29 }, { modulo: "Módulo 02", percentual: 59.91 }],
  andamento_referencia: "2026-08-01",
  andamento_fonte_url: "https://aclf.com.br/belem",
};

describe("AndamentoObra", () => {
  it("mostra cada módulo com barra acessível e o mês", () => {
    render(<AndamentoObra andamento={lerAndamento(emp, new Date(2026, 8, 10))} />);
    expect(screen.getByRole("progressbar", { name: "Módulo 01: 86,29% concluído" })).toHaveAttribute("aria-valuenow", "86.29");
    expect(screen.getByText("Medição de ago/2026")).toBeInTheDocument();
    expect(screen.queryByText(/página da construtora/)).toBeNull();
  });

  it("para o corretor: avisa que está desatualizado e mostra a fonte", () => {
    render(<AndamentoObra andamento={lerAndamento(emp, new Date(2026, 10, 18))} interno />);
    expect(screen.getByText(/desatualizado há \d+ dias/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver na página da construtora" })).toHaveAttribute("href", "https://aclf.com.br/belem");
  });

  it("sem andamento não desenha nada", () => {
    const { container } = render(<AndamentoObra andamento={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
