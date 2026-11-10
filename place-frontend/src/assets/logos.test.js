import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Sem width/height no <svg>, a imagem não tem tamanho próprio e some (0x0) em
// containers que se ajustam ao conteúdo, como o topo do menu lateral do painel.
const LOGOS = { "logo.svg": [600, 258], "logo-pino.svg": [221, 258], "logo-texto-escuro.svg": [379, 258] };

describe("logos em SVG", () => {
  it.each(Object.entries(LOGOS))("%s declara largura e altura", (arquivo, [largura, altura]) => {
    const svg = readFileSync(resolve(process.cwd(), "src/assets", arquivo), "utf8");
    const abertura = svg.slice(0, svg.indexOf(">") + 1);
    expect(abertura).toContain(`width="${largura}"`);
    expect(abertura).toContain(`height="${altura}"`);
    expect(abertura).toContain(`viewBox="0 0 ${largura} ${altura}"`);
  });
});
