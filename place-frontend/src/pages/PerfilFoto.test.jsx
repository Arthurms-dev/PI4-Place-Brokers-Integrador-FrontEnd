import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import PerfilPage from "./PerfilPage";
import { removerFotoPerfil, trocarFotoPerfil } from "@/services/session";

vi.mock("@/services/session", async (original) => ({
  ...(await original()),
  trocarFotoPerfil: vi.fn(),
  removerFotoPerfil: vi.fn(),
}));

function abrir(user) {
  render(
    <MemoryRouter>
      <Routes>
        <Route element={<Outlet context={{ user }} />}>
          <Route path="/" element={<PerfilPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup({ applyAccept: false });
}

const seletor = () => document.querySelector('input[type="file"]');

describe("foto de perfil", () => {
  beforeEach(() => {
    trocarFotoPerfil.mockReset().mockResolvedValue("https://cdn/avatares/u1/nova.webp");
    removerFotoPerfil.mockReset().mockResolvedValue();
  });

  it("sem foto mostra as iniciais e troca pela foto enviada", async () => {
    const u = abrir({ name: "Jessica Cavalcanti", email: "j@p.com", role: "RH", avatarUrl: null });
    expect(screen.getByText("JC")).toBeInTheDocument();
    const foto = new File(["x"], "eu.jpg", { type: "image/jpeg" });
    await u.upload(seletor(), foto);
    expect(trocarFotoPerfil).toHaveBeenCalledWith(foto);
    expect(await screen.findByRole("button", { name: "Remover" })).toBeInTheDocument();
    expect(document.querySelector('img[src="https://cdn/avatares/u1/nova.webp"]')).not.toBeNull();
  });

  it("recusa arquivo que não é foto ou passa de 5 MB, sem enviar", async () => {
    const u = abrir({ name: "Ana", email: "a@p.com", role: "RH", avatarUrl: null });
    await u.upload(seletor(), new File(["x"], "cv.pdf", { type: "application/pdf" }));
    expect(screen.getByText("Use uma foto JPG, PNG ou WebP.")).toBeInTheDocument();
    const grande = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "g.png", { type: "image/png" });
    await u.upload(seletor(), grande);
    expect(screen.getByText("A foto passa de 5 MB.")).toBeInTheDocument();
    expect(trocarFotoPerfil).not.toHaveBeenCalled();
  });

  it("remove a foto e volta às iniciais", async () => {
    const u = abrir({ name: "Ana Souza", email: "a@p.com", role: "RH", avatarUrl: "https://cdn/a.webp" });
    await u.click(screen.getByRole("button", { name: "Remover" }));
    expect(removerFotoPerfil).toHaveBeenCalled();
    expect(await screen.findByText("AS")).toBeInTheDocument();
  });
});
