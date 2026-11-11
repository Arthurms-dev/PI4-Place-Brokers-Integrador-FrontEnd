import { api } from "@/lib/apiClient";

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

/** Registro de métricas é intencionalmente best-effort.
 * Manda o token quando há alguém logado: é assim que o back sabe quais empreendimentos
 * o corretor abriu ("Abertos recentemente" no Início). Visitante anônimo vai sem token. */
export function registrarEvento({ tipo, empreendimentoId } = {}) {
  const sessaoId = obterSessaoId();
  if (!sessaoId) return;
  api.post("/metricas/eventos", { tipo, empreendimentoId, sessaoId }, { keepalive: true }).catch(() => {});
}
/** Últimos empreendimentos que o usuário logado abriu. */
export const listarMeusAcessos = async () => (await api.get("/metricas/meus-acessos")).acessos ?? [];
