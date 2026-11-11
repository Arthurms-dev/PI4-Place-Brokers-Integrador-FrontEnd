import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as Sentry from "@sentry/react";
import ErroDeTela from "./ErroDeTela";

function Quebra() {
  throw new Error("tela quebrou");
}

describe("ErroDeTela", () => {
  it("aparece no lugar da tela em branco quando uma página quebra", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Sentry.ErrorBoundary fallback={<ErroDeTela />}>
        <Quebra />
      </Sentry.ErrorBoundary>,
    );
    silencio.mockRestore();

    expect(screen.getByRole("heading", { name: "Algo deu errado nesta tela" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recarregar a página" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao início" })).toHaveAttribute("href", "/");
  });
});
