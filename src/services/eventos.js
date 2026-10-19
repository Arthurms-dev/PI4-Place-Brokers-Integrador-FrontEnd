import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const CHAVE_SESSAO = "placebrokers_sessao";

function obterSessaoId() {
  try {
    let id = localStorage.getItem(CHAVE_SESSAO);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CHAVE_SESSAO, id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * @param {{ tipo: "visualizacao_site"|"visualizacao_empreendimento"|"busca"|"contato", empreendimentoId?: string }} evento
 */
export function registrarEvento({ tipo, empreendimentoId } = {}) {
  const sessaoId = obterSessaoId();
  if (!sessaoId) return;

  const token = getToken();
  fetch(`${BASE_URL}/metricas/eventos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ tipo, empreendimentoId, sessaoId }),
    keepalive: true,
  }).catch(() => {});
}