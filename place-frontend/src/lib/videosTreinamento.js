// Vídeos de treinamento: só aceitamos links do YouTube e do Google Drive, em https.
// O vídeo abre no site de origem (nova aba); nada é enviado ou guardado no nosso servidor.

const HOSTS_YOUTUBE = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const HOSTS_DRIVE = new Set(["drive.google.com"]);
const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

function lerUrl(url) {
  try {
    const u = new URL(String(url ?? "").trim());
    return u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}

/** Id de 11 caracteres do vídeo do YouTube, ou null. */
export function idDoYoutube(url) {
  const u = lerUrl(url);
  if (!u || !HOSTS_YOUTUBE.has(u.hostname)) return null;
  let id = null;
  if (u.hostname === "youtu.be") id = u.pathname.slice(1).split("/")[0];
  else if (u.pathname === "/watch") id = u.searchParams.get("v");
  else {
    const [, tipo, valor] = u.pathname.split("/");
    if (["shorts", "embed", "live"].includes(tipo)) id = valor;
  }
  return id && ID_YOUTUBE.test(id) ? id : null;
}

/** Link seguro para abrir o vídeo, ou null se não for YouTube/Drive em https. */
export function linkDoVideo(url) {
  const id = idDoYoutube(url);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  const u = lerUrl(url);
  if (u && HOSTS_DRIVE.has(u.hostname) && u.pathname.startsWith("/file/d/")) return u.href;
  return null;
}

/** Miniatura do YouTube; vídeos do Drive ficam sem capa. */
export function capaDoVideo(url) {
  const id = idDoYoutube(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Só os vídeos com título e link válido, na ordem cadastrada. */
export function videosValidos(lista) {
  return (Array.isArray(lista) ? lista : [])
    .filter((v) => v && String(v.titulo ?? "").trim() && linkDoVideo(v.url))
    .map((v) => ({ ...v, titulo: String(v.titulo).trim(), link: linkDoVideo(v.url), capa: capaDoVideo(v.url) }));
}
