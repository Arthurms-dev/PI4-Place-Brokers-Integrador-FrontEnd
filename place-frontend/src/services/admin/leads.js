const API_URL = import.meta.env.VITE_API_URL;

function getAuthToken() {
  return localStorage.getItem("placebrokers_token");
}

function authHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResposta(res) {
  const corpo = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(corpo?.error?.message ?? "Não foi possível completar a operação.");
    err.code = corpo?.error?.code;
    err.fieldErrors = corpo?.error?.fieldErrors ?? {};
    throw err;
  }
  return corpo;
}

export async function getLeads() {
  const res = await fetch(`${API_URL}/leads`, { headers: authHeaders() });
  const { leads } = await parseResposta(res);
  return leads;
}

export async function getCorretores() {
  const res = await fetch(`${API_URL}/corretores`, { headers: authHeaders() });
  const { corretores } = await parseResposta(res);
  return corretores;
}

export async function updateLeadStatus(id, status) {
  const res = await fetch(`${API_URL}/leads/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  const { lead } = await parseResposta(res);
  return lead;
}

export async function assignLead(id, corretorId) {
  const res = await fetch(`${API_URL}/leads/${id}/corretor`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ corretorId }),
  });
  const { lead } = await parseResposta(res);
  return lead;
}

export async function convertLeadToCliente(id) {
  const res = await fetch(`${API_URL}/leads/${id}/converter`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseResposta(res); 
}