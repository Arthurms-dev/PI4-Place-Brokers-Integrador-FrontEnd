import { describe, expect, it } from "vitest";
import { agrupar } from "./MarcadoresAgrupados";

const p = (id, x, y) => ({ id, x, y });
const paraTela = (pt) => ({ x: pt.x, y: pt.y });

describe("agrupar pinos", () => {
  it("junta os pinos que ficariam sobrepostos e separa os distantes", () => {
    const grupos = agrupar([p("a", 0, 0), p("b", 20, 10), p("c", 300, 300)], paraTela, 11);
    expect(grupos.map((g) => g.map((x) => x.id))).toEqual([["a", "b"], ["c"]]);
  });

  it("de perto (zoom 16+) cada pino fica sozinho", () => {
    const grupos = agrupar([p("a", 0, 0), p("b", 1, 1)], paraTela, 16);
    expect(grupos).toHaveLength(2);
  });
});
