import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField, fieldInputClass } from "./FormField";

describe("FormField", () => {
  it("liga a dica ao campo enquanto não há erro", () => {
    render(<FormField label="Senha" hint="Mínimo de 8 caracteres."><input /></FormField>);
    const campo = screen.getByRole("textbox", { name: /Senha/ });
    expect(campo).not.toHaveAttribute("aria-invalid");
    expect(document.getElementById(campo.getAttribute("aria-describedby"))).toHaveTextContent("Mínimo de 8 caracteres.");
  });

  it("marca o campo com erro e troca a dica pela mensagem", () => {
    render(<FormField label="E-mail" hint="Dica" error="E-mail inválido."><input /></FormField>);
    const campo = screen.getByRole("textbox", { name: /E-mail/ });
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(document.getElementById(campo.getAttribute("aria-describedby"))).toHaveTextContent("E-mail inválido.");
    expect(screen.queryByText("Dica")).toBeNull();
  });

  it("usa 16 px no celular para o iPhone não dar zoom", () => {
    expect(fieldInputClass()).toContain("text-base");
    expect(fieldInputClass()).toContain("sm:text-sm");
    expect(fieldInputClass()).toContain("h-11");
  });
});
