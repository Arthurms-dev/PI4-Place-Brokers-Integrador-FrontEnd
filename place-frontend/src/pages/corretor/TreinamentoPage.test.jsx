import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TreinamentoPage from "./TreinamentoPage";

describe("TreinamentoPage", () => {
  it("abre nas objeções e troca para a aba de vídeos", async () => {
    render(<TreinamentoPage />);
    expect(screen.getByRole("heading", { name: "Quebra de objeções" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Vídeos" }));

    expect(screen.getByRole("heading", { name: "Vídeos da Place" })).toBeInTheDocument();
    expect(screen.getByText("Os vídeos de treinamento da Place vão aparecer aqui")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Vídeos" })).toHaveAttribute("aria-selected", "true");
  });
});
