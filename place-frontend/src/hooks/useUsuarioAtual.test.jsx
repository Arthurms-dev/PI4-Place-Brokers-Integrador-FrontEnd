import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AUTH_TOKEN_KEY, clearToken } from "@/lib/authToken";
import { useUsuarioAtual } from "./useUsuarioAtual";
import { getCurrentUser } from "@/services/session";

vi.mock("@/services/session", () => ({ getCurrentUser: vi.fn() }));

function Tela() {
  const { data, loading } = useUsuarioAtual();
  return <div>{loading ? "Carregando" : data ? data.name : "Entrar"}</div>;
}

describe("useUsuarioAtual", () => {
  beforeEach(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    vi.resetAllMocks();
  });

  it("mantem a area montada ao voltar para a aba com o mesmo token", async () => {
    const usuario = { name: "Gerente Teste", cargo: "gerente" };
    window.localStorage.setItem(AUTH_TOKEN_KEY, "token-gerente");
    vi.mocked(getCurrentUser).mockResolvedValueOnce(usuario);
    render(<Tela />);
    await screen.findByText("Gerente Teste");

    let finalizar;
    vi.mocked(getCurrentUser).mockImplementationOnce(() => new Promise((resolve) => { finalizar = resolve; }));
    act(() => { window.dispatchEvent(new Event("focus")); });

    expect(screen.getByText("Gerente Teste")).toBeInTheDocument();
    expect(screen.queryByText("Carregando")).not.toBeInTheDocument();
    await act(async () => { finalizar(usuario); });
    expect(screen.getByText("Gerente Teste")).toBeInTheDocument();
  });

  it("remove imediatamente o usuario antigo quando o token e removido", async () => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, "token-gerente");
    vi.mocked(getCurrentUser).mockResolvedValueOnce({ name: "Gerente Teste", cargo: "gerente" });
    render(<Tela />);
    await screen.findByText("Gerente Teste");

    act(() => { clearToken(); });
    await waitFor(() => expect(screen.getByText("Entrar")).toBeInTheDocument());
    expect(screen.queryByText("Gerente Teste")).not.toBeInTheDocument();
  });
});
