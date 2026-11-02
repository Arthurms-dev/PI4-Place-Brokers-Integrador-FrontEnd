import { sitemap } from "../src/lib/seo.js";
import { baseDoSite, buscarJson } from "./_comum.js";

export default async function handler(req, res) {
  const lista = await buscarJson("/empreendimentos", 50000);
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", Array.isArray(lista) ? "public, s-maxage=21600, stale-while-revalidate=86400" : "public, s-maxage=300");
  res.status(200).send(sitemap(baseDoSite(req), Array.isArray(lista) ? lista : []));
}
