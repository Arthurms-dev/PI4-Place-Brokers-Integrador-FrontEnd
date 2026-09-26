import { supabase } from "@/lib/supabase";
import { gerarSlug, uploadBook, uploadCapa, uploadGaleria, uploadTabela } from "@/services/storage";

export const STATUS = {
  lancamento: { label: "Lançamento", color: "var(--color-ok)" },
  obras: { label: "Em obras", color: "var(--color-info)" },
  pronto: { label: "Pronto", color: "var(--color-gold)" },
  outros: { label: "Outros", color: "var(--color-ink-3)" },
};

export function formatarFaixa(min, max, singular, plural) {
  if (min == null && max == null) return "";
  if (max == null || min === max) return `${min} ${min === 1 ? singular : plural}`;
  return `${min} e ${max} ${plural}`;
}

/**
 */
export async function listarEmpreendimentos() {
  const { data, error } = await supabase
    .from("empreendimentos")
    .select("*, construtora:construtoras(nome)")
    .order("atualizado_em", { ascending: false });

  if (error) throw new Error("Não foi possível carregar os empreendimentos.");
  return data;
}

export async function buscarEmpreendimentoPorId(id) {
  const { data, error } = await supabase
    .from("empreendimentos")
    .select("*, construtora:construtoras(nome), imagens:empreendimento_imagens(url, ordem)")
    .eq("id", id)
    .single();

  if (error) throw new Error("Empreendimento não encontrado.");
  return data;
}

/**
 * @param {{
 *   nome: string, construtoraId?: string, status: string, descricao?: string,
 *   uf: string, cidade: string, bairro: string, endereco?: string,
 *   latitude?: number, longitude?: number,
 *   quartosMin?: number, quartosMax?: number, vagasMin?: number, vagasMax?: number,
 *   precoMin?: number, precoMax?: number, lazer?: string[], publicado?: boolean,
 *   capa?: File, galeria?: File[], book?: File, tabela?: File,
 * }} dados
 */
export async function criarEmpreendimento(dados) {
  const slug = gerarSlug(dados.nome);

  const [capaUrl, galeriaUrls, bookUrl, tabelaUrl] = await Promise.all([
    dados.capa ? uploadCapa(slug, dados.capa) : Promise.resolve(null),
    dados.galeria?.length ? uploadGaleria(slug, dados.galeria) : Promise.resolve([]),
    dados.book ? uploadBook(slug, dados.book) : Promise.resolve(null),
    dados.tabela ? uploadTabela(slug, dados.tabela) : Promise.resolve(null),
  ]);

  const { data: empreendimento, error } = await supabase
    .from("empreendimentos")
    .insert({
      nome: dados.nome,
      slug,
      construtora_id: dados.construtoraId ?? null,
      status: dados.status,
      descricao: dados.descricao ?? null,
      uf: dados.uf,
      cidade: dados.cidade,
      bairro: dados.bairro,
      endereco: dados.endereco ?? null,
      latitude: dados.latitude ?? null,
      longitude: dados.longitude ?? null,
      quartos_min: dados.quartosMin ?? null,
      quartos_max: dados.quartosMax ?? null,
      vagas_min: dados.vagasMin ?? null,
      vagas_max: dados.vagasMax ?? null,
      preco_min: dados.precoMin ?? null,
      preco_max: dados.precoMax ?? null,
      lazer: dados.lazer ?? [],
      capa_url: capaUrl,
      book_url: bookUrl,
      book_atualizado_em: bookUrl ? new Date().toISOString() : null,
      tabela_url: tabelaUrl,
      tabela_atualizado_em: tabelaUrl ? new Date().toISOString() : null,
      publicado: dados.publicado ?? false,
    })
    .select()
    .single();

  if (error) throw new Error("Não foi possível salvar o empreendimento: " + error.message);

  if (galeriaUrls.length) {
    const linhas = galeriaUrls.map((url, i) => ({ empreendimento_id: empreendimento.id, url, ordem: i }));
    const { error: erroGaleria } = await supabase.from("empreendimento_imagens").insert(linhas);
    if (erroGaleria) throw new Error("Empreendimento salvo, mas a galeria falhou: " + erroGaleria.message);
  }

  return empreendimento;
}