import pino from "@/assets/logo-pino.svg";

/** Tela mostrada quando uma página quebra: explica e dá duas saídas, em vez de ficar em branco. */
export default function ErroDeTela() {
  return (
    <main className="grid min-h-screen place-items-center bg-page px-6 py-12 text-center text-ink">
      <div role="alert" className="w-full max-w-sm">
        <img src={pino} alt="" width="221" height="258" className="mx-auto h-20 w-auto" />
        <h1 className="mt-6 text-xl font-semibold">Algo deu errado nesta tela</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Seus dados continuam salvos. Recarregue a página; se o problema continuar, avise o suporte da Place.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => window.location.reload()}
            className="min-h-12 rounded-xl bg-gold px-6 text-sm font-semibold text-[#08152b] transition hover:brightness-105">
            Recarregar a página
          </button>
          <a href="/" className="grid min-h-12 place-items-center rounded-xl border border-line px-6 text-sm font-semibold text-ink-2 transition hover:border-gold/60 hover:text-gold">
            Voltar ao início
          </a>
        </div>
      </div>
    </main>
  );
}
