import { describe, expect, it } from "vitest";
import { NUMEROS_DA_PLACE, PERFIL_INSTAGRAM, VIDEOS_DO_INSTAGRAM, linkDoVideo } from "./provaSocial";

describe("prova social", () => {
  it("o link do vídeo é sempre do perfil da Place", () => {
    expect(linkDoVideo("DexRVXBBuDj")).toBe("https://www.instagram.com/placebrokers.imobiliaria/reel/DexRVXBBuDj/");
    for (const v of VIDEOS_DO_INSTAGRAM) expect(linkDoVideo(v.id).startsWith(PERFIL_INSTAGRAM.url)).toBe(true);
  });

  it("recusa código de vídeo estranho (evita link para outro site)", () => {
    expect(() => linkDoVideo("../../evil.com")).toThrow();
    expect(() => linkDoVideo("")).toThrow();
  });

  it("vídeos sem repetição e com legenda (vira o nome acessível do link)", () => {
    expect(new Set(VIDEOS_DO_INSTAGRAM.map((v) => v.id)).size).toBe(VIDEOS_DO_INSTAGRAM.length);
    for (const v of VIDEOS_DO_INSTAGRAM) expect(v.legenda.length > 5).toBe(true);
  });

  it("os números trazem o CRECI da imobiliária", () => {
    expect(NUMEROS_DA_PLACE.some((n) => n.valor === "CRECI 18303-J")).toBe(true);
  });
});
