import { useEffect, useState } from "react";
import { acessoLiberado } from "@/lib/catalogoHome";

/** true depois que o visitante se cadastra (libera galeria completa, plantas e tabela). */
export function useAcessoExclusivo() {
  const [liberado, setLiberado] = useState(acessoLiberado);

  useEffect(() => {
    const atualizar = () => setLiberado(acessoLiberado() || true);
    window.addEventListener("pb-acesso-liberado", atualizar);
    return () => window.removeEventListener("pb-acesso-liberado", atualizar);
  }, []);

  return liberado;
}
