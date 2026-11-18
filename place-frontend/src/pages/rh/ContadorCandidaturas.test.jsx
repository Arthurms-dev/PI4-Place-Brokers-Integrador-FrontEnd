import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AreaLayout from "@/pages/AreaLayout";
import { useUsuarioAtual } from "@/hooks/useUsuarioAtual";
import { CANDIDATURAS_MUDARAM, contarCandidaturasNovas } from "@/services/trabalheConosco";

vi.mock("@/hooks/useUsuarioAtual", () => ({ useUsuarioAtual: vi.fn() }));
vi.mock("@/services/trabalheConosco", () => ({ CANDIDATURAS_MUDARAM: "teste:candidaturas", contarCandidaturasNovas: vi.fn() }));
vi.mock("@/components/admin/layout/Topbar", () => ({ Topbar: () => null }));
vi.mock("@/components/admin/layout/Footer", () => ({ Footer: () => null }));

function abrir(cargo = "rh") {
  useUsuarioAtual.mockReturnValue({ data: { name: "Jessica", cargo, role: "RH" }, loading: false, error: null });
  render(
    <MemoryRouter initialEntries={["/rh/vagas"]}>
      <Routes>
        <Route path="/rh" element={<AreaLayout cargo="rh" />}>
          <Route path="vagas" element={<p>Vagas</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

const itemCandidaturas = () => screen.getByRole("link", { name: /Candidaturas/ });

describe("número de candidaturas novas no menu do RH", () => {
  beforeEach(() => {
    contarCandidaturasNovas.mockReset();
  });

  it("mostra quantas candidaturas novas existem", async () => {
    contarCandidaturasNovas.mockResolvedValue(4);
    abrir();
    expect(await screen.findByLabelText("4 novas")).toBeInTheDocument();
    expect(itemCandidaturas()).toHaveTextContent("4");
  });

  it("some quando não há nenhuma nova", async () => {
    contarCandidaturasNovas.mockResolvedValue(0);
    abrir();
    await waitFor(() => expect(contarCandidaturasNovas).toHaveBeenCalled());
    expect(screen.queryByLabelText(/novas?$/)).toBeNull();
  });

  it("reconta quando o RH muda uma candidatura", async () => {
    contarCandidaturasNovas.mockResolvedValueOnce(2).mockResolvedValueOnce(1);
    abrir();
    expect(await screen.findByLabelText("2 novas")).toBeInTheDocument();
    window.dispatchEvent(new Event(CANDIDATURAS_MUDARAM));
    expect(await screen.findByLabelText("1 nova")).toBeInTheDocument();
  });
});
