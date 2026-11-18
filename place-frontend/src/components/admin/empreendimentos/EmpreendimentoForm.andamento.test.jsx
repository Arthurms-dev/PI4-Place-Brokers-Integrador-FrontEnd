import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/empreendimentos", () => ({
  atualizarEmpreendimento: vi.fn(async (id, dados) => ({ id, ...dados })),
  criarEmpreendimento: vi.fn(),
}));
vi.mock("./TipologiasForm", () => ({ default: () => null }));
vi.mock("./DocumentosComerciaisForm", () => ({ default: () => null }));
vi.mock("./ImagensEmpreendimentoForm", () => ({ default: () => null }));

import EmpreendimentoForm from "./EmpreendimentoForm";
import { atualizarEmpreendimento } from "@/services/empreendimentos";

const EMP = { id: "e1", nome: "Belém Boulevard", status: "obras", uf: "PE", cidade: "Recife", bairro: "Campo Grande", lazer: [], tipologias: [], andamento_obra: [], andamento_referencia: null };

describe("EmpreendimentoForm — andamento da obra", () => {
  it("salva os módulos com percentual e o mês da medição", async () => {
    const onSalvo = vi.fn();
    render(<EmpreendimentoForm empreendimento={EMP} construtoras={[]} onClose={() => {}} onSalvo={onSalvo} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+ Módulo / torre" }));
    await user.type(screen.getByLabelText("Percentual do módulo 1"), "86,29");
    await user.click(screen.getByRole("button", { name: /Salvar/ }));
    expect(await screen.findByText("Informe o mês da medição.")).toBeInTheDocument();
    expect(atualizarEmpreendimento).not.toHaveBeenCalled();

    const mes = screen.getByLabelText(/^Mês da medição/);
    await user.clear(mes);
    await user.type(mes, "2026-08");
    await user.click(screen.getByRole("button", { name: /Salvar/ }));
    await waitFor(() => expect(atualizarEmpreendimento).toHaveBeenCalled());
    expect(atualizarEmpreendimento.mock.calls[0][1]).toMatchObject({
      andamentoObra: [{ modulo: "Módulo 01", percentual: 86.29 }],
      andamentoReferencia: "2026-08-01",
      andamentoFonteUrl: null,
    });
  });

  it("sem andamento, não manda os campos novos (não quebra antes da migration)", async () => {
    atualizarEmpreendimento.mockClear();
    render(<EmpreendimentoForm empreendimento={{ ...EMP, andamento_obra: undefined }} construtoras={[]} onClose={() => {}} onSalvo={() => {}} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /Salvar/ }));
    await waitFor(() => expect(atualizarEmpreendimento).toHaveBeenCalled());
    expect(atualizarEmpreendimento.mock.calls[0][1]).not.toHaveProperty("andamentoObra");
  });

  it("fato da região sem link da fonte não salva; com link salva", async () => {
    atualizarEmpreendimento.mockClear();
    render(<EmpreendimentoForm empreendimento={{ ...EMP, andamento_obra: undefined }} construtoras={[]} onClose={() => {}} onSalvo={() => {}} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+ Fato com fonte" }));
    await user.type(screen.getByLabelText("Fato 1"), "Porto de Galinhas recebeu mais turistas em 2025.");
    await user.type(screen.getByLabelText("Fonte do fato 1"), "Governo de PE");
    await user.type(screen.getByLabelText("Mês do fato 1"), "2026-02");
    await user.click(screen.getByRole("button", { name: /Salvar/ }));
    expect(await screen.findByText("Cole o link https da fonte.")).toBeInTheDocument();
    expect(atualizarEmpreendimento).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Link do fato 1"), "https://www.pe.gov.br/noticia");
    await user.click(screen.getByRole("button", { name: /Salvar/ }));
    await waitFor(() => expect(atualizarEmpreendimento).toHaveBeenCalled());
    expect(atualizarEmpreendimento.mock.calls[0][1].fatosMercado).toEqual([
      { texto: "Porto de Galinhas recebeu mais turistas em 2025.", fonte: "Governo de PE", url: "https://www.pe.gov.br/noticia", mes: "2026-02" },
    ]);
  });
});
