import { getToken } from '@/lib/authToken';
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
async function request(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { ...(opts.body ? {'Content-Type':'application/json'} : {}), Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'Não foi possível carregar o histórico.');
  return data;
}
export async function listarAtividades(leadId) {
  return (await request(`/leads/${encodeURIComponent(leadId)}/atividades`)).atividades;
}
export async function registrarAtividade(leadId, dados) {
  return (await request(`/leads/${encodeURIComponent(leadId)}/atividades`, {
    method:'POST', body:JSON.stringify(dados),
  })).atividade;
}
