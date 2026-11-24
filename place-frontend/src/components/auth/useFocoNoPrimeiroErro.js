import { useEffect } from "react";

/** Depois de um envio com erro, leva o foco ao primeiro campo marcado com aria-invalid. */
export function useFocoNoPrimeiroErro(formRef, erros) {
  useEffect(() => {
    if (!erros || !Object.keys(erros).length) return;
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [formRef, erros]);
}
