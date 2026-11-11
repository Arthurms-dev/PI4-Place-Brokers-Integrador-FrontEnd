// SEO e prévia de link (Google, WhatsApp, Instagram, Facebook).
// Sem dependências do Vite: também é usado pelas funções da Vercel em /api.
import { precoDoEmpreendimento, prazoDoEmpreendimento } from "./precoCatalogo.js";

export const NOME_SITE = "Place Brokers";
export const DESCRICAO_PADRAO =
  "Place Brokers — lançamentos imobiliários em Recife e Região Metropolitana: Minha Casa Minha Vida, médio e alto padrão e litoral, com especialistas do primeiro contato às chaves.";
export const IMAGEM_PADRAO = "/icone-512.png";

/** Páginas públicas que entram no sitemap (as áreas internas ficam de fora). */
export const PAGINAS_PUBLICAS = ["/", "/prontos", "/sobre", "/contato", "/privacidade"];

const escapar = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const semBarraNoFim = (url = "") => String(url).replace(/\/+$/, "");

/** Título, descrição, imagem e endereço de um empreendimento (dados crus da API). */
export function metaDoEmpreendimento(emp, base) {
  const local = [emp.bairro && emp.bairro !== "A confirmar" ? emp.bairro : null, emp.cidade && emp.uf ? `${emp.cidade}/${emp.uf}` : emp.cidade]
    .filter(Boolean).join(", ");
  const preco = precoDoEmpreendimento(emp);
  const prazo = prazoDoEmpreendimento(emp);
  const partes = [
    local ? `${emp.nome} em ${local}.` : `${emp.nome}.`,
    preco.temValor ? `${preco.rotulo} ${preco.valor}${preco.sufixo}.` : null,
    prazo ? `${prazo}.` : null,
    "Fotos, localização e atendimento com especialista da Place Brokers.",
  ].filter(Boolean);
  return {
    titulo: `${emp.nome}${emp.cidade ? ` — ${emp.cidade}` : ""} | ${NOME_SITE}`,
    descricao: partes.join(" ").slice(0, 300),
    imagem: emp.capa_miniatura_url || emp.capa_url || `${semBarraNoFim(base)}${IMAGEM_PADRAO}`,
    url: `${semBarraNoFim(base)}/imoveis/${encodeURIComponent(emp.id)}`,
  };
}

export function metaPadrao(base, caminho = "/") {
  return {
    titulo: `${NOME_SITE} | Lançamentos imobiliários em Pernambuco`,
    descricao: DESCRICAO_PADRAO,
    imagem: `${semBarraNoFim(base)}${IMAGEM_PADRAO}`,
    url: `${semBarraNoFim(base)}${caminho}`,
  };
}

/**
 * Página mínima só com as tags de prévia, servida para os robôs do WhatsApp/Facebook/etc.
 * Quem abrir no navegador é levado na hora para a página de verdade.
 */
export function paginaDePrevia(meta) {
  const t = escapar(meta.titulo);
  const d = escapar(meta.descricao);
  const i = escapar(meta.imagem);
  const u = escapar(meta.url);
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${t}</title>
<meta name="description" content="${d}">
<link rel="canonical" href="${u}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${NOME_SITE}">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${i}">
<meta property="og:url" content="${u}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${i}">
<meta http-equiv="refresh" content="0; url=${u}">
</head>
<body><p><a href="${u}">${t}</a></p></body>
</html>`;
}

/** sitemap.xml com as páginas públicas e cada empreendimento publicado. */
export function sitemap(base, empreendimentos = []) {
  const b = semBarraNoFim(base);
  const url = (loc, lastmod, prioridade) => `  <url><loc>${escapar(loc)}</loc>${lastmod ? `<lastmod>${String(lastmod).slice(0, 10)}</lastmod>` : ""}<priority>${prioridade}</priority></url>`;
  const linhas = [
    ...PAGINAS_PUBLICAS.map((p) => url(`${b}${p}`, null, p === "/" ? "1.0" : "0.5")),
    ...empreendimentos
      .filter((e) => e && e.id && e.publicado !== false)
      .map((e) => url(`${b}/imoveis/${encodeURIComponent(e.id)}`, e.atualizado_em, "0.8")),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${linhas.join("\n")}\n</urlset>\n`;
}

export function robots(base) {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /corretor",
    "Disallow: /gerente",
    "Disallow: /viabilizador",
    "Disallow: /login",
    "Disallow: /register",
    "Disallow: /esqueci-senha",
    "Disallow: /redefinir-senha",
    "Disallow: /acesso-negado",
    "",
    `Sitemap: ${semBarraNoFim(base)}/sitemap.xml`,
    "",
  ].join("\n");
}

/** No navegador: atualiza título e tags da página aberta (o Google lê depois de rodar o JavaScript). */
export function aplicarMeta(meta, doc = typeof document !== "undefined" ? document : null) {
  if (!doc) return;
  doc.title = meta.titulo;
  const definir = (seletor, atributo, chave, valor) => {
    let el = doc.head.querySelector(seletor);
    if (!el) {
      el = doc.createElement(seletor.startsWith("link") ? "link" : "meta");
      if (seletor.startsWith("link")) el.setAttribute("rel", "canonical");
      else el.setAttribute(atributo, chave);
      doc.head.appendChild(el);
    }
    el.setAttribute(seletor.startsWith("link") ? "href" : "content", valor);
  };
  definir('meta[name="description"]', "name", "description", meta.descricao);
  definir('meta[property="og:title"]', "property", "og:title", meta.titulo);
  definir('meta[property="og:description"]', "property", "og:description", meta.descricao);
  definir('meta[property="og:image"]', "property", "og:image", meta.imagem);
  definir('meta[property="og:url"]', "property", "og:url", meta.url);
  definir('link[rel="canonical"]', "rel", "canonical", meta.url);
}
