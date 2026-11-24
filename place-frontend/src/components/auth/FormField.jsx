import { cloneElement, isValidElement, useId } from "react";

/**
 * Campo de formulário das telas de acesso. Liga a dica e o erro ao campo (aria-describedby)
 * e marca o campo com erro (aria-invalid), para o leitor de tela anunciar e para o foco ir até ele.
 */
export function FormField({ label, error, hint, children }) {
  const id = useId();
  const dicaId = `${id}-dica`;
  const erroId = `${id}-erro`;
  const mostraDica = Boolean(hint) && !error;
  const descricao = [mostraDica && dicaId, error && erroId].filter(Boolean).join(" ") || undefined;
  const campo = isValidElement(children)
    ? cloneElement(children, { "aria-invalid": error ? true : undefined, "aria-describedby": descricao })
    : children;

  return (
    <label className="block text-xs text-ink-2">
      {label}
      <div className="mt-1.5">{campo}</div>
      {mostraDica && <span id={dicaId} className="mt-1 block text-xs text-ink-3">{hint}</span>}
      {error && <span id={erroId} className="mt-1 block text-[13px] text-danger">{error}</span>}
    </label>
  );
}

// 16 px no celular: abaixo disso o Safari do iPhone dá zoom ao tocar no campo.
export function fieldInputClass(error) {
  return [
    "h-11 w-full rounded-lg border bg-card-2 px-3.5 text-base text-ink outline-none placeholder:text-ink-3 sm:text-sm",
    error ? "border-danger" : "border-line focus:border-gold",
  ].join(" ");
}
