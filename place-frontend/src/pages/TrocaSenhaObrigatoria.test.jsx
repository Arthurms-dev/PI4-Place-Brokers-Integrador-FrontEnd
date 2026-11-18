import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AreaLayout from "./AreaLayout";
import { useUsuarioAtual } from "@/hooks/useUsuarioAtual";
import { alterarSenha } from "@/services/session";
import { AUTH_CHANGE_EVENT } from "@/lib/authToken";

vi.mock("@/hooks/useUsuarioAtual", () => ({ useUsuarioAtual: vi.fn() }));
vi.mock("@/services/session", async (original) => ({ ...(await original()), alterarSenha: vi.fn() }));
vi.mock("@/services/trabalheConosco", () => ({ CANDIDATURAS_MUDARAM: "x", contarCandidaturasNovas: vi.fn().mockResolvedValue(0) }));
vi.mock("@/components/admin/layout/AdminShell", () => ({ AdminShell: ({ children }) => <div data-testid="painel">{children}</div> }));

function abrir(user) {
  useUsuarioAtual.mockReturnValue({ data: user, loading: false, error: null });
  render(
    <MemoryRouter initialEntries={["/rh"]}>
      <Routes>
        <Route path="/rh" element={<AreaLayout cargo="rh" />}>
          <Route index element={<p>Candidaturas</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

const jessica = { name: "Jessica Cavalcanti", email: "j@p.com", role: "RH", cargo: "rh" };

describe("troca obrigatória da senha temporária", () => {
  beforeEach(() => {
    alterarSenha.mockReset();
  });

  it("com senha temporária mostra só a troca de senha, sem o painel", () => {
    abrir({ ...jessica, trocarSenha: true });
    expect(screen.getByRole("heading", { name: /Bem-vindo\(a\), Jessica/ })).toBeInTheDocument();
    expect(screen.queryByTestId("painel")).toBeNull();
    expect(screen.queryByText("Candidaturas")).toBeNull();
  });

  it("depois de trocar, pede o usuário de novo para abrir o painel", async () => {
    alterarSenha.mockResolvedValue(true);
    const aviso = vi.fn();
    window.addEventListener(AUTH_CHANGE_EVENT, aviso);
    const u = abrir({ ...jessica, trocarSenha: true });
    const campos = document.querySelectorAll('input[type="password"]');
    await u.type(campos[0], "temporaria1");
    await u.type(campos[1], "minhaSenha2026");
    await u.type(campos[2], "minhaSenha2026");
    await u.click(screen.getByRole("button", { name: "Salvar e continuar" }));
    expect(alterarSenha).toHaveBeenCalledWith({ senhaAtual: "temporaria1", novaSenha: "minhaSenha2026", confirmarSenha: "minhaSenha2026" });
    expect(aviso).toHaveBeenCalled();
    window.removeEventListener(AUTH_CHANGE_EVENT, aviso);
  });

  it("mostra o erro do campo vindo da API", async () => {
    alterarSenha.mockRejectedValue(Object.assign(new Error("Verifique os campos destacados."), { fieldErrors: { senhaAtual: "Senha atual incorreta." } }));
    const u = abrir({ ...jessica, trocarSenha: true });
    const campos = document.querySelectorAll('input[type="password"]');
    await u.type(campos[0], "errada");
    await u.click(screen.getByRole("button", { name: "Salvar e continuar" }));
    expect(await screen.findByText("Senha atual incorreta.")).toBeInTheDocument();
  });

  it("quem já trocou vê o painel normal", () => {
    abrir({ ...jessica, trocarSenha: false });
    expect(screen.getByTestId("painel")).toBeInTheDocument();
    expect(screen.getByText("Candidaturas")).toBeInTheDocument();
  });
});
