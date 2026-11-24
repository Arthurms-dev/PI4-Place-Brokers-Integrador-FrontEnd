import { api } from "@/lib/apiClient";

export const ROTULO_PENDENCIA = {
  sem_book: "Sem book",
  sem_tabela: "Sem tabela de preços",
  sem_preco: "Sem preço informado",
  sem_coordenadas: "Sem localização no mapa",
  documentos_desatualizados: "Documentos com mais de 30 dias",
};
// Para onde cada pendência leva (localização é cadastro do admin, não tem atalho).
export const LINK_PENDENCIA = {
  sem_book: "/viabilizador/books",
  sem_tabela: "/viabilizador/books",
  documentos_desatualizados: "/viabilizador/books",
  sem_preco: "/viabilizador/produtos",
};
export const DIAS_PARA_DESATUALIZAR = 30;
// Com pouca procura a barra não enche: a escala começa em 10 pontos.
export const ESCALA_MINIMA = 10;
export const plural = (n, um, varios) => `${n} ${Number(n) === 1 ? um : varios}`;
export const desatualizado = (iso, agora = Date.now()) => !iso || agora - new Date(iso).getTime() > DIAS_PARA_DESATUALIZAR * 86400000;
export const MSG_SEM_CONSTRUTORA = "Você ainda não está vinculado a uma construtora. Peça ao admin para vincular o seu cadastro em Equipe → Viabilizadores.";
export const getProdutos = () => api.get("/viabilizador/produtos");
export const atualizarProduto = async (id, mudancas) =>
  (await api.patch(`/viabilizador/produtos/${id}`, mudancas)).produto;
export async function enviarDocumento(id, tipo, arquivo) {
  const corpo = new FormData();
  corpo.append("arquivo", arquivo);
  return (await api.post(`/viabilizador/produtos/${id}/documentos/${tipo}`, corpo)).produto;
}
export const getOportunidades = (dias = 30) => api.get(`/viabilizador/oportunidades?dias=${dias}`);
