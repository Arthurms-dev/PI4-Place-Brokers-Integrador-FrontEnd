import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import { useUsuarioAtual } from "@/hooks/useUsuarioAtual";

vi.mock("@/hooks/useUsuarioAtual", () => ({ useUsuarioAtual: vi.fn() }));
vi.mock("@/data/empreendimentosPublicos", () => ({ useEmpreendimentosPublicos: vi.fn() }));

const item = (id, destaque) => ({ id, title: `Empreendimento ${id}`, image: `/${id}.jpg`, destaque, bairro: "Boa Viagem", city: "Recife, PE" });

function abrir() {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<p>Formulário</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("foto do login", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useUsuarioAtual.mockReturnValue({ data: null });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });
  afterEach(() => vi.useRealTimers());

  it("passa entre os destaques e volta ao primeiro", () => {
    useEmpreendimentosPublicos.mockReturnValue({ itens: [item("a", true), item("b", true), item("c", true), item("d", false)] });
    abrir();
    expect(screen.getByText("Empreendimento a")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByText("Empreendimento b")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(14000));
    expect(screen.getByText("Empreendimento a")).toBeInTheDocument();
    // Só destaques entram quando há pelo menos 2.
    expect(screen.queryByText("Empreendimento d")).not.toBeInTheDocument();
  });

  it("completa com outro empreendimento quando só há um destaque", () => {
    useEmpreendimentosPublicos.mockReturnValue({ itens: [item("a", false), item("b", true)] });
    abrir();
    expect(screen.getByText("Empreendimento b")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByText("Empreendimento a")).toBeInTheDocument();
  });

  it("fica parada para quem pede menos movimento", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    useEmpreendimentosPublicos.mockReturnValue({ itens: [item("a", true), item("b", true)] });
    abrir();
    act(() => vi.advanceTimersByTime(21000));
    expect(screen.getByText("Empreendimento a")).toBeInTheDocument();
  });
});
