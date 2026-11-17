import { describe, expect, it } from "vitest";
import { AREAS, ROLE_HOME } from "./areas";
import { robots } from "./seo";

describe("divisão de cargos", () => {
  it.each(["rh", "recepcao", "diretor", "cadastro"])("%s tem tela inicial e menu próprio", (cargo) => {
    expect(ROLE_HOME[cargo]).toBe(`/${cargo}`);
    expect(AREAS[cargo].home).toBe(`/${cargo}`);
    expect(AREAS[cargo].items.every((i) => i.href.startsWith(`/${cargo}`))).toBe(true);
    expect(robots("https://placebrokers.com.br")).toContain(`Disallow: /${cargo}`);
  });

  it("recepção só tem a roleta e as configurações", () => {
    expect(AREAS.recepcao.items.map((i) => i.label)).toEqual(["Roleta do dia", "Configurações"]);
  });
});
