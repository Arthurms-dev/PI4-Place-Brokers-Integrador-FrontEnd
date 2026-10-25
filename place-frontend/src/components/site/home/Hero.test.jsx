import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Hero from "./Hero";

const filtros = { texto: "", tag: "", quartos: "", precoAte: "" };
const itens = [
  { id: "a", title: "Araçá", cidade: "Recife", city: "Recife, PE", image: "/araca.jpg", preco: "Sob consulta", disponivel: true },
  { id: "b", title: "Candeias", cidade: "Jaboatão", city: "Jaboatão, PE", image: "/candeias.jpg", preco: "A partir de R$ 350.000", disponivel: true },
];
function montar(props = {}) {
  const handlers = { onBuscar: vi.fn(), onFalar: vi.fn(), onFiltros: vi.fn() };
  render(<MemoryRouter><Hero itens={itens} filtros={filtros} tags={["Pronto"]} cidades={["Recife"]} sugestoes={[]} {...handlers} {...props} /></MemoryRouter>);
  return handlers;
}
afterEach(cleanup);

describe("abertura da home", () => {
  it("diferencia intenção de investimento e encaminha ao formulário com origem", async () => {
    const user = userEvent.setup();
    const { onFalar, onBuscar } = montar();
    await user.click(screen.getByRole("button", { name: "Quero investir" }));
    expect(screen.getByRole("button", { name: "Quero investir" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Conversar sobre investimento" }));
    expect(onFalar).toHaveBeenCalledWith(null, "investimento na home");
    expect(onBuscar).not.toHaveBeenCalled();
  });

  it("troca o imóvel, o valor e o destino juntos", async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole("button", { name: "Mostrar Candeias" }));
    expect(screen.getByRole("link", { name: "Explorar imóvel" })).toHaveAttribute("href", "/imoveis/b");
    expect(screen.getByText("A partir de R$ 350.000")).toBeInTheDocument();
  });

  it("não destaca imóveis esgotados e se recupera de foto indisponível", () => {
    montar({ itens: [{ ...itens[0], disponivel: false }, itens[1]] });
    expect(screen.getByRole("link", { name: "Explorar imóvel" })).toHaveAttribute("href", "/imoveis/b");
    fireEvent.error(screen.getByAltText("Conheça Candeias"));
    expect(screen.getByText("Novas histórias começam por uma conversa.")).toBeInTheDocument();
  });

  it("preserva os filtros ao selecionar uma cidade e submete a busca", async () => {
    const user = userEvent.setup();
    const { onBuscar, onFiltros } = montar({ filtros: { ...filtros, quartos: "2" } });
    await user.click(screen.getByRole("button", { name: "Recife", exact: true }));
    expect(onBuscar).toHaveBeenCalledWith({ ...filtros, quartos: "2", texto: "Recife" });
    await user.selectOptions(screen.getByLabelText("Etapa"), "Pronto");
    expect(onFiltros).toHaveBeenCalledWith({ ...filtros, quartos: "2", tag: "Pronto" });
    await user.click(screen.getByRole("button", { name: "Buscar", exact: true }));
    expect(onBuscar).toHaveBeenLastCalledWith();
  });
});
