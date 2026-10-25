import { useCallback, useEffect, useState } from "react";
import { useAsyncData } from "@/hooks/useAsyncData";
import { AUTH_CHANGE_EVENT, AUTH_TOKEN_KEY } from "@/lib/authToken";
import { getCurrentUser } from "@/services/session";

export function useUsuarioAtual() {
  const [versao, setVersao] = useState(0);
  useEffect(() => {
    const recarregar = () => setVersao((v) => v + 1);
    const aoMudarStorage = (evento) => {
      if (evento.key === AUTH_TOKEN_KEY || evento.key === null) recarregar();
    };
    const aoVoltar = () => {
      if (document.visibilityState === "visible") recarregar();
    };
    window.addEventListener(AUTH_CHANGE_EVENT, recarregar);
    window.addEventListener("storage", aoMudarStorage);
    window.addEventListener("focus", recarregar);
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, recarregar);
      window.removeEventListener("storage", aoMudarStorage);
      window.removeEventListener("focus", recarregar);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, []);
  const consultar = useCallback(() => getCurrentUser(), [versao]);
  return useAsyncData(consultar);
}
