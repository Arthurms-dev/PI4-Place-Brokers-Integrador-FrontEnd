import { describe, expect, it } from "vitest";
import { NUMEROS_DA_PLACE, PERFIL_INSTAGRAM, PREMIACOES, SONHOS_REALIZADOS, VIDEOS_DO_INSTAGRAM, linkDoVideo } from "./provaSocial";

describe("prova social", () => {
  it("o link do vídeo ou post é sempre do perfil da Place", () => {
    expect(linkDoVideo("DexRVXBBuDj")).toBe("https://www.instagram.com/placebrokers.imobiliaria/reel/DexRVXBBuDj/");
    expect(linkDoVideo("DJWziNouGLH", "p")).toBe("https://www.instagram.com/placebrokers.imobiliaria/p/DJWziNouGLH/");
    for (const v of VIDEOS_DO_INSTAGRAM) expect(linkDoVideo(v.id).startsWith(PERFIL_INSTAGRAM.url)).toBe(true);
  });

  it("recusa código de post estranho (evita link para outro site)", () => {
    expect(() => linkDoVideo("../../evil.com")).toThrow();
    expect(() => linkDoVideo("")).toThrow();
  });

  it("listas sem repetição e com texto (vira o nome acessível)", () => {
    for (const lista of [VIDEOS_DO_INSTAGRAM, PREMIACOES, SONHOS_REALIZADOS]) {
      expect(new Set(lista.map((x) => x.id)).size).toBe(lista.length);
    }
    for (const v of VIDEOS_DO_INSTAGRAM) expect(v.legenda.length > 5).toBe(true);
    for (const p of PREMIACOES) expect(Boolean(p.construtora && p.titulo && p.quando)).toBe(true);
  });

  it("imagens de prêmios e clientes seguem o padrão de nome dos arquivos", () => {
    for (const p of PREMIACOES) expect(p.imagem).toMatch(/^premio-[a-z0-9-]+$/);
    for (const s of SONHOS_REALIZADOS) expect(s.imagem).toMatch(/^cliente-[a-z0-9-]+$/);
  });

  it("os números trazem o CRECI da imobiliária", () => {
    expect(NUMEROS_DA_PLACE.some((n) => n.valor === "CRECI 18303-J")).toBe(true);
  });
});
