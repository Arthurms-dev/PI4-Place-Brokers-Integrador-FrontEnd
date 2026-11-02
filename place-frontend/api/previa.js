// Prévia do link de um empreendimento para WhatsApp, Instagram, Facebook, LinkedIn e Telegram.
// O vercel.json manda para cá só os robôs dessas redes; gente de verdade recebe o site normal.
import { metaDoEmpreendimento, metaPadrao, paginaDePrevia } from "../src/lib/seo.js";
import { baseDoSite, buscarJson } from "./_comum.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  const base = baseDoSite(req);
  const id = String(req.query.id ?? "");
  const emp = UUID.test(id) ? await buscarJson(`/empreendimentos/${id}`) : null;
  const meta = emp?.id ? metaDoEmpreendimento(emp, base) : metaPadrao(base, UUID.test(id) ? `/imoveis/${id}` : "/");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Achou: guarda 1 dia. Não achou (API dormindo): só 5 minutos, para tentar de novo logo.
  res.setHeader("Cache-Control", emp?.id ? "public, s-maxage=86400, stale-while-revalidate=604800" : "public, s-maxage=300");
  res.status(200).send(paginaDePrevia(meta));
}
