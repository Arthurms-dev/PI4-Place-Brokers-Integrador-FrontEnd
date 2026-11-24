import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
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
const UM_DIA = 24 * 60 * 60 * 1000;
/** Lead esperando há mais de 1 dia: precisa de alguém olhar. */
const parado = (l) => Date.now() - new Date(l.criadoEm).getTime() > UM_DIA;
const primeiraMaiuscula = (t = "") => t.charAt(0).toLocaleUpperCase("pt-BR") + t.slice(1);

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
          "h-11 shrink-0 rounded-full border px-3.5 text-[13px] font-medium disabled:opacity-50",
          c.apto ? "border-ok/50 bg-ok/10 text-ok" : "border-line text-ink-3",
        )}
      >
        {c.apto ? "Apto" : "Não apto"}
      </button>
      {confirmar ? (
        <button type="button" disabled={ocupado} onClick={onRemover} onBlur={() => setConfirmar(false)}
          className="h-11 shrink-0 rounded-full border border-danger/50 px-3.5 text-[13px] text-danger disabled:opacity-50">
          Tirar da lista?
        </button>
      ) : (
        <button type="button" onClick={() => setConfirmar(true)} aria-label={`Desfazer a chegada de ${c.nome}`} title="Marcou por engano? Desfazer a chegada"
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-white/5 hover:text-ink">
          <Icon name="x" className="size-4" />
        </button>
      )}
    </li>
  );
}

/** Tela da recepção: marca quem chegou, fecha a lista e acompanha a distribuição. */
export default function RoletaPage() {
  // A recepção usa esta mesma tela, mas Leads e Focos são do admin.
  const ehAdmin = useOutletContext()?.user?.cargo === "admin";
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
  const situacao = painel.horario.situacao;
  // Depois das 09h sem ninguém apto a roleta não começa: a tela não pode dizer "fecha às 09h" nem oferecer o botão.
  const semRoletaHoje = !painel.iniciada && situacao !== "chegada";
  const hojeEmRecife = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Recife" }).format(new Date());
  const diaAberto = painel.dia === hojeEmRecife && situacao !== "fechada";
  const entregues = (r) => (r.distribuidos ? `${r.distribuidos} lead${r.distribuidos > 1 ? "s" : ""} distribuído${r.distribuidos > 1 ? "s" : ""}.` : "Nenhum lead para distribuir agora.");

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pb-eyebrow">Recepção</p>
          <h1 className="text-xl font-semibold">Roleta do dia</h1>
          <p className="mt-1 text-[13px] text-ink-2">{primeiraMaiuscula(diaPorExtenso(painel.dia))}</p>
        </div>
        <Situacao painel={semRoletaHoje && situacao === "distribuindo" ? { horario: { situacao: "fechada", mensagem: "Lista fechada às 09h · ninguém apto hoje" } } : painel} />
      </header>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] text-danger">{erro}</p>}
      {aviso && <p role="status" className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-[13px] text-gold">{aviso}</p>}

      {/* Celular: marcar chegada vem primeiro (é o que a recepção faz o tempo todo); encerrar fica depois da lista. */}
      <Card className="order-3 flex flex-wrap items-center justify-between gap-3 lg:order-none">
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
        ) : semRoletaHoje ? (
          <p className="text-[14px] text-ink-2">
            <b className="font-semibold text-ink">A roleta não começou hoje.</b>{" "}
            {situacao === "fechada"
              ? painel.horario.mensagem
              : "A lista fechou às 09h sem nenhum corretor apto. Leads novos ficam aguardando para o admin distribuir em Leads."}
          </p>
        ) : (
          <>
            <p className="text-[14px] text-ink-2">
              {aptos ? `${aptos} corretor${aptos > 1 ? "es" : ""} apto${aptos > 1 ? "s" : ""} na lista.` : "Ninguém apto na lista ainda."}{" "}
              A lista fecha sozinha às 09h; se todos já chegaram, pode fechar antes.
            </p>
            <div className="flex flex-col items-end gap-1">
              <Button disabled={ocupado || !aptos} onClick={() => executar(iniciarRoleta, entregues)}>
                Encerrar lista e iniciar roleta
              </Button>
              {!aptos && <span className="text-xs text-ink-3">Marque ao menos 1 corretor que chegou para encerrar.</span>}
            </div>
          </>
        )}
      </Card>

      <div className="order-2 grid gap-5 lg:order-none lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <Card className="order-2 lg:order-none">
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

        <Card className="order-1 lg:order-none">
          <CardHeader
            title="Marcar chegada"
            description={situacao === "chegada" || !diaAberto ? "Toque no corretor assim que ele chegar." : "Já passou das 09h: quem chegar agora entra na lista, mas não recebe leads hoje."}
          />
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
                  <span className="min-w-0">
                    <span className="block truncate text-[14px]">{c.nome}</span>
                    {(c.equipe || c.gerente) && (
                      <span className="block truncate text-xs text-ink-3">{[c.equipe, c.gerente && `gerente ${c.gerente}`].filter(Boolean).join(" · ")}</span>
                    )}
                  </span>
                  <button type="button" disabled={ocupado}
                    onClick={() => executar(() => marcarChegada(c.id), (r) => `${c.nome}: nº ${r.ordem}${r.apto ? "" : " (depois do fechamento, não recebe hoje)"}.`)}
                    className="h-11 shrink-0 rounded-full border border-gold/50 px-4 text-[13px] font-medium text-gold hover:bg-gold/10 disabled:opacity-50">
                    {situacao === "chegada" ? "Chegou" : "Chegou (após 09h)"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="order-4 lg:order-none">
        <CardHeader
          title={`Leads aguardando corretor (${painel.aguardando.length})`}
          description={painel.aguardando.length ? motivoAguardando(painel) : "Nenhum lead parado. Quem chega pelo site entra na roleta na hora."}
          action={ehAdmin ? <Link to="/admin/leads" className="inline-flex min-h-11 items-center text-[12px] text-gold hover:underline">Abrir Leads</Link> : null}
        />
        {painel.aguardando.length > 0 && (
          <ul className="divide-y divide-line-soft">
            {painel.aguardando.map((l) => (
              <li key={l.id} className={cn("flex items-center justify-between gap-3 py-2.5", parado(l) && "-mx-2 rounded-xl bg-danger/10 px-2")}>
                <span className="min-w-0">
                  <b className="block truncate text-[14px] font-medium">{l.nome}</b>
                  <small className="block truncate text-[12px] text-ink-3">{l.empreendimento?.nome ?? "Sem empreendimento"} · {l.origem ?? "site"}</small>
                </span>
                <span className={cn("shrink-0 text-[12px]", parado(l) ? "font-semibold text-danger" : "text-ink-2")}>
                  {parado(l) ? `parado ${tempoDesde(l.criadoEm)}` : tempoDesde(l.criadoEm)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="order-5 text-[12px] text-ink-3 lg:order-none">
        Os leads vão para o próximo apto da lista com foco no empreendimento; no fim da lista, recomeça do topo.
        Os focos são definidos pelos gerentes{ehAdmin ? <> em <Link to="/admin/focos" className="inline-flex min-h-11 items-center text-gold hover:underline">Focos dos corretores</Link></> : null}.
      </p>
    </div>
  );
}
