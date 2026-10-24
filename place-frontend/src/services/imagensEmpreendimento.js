import { getToken } from '@/lib/authToken';
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

async function requisitar(url, { metodo, corpo } = {}) {
  const token = getToken();
  if (!token) throw new Error('Faça login como administrador.');
  const response = await fetch(`${BASE_URL}${url}`, {
    method: metodo ?? 'GET',
    headers: { Authorization: `Bearer ${token}` },
    ...(corpo ? { body: corpo } : {}),
  });
  const dados = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(dados.message ?? 'Não foi possível gerenciar as imagens.');
  return dados;
}

export function trocarCapaEmpreendimento(id, imagem) {
  const corpo = new FormData();
  corpo.append('imagem', imagem);
  return requisitar(`/empreendimentos/${encodeURIComponent(id)}/imagens/capa`, { metodo:'POST', corpo });
}
export function adicionarFotosEmpreendimento(id, imagens) {
  const corpo = new FormData();
  for (const imagem of imagens) corpo.append('imagens', imagem);
  return requisitar(`/empreendimentos/${encodeURIComponent(id)}/imagens/galeria`, { metodo:'POST', corpo });
}
export function removerFotoEmpreendimento(id, imagemId) {
  return requisitar(`/empreendimentos/${encodeURIComponent(id)}/imagens/${encodeURIComponent(imagemId)}`, { metodo:'DELETE' });
}
