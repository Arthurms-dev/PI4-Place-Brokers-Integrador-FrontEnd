import { useSyncExternalStore } from "react";

const CHAVE = "pb:favoritos";
const ler = () => {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? [];
  } catch {
    return [];
  }
};
let estado = ler();
const ouvintes = new Set();

function alternar(id) {
  const chave = String(id);
  estado = estado.includes(chave) ? estado.filter((x) => x !== chave) : [...estado, chave];
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
  }
  ouvintes.forEach((f) => f());
}

export function useFavoritos() {
  const ids = useSyncExternalStore(
    (cb) => {
      ouvintes.add(cb);
      return () => ouvintes.delete(cb);
    },
    () => estado,
  );
  return { ids, ehFavorito: (id) => ids.includes(String(id)), alternar };
}

export function BotaoFavorito({ id, titulo, className = "" }) {
  const { ehFavorito, alternar: troca } = useFavoritos();
  const ativo = ehFavorito(id);
  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={ativo ? `Remover ${titulo} dos favoritos` : `Favoritar ${titulo}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        troca(id);
      }}
      className={`grid size-10 place-items-center rounded-full bg-page/75 backdrop-blur transition duration-200 hover:scale-110 active:scale-95 ${className}`}
    >
      <svg viewBox="0 0 24 24" className={`size-5 transition-colors ${ativo ? "fill-gold stroke-gold" : "fill-transparent stroke-white"}`} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 5 6.8 5c1.9 0 3.5 1 5.2 3 1.7-2 3.3-3 5.2-3 3.2 0 5.1 3 4 6.2-1.7 4.7-9.2 9.3-9.2 9.3z" />
      </svg>
    </button>
  );
}
