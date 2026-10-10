import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";

export default function AgendamentoDrawer({ titulo, onFechar, children }) {
  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // a página de trás não rola
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflow;
    };
  }, [onFechar]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/65 sm:items-stretch sm:justify-end"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="animate-slide-up sm:animate-slide-left flex max-h-[94dvh] w-full flex-col rounded-t-3xl border border-line bg-card text-ink sm:max-h-none sm:max-w-md sm:rounded-none sm:border-y-0 sm:border-r-0"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="grid size-11 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-gold hover:text-ink"
          >
            <Icon name="x" className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </aside>
    </div>
  );
}