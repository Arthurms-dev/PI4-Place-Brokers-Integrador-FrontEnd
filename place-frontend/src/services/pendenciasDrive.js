import { getToken } from '@/lib/authToken';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export async function listarPendenciasDrive() {
  const token = getToken();
  if (!token) throw new Error('Faça login como administrador.');
  const resposta = await fetch(`${BASE_URL}/empreendimentos/documentos/pendencias`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.message ?? 'Não foi possível carregar as pendências.');
  }
  if (!dados || !Array.isArray(dados.itens)) {
    throw new Error('Resposta inválida da API de pendências.');
  }
  return dados;
}
