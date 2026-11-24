import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cidades, { agruparCidades, separarCidades } from "./Cidades";
import AcessoExclusivo from "./AcessoExclusivo";
import { colunasNoPc } from "./SegmentosVitrine";
import SiteFooter from "../SiteFooter";

const itensDe = (contagem) =>
  Object.entries(contagem).flatMap(([cidade, n]) => Array.from({ length: n }, (_, i) => ({ id: `${cidade}-${i}`, cidade, uf: "PE" })));

// Mesmas contagens do catálogo real em 24/11/2026: 12 cidades, 7 delas com 1 empreendimento.
const CATALOGO = {
  Recife: 23, Paulista: 13, "Jaboatão dos Guararapes": 7, "São Lourenço da Mata": 3, Caruaru: 2,
  Ipojuca: 1, Gravatá: 1, Igarassu: 1, Camaragibe: 1, Olinda: 1, Tamandaré: 1, "Abreu e Lima": 1,
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("Cidades da home", () => {
  it("ordena por quantidade e, no empate, em ordem alfabética", () => {
    const nomes = agruparCidades(itensDe(CATALOGO)).map((g) => g.cidade);
    expect(nomes.slice(0, 7)).toEqual(["Recife", "Paulista", "Jaboatão dos Guararapes", "São Lourenço da Mata", "Caruaru", "Abreu e Lima", "Camaragibe"]);
  });

  it("mostra as 6 maiores e junta o resto em Outras cidades", () => {
    const { destaque, outras } = separarCidades(agruparCidades(itensDe(CATALOGO)));
    expect(destaque).toHaveLength(6);
    expect(outras.map((g) => g.cidade)).toEqual(["Camaragibe", "Gravatá", "Igarassu", "Ipojuca", "Olinda", "Tamandaré"]);
  });

  it("não cria Outras cidades para sobrar uma cidade só", () => {
    const grupos = agruparCidades(itensDe({ A: 3, B: 2, C: 1, D: 1, E: 1, F: 1, G: 1 }));
    expect(separarCidades(grupos).outras).toEqual([]);
  });

  it("abre a lista das outras cidades e filtra pela escolhida", () => {
    const onEscolher = vi.fn();
    render(<Cidades itens={itensDe(CATALOGO)} ativa="" onEscolher={onEscolher} />);
    const botao = screen.getByRole("button", { name: /Outras cidades/ });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /Olinda/, hidden: true })).not.toBeVisible();

    fireEvent.click(botao);
    expect(botao).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: /Olinda/ }));
    expect(onEscolher).toHaveBeenCalledWith("Olinda");
  });

  it("deixa a lista aberta quando a cidade filtrada está entre as outras", () => {
    render(<Cidades itens={itensDe(CATALOGO)} ativa="Olinda" onEscolher={() => {}} />);
    expect(screen.getByRole("button", { name: /Olinda/ })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Área do comprador", () => {
  it("quem ainda não se cadastrou não vê a faixa curta", () => {
    render(<MemoryRouter><AcessoExclusivo opcoes={[]} /></MemoryRouter>);
    expect(screen.queryByRole("heading", { name: "Acesso liberado", level: 2 })).toBeNull();
  });

  it("quem já chegou cadastrado ganha a faixa curta (a seção inteira fica só no PC)", () => {
    window.localStorage.setItem("pb_acesso_exclusivo", "1");
    const { container } = render(<MemoryRouter><AcessoExclusivo opcoes={[]} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Acesso liberado", level: 2 })).toBeInTheDocument();
    expect(container.querySelector("#acesso-exclusivo")).toHaveClass("max-sm:hidden");
  });
});

describe("Perfis no PC", () => {
  it("dá uma coluna mais larga ao perfil de nome mais longo", () => {
    const segs = ["Minha Casa Minha Vida", "Médio padrão", "Alto padrão", "Litoral"].map((rotulo) => ({ rotulo }));
    expect(colunasNoPc(segs)).toBe("1.3fr 1fr 1fr 1fr");
  });
});

describe("Rodapé no celular", () => {
  it("abre e fecha os grupos de links com um toque", () => {
    render(<MemoryRouter><SiteFooter /></MemoryRouter>);
    const navegue = screen.getByRole("button", { name: "Navegue" });
    expect(navegue).toHaveAttribute("aria-expanded", "false");
    const grupo = document.getElementById(navegue.getAttribute("aria-controls"));
    expect(grupo).toHaveClass("max-sm:hidden");
    fireEvent.click(navegue);
    expect(navegue).toHaveAttribute("aria-expanded", "true");
    expect(grupo).not.toHaveClass("max-sm:hidden");
  });
});
