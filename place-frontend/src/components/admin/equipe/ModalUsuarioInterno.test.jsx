import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/services/admin/equipe", () => ({ criarUsuarioInterno: vi.fn().mockResolvedValue({ id: "novo" }) }));
import { criarUsuarioInterno } from "@/services/admin/equipe";
import { ModalUsuarioInterno } from "./modais";

const construtoras = [{ id: "c1", nome: "Construtora Exemplo" }];

describe("novo acesso de viabilizador", () => {
  it("só pede a construtora quando o cargo é viabilizador e manda o id junto", async () => {
    const u = userEvent.setup();
    render(<ModalUsuarioInterno diretorias={[]} construtoras={construtoras} onClose={() => {}} onSalvo={vi.fn()} />);
    expect(screen.queryByText("Construtora")).toBeNull();

    await u.selectOptions(screen.getByLabelText("Cargo"), "viabilizador");
    await u.selectOptions(await screen.findByLabelText("Construtora"), "c1");
    await u.click(screen.getByRole("button", { name: "Criar acesso" }));

    await waitFor(() => expect(criarUsuarioInterno).toHaveBeenCalledWith(expect.objectContaining({ cargo: "viabilizador", construtoraId: "c1", diretoriaId: undefined })));
  });

  it("não manda construtora para os outros cargos", async () => {
    criarUsuarioInterno.mockClear();
    const u = userEvent.setup();
    render(<ModalUsuarioInterno diretorias={[]} construtoras={construtoras} onClose={() => {}} onSalvo={vi.fn()} />);
    await u.click(screen.getByRole("button", { name: "Criar acesso" }));
    await waitFor(() => expect(criarUsuarioInterno).toHaveBeenCalledWith(expect.objectContaining({ cargo: "rh", construtoraId: undefined })));
  });
});
