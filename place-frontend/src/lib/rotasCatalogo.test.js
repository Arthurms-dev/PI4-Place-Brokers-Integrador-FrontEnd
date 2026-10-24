import { describe, expect, it } from "vitest";
import { rotaBaseCatalogo } from "./rotasCatalogo";

describe("rotas do catálogo por perfil", () => {
  it("mantém gerente em /gerente", () => {
    expect(rotaBaseCatalogo("/gerente/empreendimentos")).toBe("/gerente/empreendimentos");
    expect(rotaBaseCatalogo("/gerente/empreendimentos/123")).toBe("/gerente/empreendimentos");
    expect(rotaBaseCatalogo("/gerente/books")).toBe("/gerente/empreendimentos");
  });
  it("mantém corretor em /corretor", () => {
    expect(rotaBaseCatalogo("/corretor/empreendimentos")).toBe("/corretor/empreendimentos");
    expect(rotaBaseCatalogo("/corretor/empreendimentos/123")).toBe("/corretor/empreendimentos");
  });
});
