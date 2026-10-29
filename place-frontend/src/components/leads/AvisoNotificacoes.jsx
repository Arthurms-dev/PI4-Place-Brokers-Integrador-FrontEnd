import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ativarNotificacoes, chavePublica, estadoNotificacoes, precisaInstalarNoIOS, suportaNotificacoes } from "@/lib/notificacoes";

const CHAVE_DISPENSA = "placebrokers_aviso_notificacao_dispensado";

/** Convite para receber aviso no celular quando chegar lead novo (some depois de ativado). */
export function AvisoNotificacoes() {
  const [chave, setChave] = useState(null);
  const [estado, setEstado] = useState("carregando");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [dispensado, setDispensado] = useState(() => {
    try { return Boolean(localStorage.getItem(CHAVE_DISPENSA)); } catch { return false; }
  });

  useEffect(() => {
    if (!suportaNotificacoes()) return setEstado("indisponivel");
    let ativo = true;
    Promise.all([chavePublica(), estadoNotificacoes()]).then(([c, e]) => {
      if (!ativo) return;
      setChave(c);
      setEstado(c ? e : "indisponivel");
    });
    return () => { ativo = false; };
  }, []);

  if (dispensado || ["carregando", "indisponivel", "ativo"].includes(estado)) {
    // iPhone sem o app instalado: o navegador nem oferece push; vale ensinar a instalar.
    if (!dispensado && estado === "indisponivel" && precisaInstalarNoIOS()) {
      return (
        <Cartao onDispensar={dispensar}>
          <b className="block text-[14px] font-medium">Receba aviso de lead novo no iPhone</b>
          <span className="block text-[12px] text-ink-2">Toque em Compartilhar e depois em <b>Adicionar à Tela de Início</b>. Abra a Place por lá e ative os avisos.</span>
        </Cartao>
      );
    }
    return null;
  }

  function dispensar() {
    try { localStorage.setItem(CHAVE_DISPENSA, "1"); } catch { /* sem armazenamento: só some agora */ }
    setDispensado(true);
  }

  async function ativar() {
    setOcupado(true);
    setErro("");
    try {
      setEstado(await ativarNotificacoes(chave));
    } catch (e) {
      setErro(e.message || "Não foi possível ativar agora.");
    } finally {
      setOcupado(false);
    }
  }

  if (estado === "bloqueado") {
    return (
      <Cartao onDispensar={dispensar}>
        <b className="block text-[14px] font-medium">Notificações bloqueadas</b>
        <span className="block text-[12px] text-ink-2">Para receber aviso de lead novo, libere as notificações deste site nas configurações do navegador.</span>
      </Cartao>
    );
  }

  return (
    <Cartao onDispensar={dispensar}>
      <b className="block text-[14px] font-medium">Avise no celular quando chegar lead</b>
      <span className="block text-[12px] text-ink-2">O celular toca na hora, mesmo com o site fechado. Quem liga primeiro leva o cliente.</span>
      <button type="button" onClick={ativar} disabled={ocupado}
        className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg bg-gold-gradient px-4 text-[13px] font-semibold text-[#1a1408] disabled:opacity-60">
        <Icon name="bell" className="size-4" /> {ocupado ? "Ativando..." : "Ativar avisos"}
      </button>
      {erro && <p role="alert" className="mt-1 text-[12px] text-danger">{erro}</p>}
    </Cartao>
  );
}

function Cartao({ children, onDispensar }) {
  return (
    <section className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4">
      <Icon name="bell" className="mt-0.5 size-4.5 shrink-0 text-gold" />
      <div className="min-w-0 flex-1">{children}</div>
      <button type="button" onClick={onDispensar} aria-label="Dispensar" className="grid size-8 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-white/5 hover:text-ink">
        <Icon name="x" className="size-4" />
      </button>
    </section>
  );
}
