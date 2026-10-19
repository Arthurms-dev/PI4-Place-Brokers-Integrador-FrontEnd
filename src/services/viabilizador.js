import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const auth = () => ({ Authorization: `Bearer ${getToken()}` });

async function ler(res, padrao) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message ?? padrao), { fieldErrors: data.fieldErrors ?? {} });
  return data;
}

export const ROTULO_PENDENCIA = {
  sem_book: "Sem book",
  sem_tabela: "Sem tabela de preços",
  sem_preco: "Sem preço informado",
  sem_coordenadas: "Sem localização no mapa",
  documentos_desatualizados: "Documentos com mais de 30 dias",
};

export async function getProdutos() {
  return ler(await fetch(`${BASE_URL}/viabilizador/produtos`, { headers: auth() }), "Não foi possível carregar os produtos.");
}

export const MSG_SEM_CONSTRUTORA = "Você ainda não está vinculado a uma construtora. Peça ao admin para vincular o seu cadastro em Equipe → Viabilizadores.";

export async function atualizarProduto(id, mudancas) {
  const res = await fetch(`${BASE_URL}/viabilizador/produtos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...auth() }, body: JSON.stringify(mudancas) });
  return (await ler(res, "Não foi possível salvar.")).produto;
}

export async function enviarDocumento(id, tipo, arquivo) {
  const corpo = new FormData();
  corpo.append("arquivo", arquivo);
  const res = await fetch(`${BASE_URL}/viabilizador/produtos/${id}/documentos/${tipo}`, { method: "POST", headers: auth(), body: corpo });
  return (await ler(res, "Não foi possível enviar o arquivo.")).produto;
}

export async function getOportunidades(dias = 30) {
  return ler(await fetch(`${BASE_URL}/viabilizador/oportunidades?dias=${dias}`, { headers: auth() }), "Não foi possível carregar as oportunidades.");
}