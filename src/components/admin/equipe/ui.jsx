import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";

export const CAMPO = "h-12 w-full rounded-xl border bg-card-2 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 scheme-dark";
export const SEDES = ["Paulista", "Recife", "Caruaru"];
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export const nomeReservado = (nome = "") => nome.trim().split(/\s+/).slice(0, 2).join(" ");
export const ehAutonomo = (m) => m.cargo === "corretor" && m.vinculo === "externo";
export function ufDe(m) {
  if (m.uf) return m.uf.toUpperCase();
  const achou = (m.creci ?? "").toUpperCase().match(/(?<![A-Z])([A-Z]{2})(?![A-Z])/g) ?? [];
  return achou.find((s) => UFS.includes(s)) ?? null;
}
export const dataCurta = (iso) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export function Avatar({ nome }) {
  const ini = (nome ?? "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/15 text-sm font-semibold text-gold">{ini}</span>;
}

const TONS = {
  neutro: "bg-white/10 text-ink-2",
  ouro: "bg-gold/15 text-gold",
  ok: "bg-emerald-500/15 text-emerald-300",
  alerta: "bg-amber-500/15 text-amber-300",
  perigo: "bg-danger/15 text-danger",
  azul: "bg-sky-500/15 text-sky-300",
};
export const Selo = ({ tom = "neutro", children }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TONS[tom]}`}>{children}</span>
);

export const Vazio = ({ children }) => (
  <div className="animate-fade-in rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-2">{children}</div>
);

export function Campo({ rotulo, erro, children }) {
  return (
    <label className="block text-xs text-ink-2">
      {rotulo}
      <div className="mt-1.5">{children}</div>
      {erro && <span className="mt-1 block text-[11px] text-danger">{erro}</span>}
    </label>
  );
}

export function Folha({ titulo, onClose, largo = false, children }) {
  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className={`animate-slide-up sm:animate-fade-up max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${largo ? "sm:max-w-2xl" : "sm:max-w-md"} sm:rounded-3xl sm:p-7`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-11 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-gold hover:text-ink">
            <Icon name="x" className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}