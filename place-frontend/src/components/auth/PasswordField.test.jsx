import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordField from "./PasswordField";

describe("PasswordField", () => {
  it("mantem a senha oculta ate o usuario clicar e alterna sem submeter formulario", async () => {
    const user = userEvent.setup();
    render(
      <form onSubmit={(ev) => ev.preventDefault()}>
        <PasswordField aria-label="Senha" value="segredo123" onChange={() => {}} />
      </form>
    );
    const campo = screen.getByLabelText("Senha");
    expect(campo.type).toBe("password");
    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(campo.type).toBe("text");
    await user.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(campo.type).toBe("password");
  });
});
