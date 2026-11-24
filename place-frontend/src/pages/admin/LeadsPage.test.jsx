import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LeadsPage from "./LeadsPage";
import { assignLead, convertLeadToCliente, getCorretores, getLeads } from "@/services/admin/leads";

vi.mock("@/services/admin/leads", () => ({
  getLeads: vi.fn(),
  getCorretores: vi.fn(),
  updateLeadStatus: vi.fn(),
  assignLead: vi.fn(),
  convertLeadToCliente: vi.fn(),
}));
// O histórico do lead busca na API por conta própria; não faz parte do que se testa aqui.
vi.mock("@/components/leads/LeadAtividades", () => ({ LeadAtividades: () => null }));

const lead = {
  id: "lead-1", nome: "Carla Souza", email: "carla@example.com", telefone: "81999998888",
  origem: "site", mensagem: null, status: "novo", criadoEm: "2026-11-16T22:41:55Z",
  empreendimento: null, corretor: null,
};
const corretores = [{ id: "c1", nome: "Bruno Lima" }, { id: "c2", nome: "Ana Reis" }];

async function abrirLead() {
  const usuario = userEvent.setup();
  render(<MemoryRouter><LeadsPage /></MemoryRouter>);
  // A lista aparece duas vezes (cartões no celular e tabela no PC); qualquer uma abre o lead.
  await usuario.click((await screen.findAllByRole("button", { name: "Ver detalhes de Carla Souza" }))[0]);
  return usuario;
}

beforeEach(() => {
  vi.clearAllMocks();
  getLeads.mockResolvedValue([lead]);
  getCorretores.mockResolvedValue(corretores);
});

describe("atribuição pelo seletor do admin", () => {
  it("mostra para quem o lead foi enviado depois que a API confirma", async () => {
    assignLead.mockResolvedValue({ ...lead, corretor: corretores[0] });
    const usuario = await abrirLead();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText(/Corretor responsável/), "c1");

    expect(await screen.findByRole("status")).toHaveTextContent("Lead enviado para Bruno Lima.");
    expect(assignLead).toHaveBeenCalledWith("lead-1", "c1");
  });

  it("não diz que enviou quando a API falha", async () => {
    assignLead.mockRejectedValue(new Error("fora do ar"));
    const usuario = await abrirLead();

    await usuario.selectOptions(screen.getByLabelText(/Corretor responsável/), "c2");

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar a alteração.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Corretor responsável/)).toHaveValue("");
  });
});

describe("repasse barrado por venda pendente", () => {
  it("mostra o motivo que a API deu e não troca o corretor", async () => {
    const msg = "Este cliente tem uma venda pendente com Bruno. Confirme ou recuse a venda antes de repassar o lead.";
    assignLead.mockRejectedValue(Object.assign(new Error(msg), { status: 409, code: "CONFLICT" }));
    const usuario = await abrirLead();

    await usuario.selectOptions(screen.getByLabelText(/Corretor responsável/), "c2");

    expect(await screen.findByRole("alert")).toHaveTextContent(msg);
    expect(screen.getByLabelText(/Corretor responsável/)).toHaveValue("");
  });
});

describe("converter em cliente pede confirmação", () => {
  it("o primeiro clique só pergunta; cancelar não converte", async () => {
    const usuario = await abrirLead();

    await usuario.click(screen.getByRole("button", { name: "Converter em cliente" }));
    expect(screen.getByRole("group", { name: "Confirmar conversão" })).toHaveTextContent("sai da aba Ativos do corretor");
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(convertLeadToCliente).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Converter em cliente" })).toBeInTheDocument();
  });

  it("converte depois de confirmar", async () => {
    convertLeadToCliente.mockResolvedValue({});
    const usuario = await abrirLead();

    await usuario.click(screen.getByRole("button", { name: "Converter em cliente" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar conversão" }));

    await waitFor(() => expect(convertLeadToCliente).toHaveBeenCalledWith("lead-1"));
    expect(screen.queryByRole("button", { name: "Converter em cliente" })).not.toBeInTheDocument();
  });
});
