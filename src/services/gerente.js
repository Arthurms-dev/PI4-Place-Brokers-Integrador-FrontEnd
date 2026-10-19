import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

async function req(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? "Não foi possível carregar os dados da equipe.");
  return data;
}

export const getEquipe = () => req("/gerente/equipe");
export const getLeadsEquipe = async () => (await req("/gerente/leads")).leads;
export const getAgendaEquipe = async () => (await req("/gerente/agendamentos")).agendamentos;

export async function reatribuirLead(id, corretorId) {
  const res = await fetch(`${BASE_URL}/gerente/leads/${id}/corretor`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ corretorId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? "Não foi possível reatribuir o lead.");
  return data.lead;
}