import { describe, expect, it } from "vitest";
import { ehDominioOficial, metaDoEmpreendimento, paginaDePrevia, robots, sitemap } from "./seo";

const emp = { id: "6a1b0c2d-0000-4000-8000-000000000001", nome: "Vila Alta Vista", bairro: "Janga", cidade: "Paulista", uf: "PE", segmento: "mcmv", parcela_min: 499, status: "pronto", capa_url: "https://img/capa.webp", capa_miniatura_url: "https://img/mini.webp", atualizado_em: "2026-10-29T10:00:00Z" };

describe("SEO e prévia de link", () => {
  it("monta título, descrição, imagem (miniatura) e endereço do empreendimento", () => {
    const m = metaDoEmpreendimento(emp, "https://placebrokers.com/");
    expect(m.titulo).toBe("Vila Alta Vista — Paulista | Place Brokers");
    expect(m.descricao).toContain("Vila Alta Vista em Janga, Paulista/PE.");
    expect(m.descricao).toContain("Pronto para morar");
    expect(m.imagem).toBe("https://img/mini.webp");
    expect(m.url).toBe(`https://placebrokers.com/imoveis/${emp.id}`);
  });

  it("prévia escapa texto e redireciona para a página real", () => {
    const html = paginaDePrevia({ titulo: 'A "B" <C>', descricao: "d", imagem: "i", url: "https://x/imoveis/1" });
    expect(html).toContain('<meta property="og:title" content="A &quot;B&quot; &lt;C&gt;">');
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=https://x/imoveis/1">');
  });

  it("sitemap com páginas públicas e só empreendimentos publicados", () => {
    const xml = sitemap("https://x", [emp, { id: "rascunho", publicado: false }]);
    expect(xml).toContain("<loc>https://x/</loc>");
    expect(xml).toContain("<loc>https://x/privacidade</loc>");
    expect(xml).toContain(`<loc>https://x/imoveis/${emp.id}</loc><lastmod>2026-10-29</lastmod>`);
    expect(xml).not.toContain("rascunho");
  });

  it("robots do domínio oficial esconde as áreas internas e aponta o sitemap", () => {
    const txt = robots("https://placebrokers.com.br/");
    expect(txt).toContain("Disallow: /admin");
    expect(txt).toContain("Disallow: /corretor");
    expect(txt).toContain("Sitemap: https://placebrokers.com.br/sitemap.xml");
    expect(robots("https://www.placebrokers.com.br")).toContain("Sitemap: https://www.placebrokers.com.br/sitemap.xml");
  });

  it("robots fora do domínio oficial não entrega o sitemap", () => {
    for (const base of ["https://placebrokers-frontend.vercel.app", "https://x/", "endereço inválido"]) {
      const txt = robots(base);
      expect(txt).not.toContain("Sitemap:");
      expect(txt).toContain("noindex");
    }
  });

  it("só placebrokers.com.br conta como domínio oficial", () => {
    expect(ehDominioOficial("https://placebrokers.com.br")).toBe(true);
    expect(ehDominioOficial("https://WWW.placebrokers.com.br/imoveis/1")).toBe(true);
    expect(ehDominioOficial("https://placebrokers-frontend.vercel.app")).toBe(false);
    expect(ehDominioOficial("https://placebrokers.com.br.golpe.com")).toBe(false);
    expect(ehDominioOficial("")).toBe(false);
  });
});
