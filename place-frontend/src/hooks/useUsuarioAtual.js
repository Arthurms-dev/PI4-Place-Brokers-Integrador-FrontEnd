import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, AUTH_TOKEN_KEY, getToken } from "@/lib/authToken";
import { getCurrentUser } from "@/services/session";

// Validar uma sessão existente em segundo plano não desmonta o painel.
// Ao trocar de token, o usuário anterior sai da tela até a nova verificação.
export function useUsuarioAtual() {
  const [state, setState] = useState(() => ({
    data: null,
    loading: Boolean(getToken()),
    error: null,
  }));

  useEffect(() => {
    let ativo = true;
    let ultimaCredencial = getToken();
    let sequencia = 0;

    async function verificar() {
      const token = getToken();
      const trocouConta = token !== ultimaCredencial;
      ultimaCredencial = token;
      const tentativa = ++sequencia;

      if (!token) {
        setState({ data: null, loading: false, error: null });
        return;
      }

      // Não manter informações da conta anterior após trocar o token.
      if (trocouConta) {
        setState({ data: null, loading: true, error: null });
      }

      try {
        const usuario = await getCurrentUser();
        if (!ativo || tentativa !== sequencia || getToken() !== token) return;
        setState({ data: usuario, loading: false, error: null });
      } catch (error) {
        if (!ativo || tentativa !== sequencia || getToken() !== token) return;
        setState({ data: null, loading: false, error });
      }
    }

    function aoMudarStorage(evento) {
      if (evento.key === AUTH_TOKEN_KEY || evento.key === null) void verificar();
    }
    function aoVoltar() {
      if (document.visibilityState === "visible") void verificar();
    }

    window.addEventListener(AUTH_CHANGE_EVENT, verificar);
    window.addEventListener("storage", aoMudarStorage);
    window.addEventListener("focus", verificar);
    document.addEventListener("visibilitychange", aoVoltar);
    void verificar();

    return () => {
      ativo = false;
      ++sequencia;
      window.removeEventListener(AUTH_CHANGE_EVENT, verificar);
      window.removeEventListener("storage", aoMudarStorage);
      window.removeEventListener("focus", verificar);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, []);

  return state;
}
