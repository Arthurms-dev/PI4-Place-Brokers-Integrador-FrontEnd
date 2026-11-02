// Funções da Vercel (pasta /api). Arquivos que começam com "_" não viram rota.
// A API do Render pode estar "dormindo" no plano gratuito; por isso o tempo limite
// e o cache longo: depois da primeira resposta, a Vercel serve do cache.

export const API_URL = (process.env.VITE_API_URL || process.env.API_URL || "https://placebrokers-api.onrender.com").replace(/\/+$/, "");

/** Endereço do site a partir do pedido (funciona no domínio da Vercel e no domínio final). */
export function baseDoSite(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host || "placebrokers-frontend.vercel.app";
  const protocolo = req.headers["x-forwarded-proto"] || "https";
  return `${protocolo}://${host}`;
}

export async function buscarJson(caminho, tempoLimiteMs = 8000) {
  const controle = new AbortController();
  const t = setTimeout(() => controle.abort(), tempoLimiteMs);
  try {
    const resposta = await fetch(`${API_URL}${caminho}`, { signal: controle.signal, headers: { Accept: "application/json" } });
    if (!resposta.ok) return null;
    return await resposta.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
