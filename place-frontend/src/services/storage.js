import { supabase } from "@/lib/supabase";

const BUCKET_IMAGENS = "empreendimentos";
const BUCKET_DOCUMENTOS = "documentos";

function extensao(file) {
  return file.name.split(".").pop()?.toLowerCase() || "bin";
}

async function upload(bucket, path, file) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw new Error(`Falha ao enviar ${file.name}: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function gerarSlug(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uploadCapa(slug, file) {
  return upload(BUCKET_IMAGENS, `${slug}/capa.${extensao(file)}`, file);
}

/** @param {string} slug @param {File[]} files */
export async function uploadGaleria(slug, files) {
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const nomeArquivo = `${String(i + 1).padStart(2, "0")}.${extensao(files[i])}`;
    urls.push(await upload(BUCKET_IMAGENS, `${slug}/galeria/${nomeArquivo}`, files[i]));
  }
  return urls;
}

export async function uploadBook(slug, file) {
  return upload(BUCKET_DOCUMENTOS, `${slug}/book.${extensao(file)}`, file);
}

export async function uploadTabela(slug, file) {
  return upload(BUCKET_DOCUMENTOS, `${slug}/tabela.${extensao(file)}`, file);
}