import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TrabalheConoscoPage from "./TrabalheConoscoPage";
import { enviarCandidatura, listarVagasAbertas } from "@/services/trabalheConosco";

vi.mock("@/services/trabalheConosco", async (original) => ({
  ...(await original()),
  listarVagasAbertas: vi.fn(),
  enviarCandidatura: vi.fn(),
}));

const vaga = { id: "11111111-1111-4111-8111-111111111111", titulo: "Corretor(a) — Paulista", area: "corretor", unidade: "Paulista", descricao: null };

function abrir() {
  render(<MemoryRouter><TrabalheConoscoPage /></MemoryRouter>);
  return userEvent.setup();
}

describe("Trabalhe conosco", () => {
  beforeEach(() => {
    listarVagasAbertas.mockReset().mockResolvedValue([]);
    enviarCandidatura.mockReset().mockResolvedValue({ recebido: true });
  });

  it("sem vaga aberta, oferece o banco de talentos", async () => {
    abrir();
    expect(await screen.findByText(/Nenhuma vaga específica no momento/)).toBeInTheDocument();
    expect(screen.getByLabelText("Vaga")).toHaveValue("");
  });

  it("não envia sem área, contato válido e aceite", async () => {
    const u = abrir();
    await u.click(screen.getByRole("button", { name: "Enviar candidatura" }));
    expect(screen.getByText("Escolha a área de interesse.")).toBeInTheDocument();
    expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("Para continuar, autorize o uso dos seus dados.")).toBeInTheDocument();
    expect(enviarCandidatura).not.toHaveBeenCalled();
  });

  it("candidatura numa vaga usa a área e a unidade da vaga e pede CRECI de corretor", async () => {
    listarVagasAbertas.mockResolvedValue([vaga]);
    const u = abrir();
    await u.click(await screen.findByRole("button", { name: "Candidatar-se" }));
    expect(screen.getByLabelText("Área de interesse")).toBeDisabled();
    await u.type(screen.getByLabelText("Nome completo"), "Ana Souza");
    await u.type(screen.getByLabelText("WhatsApp (com DDD)"), "81996298692");
    await u.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
    await u.type(screen.getByLabelText("CRECI (se já tiver)"), "12345-F");
    await u.click(screen.getByRole("checkbox"));
    await u.click(screen.getByRole("button", { name: "Enviar candidatura" }));

    expect(enviarCandidatura).toHaveBeenCalledWith(expect.objectContaining({
      vagaId: vaga.id, area: "corretor", unidade: "Paulista", telefone: "81996298692", creci: "12345-F", aceite: true,
    }), null);
    expect(await screen.findByText("Candidatura recebida")).toBeInTheDocument();
  });

  it("mostra vínculo, quantidade, prazo e requisitos, com o prazo mais próximo primeiro", async () => {
    const hoje = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const emDias = (n) => new Date(hoje.getTime() + n * 86400000).toISOString().slice(0, 10);
    listarVagasAbertas.mockResolvedValue([
      { ...vaga, id: "a", titulo: "Sem prazo", prazo: null },
      { ...vaga, id: "b", titulo: "Longe", prazo: emDias(30), vinculo: "clt", quantidade: 3, requisitos: "CRECI ativo\nCarro próprio\nSábados\nInglês" },
      { ...vaga, id: "c", titulo: "Perto", prazo: emDias(3), vinculo: "autonomo", quantidade: 1 },
    ]);
    const u = abrir();

    await screen.findByRole("button", { name: "Ver todos (4)" });
    const opcoes = [...screen.getByLabelText("Vaga").querySelectorAll("option")].map((o) => o.textContent);
    expect(opcoes).toEqual(["Banco de talentos", "Perto", "Longe", "Sem prazo"]);
    expect(screen.getByText("Autônomo")).toBeInTheDocument();
    expect(screen.getByText("1 vaga")).toBeInTheDocument();
    expect(screen.getByText(/^Últimos dias · até/)).toBeInTheDocument();
    expect(screen.getByText("CLT")).toBeInTheDocument();
    expect(screen.getByText("3 vagas")).toBeInTheDocument();
    expect(screen.getByText("CRECI ativo")).toBeInTheDocument();
    expect(screen.queryByText("Inglês")).not.toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: "Ver todos (4)" }));
    expect(screen.getByText("Inglês")).toBeInTheDocument();
  });

  it("recusa currículo que não é PDF", async () => {
    const u = userEvent.setup({ applyAccept: false });
    render(<MemoryRouter><TrabalheConoscoPage /></MemoryRouter>);
    const doc = new File(["x"], "cv.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    await u.upload(screen.getByLabelText(/Currículo em PDF/), doc);
    expect(screen.getByText("Envie o currículo em PDF de até 5 MB.")).toBeInTheDocument();
  });
});
