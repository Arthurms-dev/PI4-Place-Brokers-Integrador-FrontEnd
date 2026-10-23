/**
 * Filtra os itens da galeria pública. Não dá acesso a imagens privadas:
 * a autorização de armazenamento e de API deve continuar no back-end.
 * Não publicar plantas, books e tabelas comerciais por este fluxo.
 */
const BLOQUEADOS = /(?:^|[\s/_.-])(?:plantas?|floor[\s_-]?plans?|tabelas?|books?|memorial|quadro[\s_-]?de[\s_-]?areas)(?:$|[\s/_.-])/i;

function entradaValida(src) {
  if (typeof src !== 'string') return false;
  const valor = src.trim();
  if (!valor || /\.(?:pdf|docx?|xlsx?|zip)(?:[?#]|$)/i.test(valor)) return false;
  if (/drive\.google\.com\/file\/d\//i.test(valor)) return false;
  // Arquivos de imagem enviados pelo Vite/Supabase: HTTPS/HTTP ou caminho absoluto local.
  return /^https?:\/\//i.test(valor) || /^\/(?!\/)/.test(valor);
}

function normalizarFoto(foto, titulo, indice) {
  if (typeof foto === 'string') {
    return { src: foto.trim(), alt: `${titulo} — imagem ${indice + 1}`, marcador: foto };
  }
  if (!foto || typeof foto !== 'object') return null;
  const src = String(foto.src ?? foto.url ?? '').trim();
  const alt = typeof foto.alt === 'string' && foto.alt.trim()
    ? foto.alt.trim()
    : `${titulo} — imagem ${indice + 1}`;
  const marcador = [src, foto.alt, foto.tipo, foto.categoria, foto.legenda, foto.titulo]
    .filter((v) => typeof v === 'string')
    .join(' ');
  return { src, alt, marcador };
}

/**
 * @param {{capa?:string, galeria?:any[], imagens?:any[], titulo?:string}} options
 * @returns {{src:string,alt:string}[]}
 */
export function prepararImagensPublicas({ capa, galeria = [], imagens = [], titulo = 'Empreendimento' } = {}) {
  const secundarias = Array.isArray(galeria) ? galeria : [];
  const extras = Array.isArray(imagens)
    ? [...imagens].sort((a, b) => (Number(a?.ordem) || 0) - (Number(b?.ordem) || 0))
    : [];
  const candidatos = [...(capa ? [{ src: capa, alt: `${titulo} — imagem principal` }] : []), ...secundarias, ...extras];
  const vistos = new Set();
  const resultado = [];

  candidatos.forEach((candidato, indice) => {
    const foto = normalizarFoto(candidato, titulo, indice);
    if (!foto || !entradaValida(foto.src) || BLOQUEADOS.test(foto.marcador)) return;
    if (vistos.has(foto.src)) return;
    vistos.add(foto.src);
    resultado.push({ src: foto.src, alt: foto.alt });
  });
  return resultado;
}
