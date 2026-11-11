import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/cn";
import { tempoDesde } from "@/lib/atendimento";
import { diaPorExtenso, horaRecife, motivoAguardando } from "@/lib/roleta";
import {
  carregarRoletaHoje,
  definirApto,
  distribuirAgora,
  iniciarRoleta,
  marcarChegada,
  removerChegada,
} from "@/services/roleta";

const norm = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const ATUALIZAR_A_CADA = 30 * 1000;

function Situacao({ painel }) {
  const { situacao, mensagem } = painel.horario;
  const cor = situacao === "fechada" ? "border-line text-ink-2" : situacao === "chegada" ? "border-gold/50 text-gold" : "border-ok/50 text-ok";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px]", cor)}>
      <Icon name="clock" className="size-3.5" />
      {mensagem}
    </span>
  );
}

function LinhaChegada({ c, ocupado, onApto, onRemover }) {
  const [confirmar, setConfirmar] = useState(false);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line-soft bg-card-2 px-3 py-2.5">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-[14px] font-bold", c.apto ? "bg-gold/15 text-gold" : "bg-white/5 text-ink-3")}>
        {c.ordem}
      </span>
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[14px] font-medium">{c.nome}</b>
        <small className="block text-[12px] text-ink-3">
          Chegou às {horaRecife(c.chegouEm)}
          {c.recebidos > 0 && ` · ${c.recebidos} lead${c.recebidos > 1 ? "s" : ""} hoje`}
        </small>
      </span>
      <button
        type="button"
        disabled={ocupado}
        onClick={() => onApto(!c.apto)}
        aria-pressed={c.apto}
        title={c.apto ? "Tirar da roleta de hoje" : "Colocar na roleta de hoje"}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium disabled:opacity-50",
          c.apto ? "border-ok/50 bg-ok/10 text-ok" : "border-line text-ink-3",
        )}
      >
        {c.apto ? "Apto" : "Não apto"}
      </button>
      {confirmar ? (
        <button type="button" disabled={ocupado} onClick={onRemover} onBlur={() => setConfirmar(false)}
          className="shrink-0 rounded-full border border-danger/50 px-3 py-1.5 text-[12px] text-danger disabled:opacity-50">
          Remover?
        </button>
      ) : (
        <button type="button" onClick={() => setConfirmar(true)} aria-label={`Tirar ${c.nome} da lista`}
          className="grid size-8 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-white/5 hover:text-ink">
          <Icon name="x" className="size-4" />
        </button>
      )}
    </li>
  );
}

/** Tela da recepção: marca quem chegou, fecha a lista e acompanha a distribuição. */
export default function RoletaPage() {
  usePageTitle("Roleta do dia");
  const [painel, setPainel] = useState(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [busca, setBusca] = useState("");

  const atualizar = useCallback(async () => {
    try {
      setPainel(await carregarRoletaHoje());
      setErro("");
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    atualizar();
    const id = setInterval(atualizar, ATUALIZAR_A_CADA);
    return () => clearInterval(id);
  }, [atualizar]);

  async function executar(acao, mensagem) {
    setOcupado(true);
    setAviso("");
    try {
      const r = await acao();
      setAviso(typeof mensagem === "function" ? mensagem(r) : mensagem ?? "");
      await atualizar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  const faltam = useMemo(() => {
    const q = norm(busca.trim());
    return (painel?.faltam ?? []).filter((c) => !q || norm(c.nome).includes(q));
  }, [painel, busca]);

  if (!painel) {
    return <div className="grid min-h-[50vh] place-items-center text-ink-2">{erro || "Carregando a roleta…"}</div>;
  }

  const aptos = painel.chegadas.filter((c) => c.apto).length;
  const entregues = (r) => (r.distribuidos ? `${r.distribuidos} lead${r.distribuidos > 1 ? "s" : ""} distribuído${r.distribuidos > 1 ? "s" : ""}.` : "Nenhum lead para distribuir agora.");

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pb-eyebrow">Recepção</p>
          <h1 className="text-xl font-semibold">Roleta do dia</h1>
          <p className="mt-1 text-[13px] capitalize text-ink-2">{diaPorExtenso(painel.dia)}</p>
        </div>
        <Situacao painel={painel} />
      </header>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] text-danger">{erro}</p>}
      {aviso && <p role="status" className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-[13px] text-gold">{aviso}</p>}

      <Card className="flex flex-wrap items-center justify-between gap-3">
        {painel.iniciada ? (
          <>
            <p className="text-[14px]">
              <b className="font-semibold text-ok">Roleta em andamento</b>
              <span className="text-ink-2">
                {" "}desde {horaRecife(painel.iniciada.em)}{painel.iniciada.automatica ? " (fechou sozinha às 09h)" : ""} · {painel.entreguesHoje} lead{painel.entreguesHoje === 1 ? "" : "s"} entregue{painel.entreguesHoje === 1 ? "" : "s"} hoje
              </span>
            </p>
            <Button disabled={ocupado || painel.horario.situacao === "fechada"} onClick={() => executar(distribuirAgora, entregues)}>
              <Icon name="refresh" className="mr-2 size-4" /> Distribuir agora
            </Button>
          </>
        ) : (
          <>
            <p className="text-[14px] text-ink-2">
              {aptos ? `${aptos} corretor${aptos > 1 ? "es" : ""} apto${aptos > 1 ? "s" : ""} na lista.` : "Ninguém apto na lista ainda."}{" "}
              A lista fecha sozinha às 09h; se todos já chegaram, pode fechar antes.
            </p>
            <Button disabled={ocupado || !aptos || painel.horario.situacao === "fechada"} onClick={() => executar(iniciarRoleta, entregues)}>
              Encerrar lista e iniciar roleta
            </Button>
          </>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <Card>
          <CardHeader title="Lista de chegada" description="Ordem geral do dia. Quem chega antes das 09h fica apto." />
          {painel.chegadas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-6 text-center text-[13px] text-ink-2">Ninguém marcado ainda.</p>
          ) : (
            <ol className="space-y-2">
              {painel.chegadas.map((c) => (
                <LinhaChegada
                  key={c.corretorId}
                  c={c}
                  ocupado={ocupado}
                  onApto={(apto) => executar(() => definirApto(c.corretorId, apto))}
                  onRemover={() => executar(() => removerChegada(c.corretorId), `${c.nome} saiu da lista.`)}
                />
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <CardHeader title="Marcar chegada" description="Toque no corretor assim que ele chegar." />
          <label className="relative mb-3 block">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar corretor"
              className="h-11 w-full rounded-xl border border-line bg-card-2 pl-10 pr-3.5 text-base text-ink outline-none focus:border-gold scheme-dark sm:text-sm" />
          </label>
          {faltam.length === 0 ? (
            <p className="text-[13px] text-ink-2">{painel.faltam.length ? "Nenhum corretor com esse nome." : "Todos os corretores ativos já estão na lista."}</p>
          ) : (
            <ul className="max-h-[28rem] space-y-1.5 overflow-y-auto pr-1">
              {faltam.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5">
                  <span className="truncate text-[14px]">{c.nome}</span>
                  <button type="button" disabled={ocupado}
                    onClick={() => executar(() => marcarChegada(c.id), (r) => `${c.nome}: nº ${r.ordem}${r.apto ? "" : " (depois do fechamento, não recebe hoje)"}.`)}
                    className="shrink-0 rounded-full border border-gold/50 px-3.5 py-1.5 text-[12px] font-medium text-gold hover:bg-gold/10 disabled:opacity-50">
                    Chegou
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title={`Leads aguardando corretor (${painel.aguardando.length})`}
          description={painel.aguardando.length ? motivoAguardando(painel) : "Nenhum lead parado. Quem chega pelo site entra na roleta na hora."}
          action={<Link to="/admin/leads" className="text-[12px] text-gold hover:underline">Abrir Leads</Link>}
        />
        {painel.aguardando.length > 0 && (
          <ul className="divide-y divide-line-soft">
            {painel.aguardando.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <b className="block truncate text-[14px] font-medium">{l.nome}</b>
                  <small className="block truncate text-[12px] text-ink-3">{l.empreendimento?.nome ?? "Sem empreendimento"} · {l.origem ?? "site"}</small>
                </span>
                <span className="shrink-0 text-[12px] text-ink-2">{tempoDesde(l.criadoEm)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-[12px] text-ink-3">
        Os leads vão para o próximo apto da lista com foco no empreendimento; no fim da lista, recomeça do topo.
        Os focos são definidos pelos gerentes em <Link to="/admin/focos" className="text-gold hover:underline">Focos dos corretores</Link>.
      </p>
    </div>
  );
}
