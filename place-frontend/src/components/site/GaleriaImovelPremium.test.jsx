import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import GaleriaImovelPremium from "./GaleriaImovelPremium";

const fotos = Array.from({ length: 7 }, (_, i) => ({ src: `/foto-${i}.jpg`, alt: `Ambiente ${i + 1}` }));
afterEach(() => { cleanup(); document.body.style.overflow = ""; });

describe("galeria do empreendimento", () => {
  it("mostra até cinco fotos no mosaico e abre a foto escolhida", async () => {
    const user = userEvent.setup();
    render(<GaleriaImovelPremium imagens={fotos} titulo="Araçá" />);
    expect(screen.getAllByRole("button", { name: /^Ampliar foto \d/ })).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Ampliar foto 3 de Araçá" }));
    const dialog = screen.getByRole("dialog", { name: "Galeria de Araçá" });
    expect(within(dialog).getByText("Foto 3 de 7")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Ver foto 3" })).toHaveAttribute("aria-current", "true");
  });

  it("navega por teclado e fecha apenas a galeria ao pressionar Escape", async () => {
    const user = userEvent.setup();
    const externo = vi.fn();
    document.addEventListener("keydown", externo);
    render(<GaleriaImovelPremium imagens={fotos} />);
    await user.click(screen.getByRole("button", { name: "Ver todas as fotos" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Foto 2 de 7")).toBeInTheDocument();
    externo.mockClear();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(externo).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Ver todas as fotos" })).toHaveFocus();
    document.removeEventListener("keydown", externo);
  });

  it("contém o foco e restaura o bloqueio de rolagem do modal de origem", async () => {
    const user = userEvent.setup();
    document.body.style.overflow = "hidden";
    render(<GaleriaImovelPremium imagens={fotos} />);
    await user.click(screen.getByRole("button", { name: "Ver todas as fotos" }));
    expect(screen.getByRole("button", { name: "Fechar galeria" })).toHaveFocus();
    screen.getByRole("button", { name: "Ampliar", exact: true }).focus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Ver foto 7" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Ampliar", exact: true })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Fechar galeria" }));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("permite deslizar no celular sem interpretar rolagem vertical como troca", async () => {
    const user = userEvent.setup();
    render(<GaleriaImovelPremium imagens={fotos} />);
    await user.click(screen.getByRole("button", { name: "Ver todas as fotos" }));
    const imagem = screen.getByRole("dialog").querySelector(".pb-gallery-viewer-photo");
    fireEvent.touchStart(imagem, { touches: [{ clientX: 250, clientY: 200 }] });
    fireEvent.touchEnd(imagem, { changedTouches: [{ clientX: 100, clientY: 210 }] });
    expect(screen.getByText("Foto 2 de 7")).toBeInTheDocument();
    fireEvent.touchStart(imagem, { touches: [{ clientX: 250, clientY: 200 }] });
    fireEvent.touchEnd(imagem, { changedTouches: [{ clientX: 190, clientY: 400 }] });
    expect(screen.getByText("Foto 2 de 7")).toBeInTheDocument();
  });

  it("respeita os limites de navegação e reduz o zoom ao trocar a foto", async () => {
    const user = userEvent.setup();
    render(<GaleriaImovelPremium imagens={fotos.slice(0, 2)} />);
    await user.click(screen.getByRole("button", { name: "Ver todas as fotos" }));
    expect(screen.getByRole("button", { name: "Foto anterior" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Ampliar", exact: true }));
    expect(screen.getByRole("button", { name: "Reduzir" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Próxima foto" }));
    expect(screen.getByRole("button", { name: "Próxima foto" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ampliar", exact: true })).toHaveAttribute("aria-pressed", "false");
  });

  it("trata galeria vazia, foto única e falha de imagem", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<GaleriaImovelPremium imagens={[]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<GaleriaImovelPremium imagens={fotos.slice(0, 1)} />);
    fireEvent.error(screen.getByAltText("Ambiente 1"));
    expect(screen.getByRole("img", { name: /imagem indisponível/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ampliar foto", exact: true }));
    expect(screen.getByRole("button", { name: "Foto anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima foto" })).toBeDisabled();
  });
});
