import { api } from "@/lib/apiClient";

export const STATUS = {
  lancamento: { label: "Lançamento", color: "var(--color-ok)" },
  obras: { label: "Em obras", color: "var(--color-info)" },
  pronto: { label: "Pronto", color: "var(--color-gold)" },
  outros: { label: "Outros", color: "var(--color-ink-3)" },
};

function limite(valor) {
  if (valor == null || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}
export function formatarFaixa(min, max, singular, plural) {
  const minimo = limite(min);
  const maximo = limite(max);
  if (minimo == null && maximo == null) return "";
  if (minimo != null && maximo != null && minimo > maximo) return "";
  if (minimo == null) return `Até ${maximo} ${maximo === 1 ? singular : plural}`;
  if (maximo == null || minimo === maximo) return `${minimo} ${minimo === 1 ? singular : plural}`;
  return `${minimo} e ${maximo} ${plural}`;
}

export const listarEmpreendimentos = ({ publico = false } = {}) =>
  api.get("/empreendimentos", { auth: !publico });
export const buscarEmpreendimentoPorId = (id) => api.get(`/empreendimentos/${id}`);

export function criarEmpreendimento(dados) {
  const form = new FormData();
  const arquivos = ["capa", "galeria", "book", "tabela"];
  for (const [chave, valor] of Object.entries(dados)) {
    if (arquivos.includes(chave) || valor == null) continue;
    form.append(chave, chave === "lazer" ? JSON.stringify(valor) : String(valor));
  }
  if (dados.capa) form.append("capa", dados.capa);
  if (dados.book) form.append("book", dados.book);
  if (dados.tabela) form.append("tabela", dados.tabela);
  dados.galeria?.forEach((arquivo) => form.append("galeria", arquivo));
  return api.post("/empreendimentos", form);
}
export const atualizarEmpreendimento = (id, mudancas) => api.patch(`/empreendimentos/${id}`, mudancas);
export const listarDocumentosComerciais = (id) => api.get(`/empreendimentos/${id}/documentos`);
export const urlDoDocumentoPorId = async (id, docId) =>
  (await api.get(`/empreendimentos/${id}/documentos/arquivo/${docId}`)).url;
export const urlDoDocumento = async (id, tipo) =>
  (await api.get(`/empreendimentos/${id}/documentos/${tipo}`)).url;

export const criarTipologia = (empreendimentoId, dados) =>
  api.post(`/empreendimentos/${empreendimentoId}/tipologias`, dados);
export const atualizarTipologia = (empreendimentoId, tipologiaId, dados) =>
  api.patch(`/empreendimentos/${empreendimentoId}/tipologias/${tipologiaId}`, dados);
