import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CorretoresTab from "./CorretoresTab";

const corretor = {
  id: "usuario-test", nome: "Pessoa Exemplo", email: "pessoa@example.com",
  cargo: "corretor", vinculo: "interno", status: "recusado", ativo: true,
};

describe("reavaliacao administrativa de cadastro recusado", () => {
  it("volta o cadastro recusado para pendente, sem criar nova conta", async () => {
    const usuario = userEvent.setup();
    const onMudar = vi.fn().mockResolvedValue({ ...corretor, status: "pendente" });
    render(<CorretoresTab modo="todos" corretores={[corretor]} times={[]} onMudar={onMudar} />);
    await usuario.click(screen.getByRole("button", { name: "Reabrir análise" }));
    await waitFor(() => expect(onMudar).toHaveBeenCalledWith("usuario-test", { status: "pendente" }));
  });

  it("nao oferece reabertura para perfis aprovados", () => {
    render(<CorretoresTab modo="todos" corretores={[{ ...corretor, status: "aprovado" }]} times={[]} onMudar={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Reabrir análise" })).not.toBeInTheDocument();
  });
});
