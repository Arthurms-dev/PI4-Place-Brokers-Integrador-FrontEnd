import { describe, expect, it } from "vitest";
import { normalizarApi } from "./empreendimentosPublicos";
import { obterMidiasPublicasVerificadas } from "./midiasPublicasVerificadas";

const base = { id: "brisa", nome: "Brisa do Mar", cidade: "Jaboatão dos Guararapes", uf: "PE", status: "lancamento", publicado: true };
describe("mídias públicas verificadas", () => {
  it("vincula apenas o empreendimento conferido no book", () => {
    expect(obterMidiasPublicasVerificadas(" BRISA DO MAR ")).toHaveLength(5);
    expect(obterMidiasPublicasVerificadas("Brisa do Mar II")).toEqual([]);
    expect(obterMidiasPublicasVerificadas("Outro imóvel")).toEqual([]);
  });
  it("apresenta acervo ilustrado sem criar preço ou publicar plantas", () => {
    const item = normalizarApi(base);
    expect(item.precoMin).toBeNull();
    expect(item.preco).toBe("Sob consulta");
    expect(item.galeria).toHaveLength(5);
    expect(item.galeria.every((foto) => foto.alt.includes("perspectiva ilustrada"))).toBe(true);
    expect(item.galeria.some((foto) => /planta|book|tabela/i.test(foto.alt))).toBe(false);
  });
  it("prioriza capa, ordem e legendas cadastradas, sem misturar o acervo alternativo", () => {
    const item = normalizarApi({ ...base, capa_url: "/nova-capa.jpg", imagens: [
      { url: "/nova-foto-2.jpg", alt: "Piscina atualizada", ordem: 2 },
      { url: "/nova-foto-1.jpg", alt: "Fachada atualizada", ordem: 1 },
      { url: "/arquivo-opaco.jpg", alt: "Planta tipo", ordem: 0 },
    ] });
    expect(item.image).toBe("/nova-capa.jpg");
    expect(item.galeria).toEqual([
      { src: "/nova-foto-1.jpg", alt: "Fachada atualizada" },
      { src: "/nova-foto-2.jpg", alt: "Piscina atualizada" },
    ]);
  });

  it.each([
    ['Engenho Paulista', 6], ['Carneiros Park', 5], ['Porto Carolina', 6],
  ])('preenche a galeria de %s com o acervo correspondente', (nome, quantidade) => {
    const item = normalizarApi({ ...base, nome });
    expect(item.galeria).toHaveLength(quantidade);
    expect(item.galeria.every((foto) => foto.alt.startsWith(`${nome} — perspectiva ilustrada`))).toBe(true);
    expect(item.galeria.every((foto) => foto.src.endsWith('.webp'))).toBe(true);
    expect(item.galeria.some((foto) => /\b(?:plantas?|books?|tabelas?|evolução)\b/i.test(foto.alt))).toBe(false);
    expect(item.precoMin).toBeNull();
    expect(obterMidiasPublicasVerificadas(`${nome} II`)).toEqual([]);
  });

  it('não substitui imagens do ADM pelos novos acervos', () => {
    const item = normalizarApi({ ...base, nome: 'Porto Carolina', capa_url: '/capa-adm.jpg',
      imagens: [{ url: '/galeria-adm.jpg', alt: 'Foto conferida pelo ADM' }] });
    expect(item.image).toBe('/capa-adm.jpg');
    expect(item.galeria).toEqual([{ src: '/galeria-adm.jpg', alt: 'Foto conferida pelo ADM' }]);
  });
});
