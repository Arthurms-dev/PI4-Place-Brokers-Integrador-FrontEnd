import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { CAMPO, Campo, Folha, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { listarEmpreendimentos } from "@/services/empreendimentos";
import { listarClientes } from "@/services/meusLeads";
import { criarVenda, decidirVenda, listarVendas } from "@/services/vendas";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const dataCurta = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const STATUS = {
  pendente: { rotulo: "Aguardando", tom: "alerta" },
  confirmada: { rotulo: "Confirmada", tom: "ok" },
  recusada: { rotulo: "Recusada", tom: "perigo" },
};

function Contagem({ valor, formato = (n) => Math.round(n) }) {
  const [v, setV] = useState(0);
  const de = useRef(0);
  useEffect(() => {
    const inicio = performance.now();
    const origem = de.current;
    let raf;
    const passo = (t) => {
      const p = Math.min(1, (t - inicio) / 900);
      setV(origem + (valor - origem) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(passo);
      else de.current = valor;
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return <>{formato(v)}</>;
}

function Indicador({ rotulo, destaque, children, rodape, atraso }) {
  return (
    <div style={{ animationDelay: `${atraso}ms` }} className="animate-fade-up rounded-2xl border border-line bg-card p-4">
      <p className="text-[12px] text-ink-3">{rotulo}</p>
      <p className={`mt-1 text-2xl font-semibold ${destaque ? "text-gold" : ""}`}>{children}</p>
      <p className="mt-0.5 text-[12px] text-ink-3">{rodape}</p>
    </div>
  );
}

const soDigitos = (s) => s.replace(/\D/g, "");
const moeda = (digitos) => (digitos ? (Number(digitos) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "");

function LancarVenda({ onClose, onCriada }) {
  const [empreendimentos, setEmpreendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [f, setF] = useState({ empreendimentoId: "", clienteId: "", centavos: "" });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarEmpreendimentos().then(setEmpreendimentos).catch(() => {});
    listarClientes().then(setClientes).catch(() => {});
  }, []);

  const borda = (c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");

  async function enviar(ev) {
    ev.preventDefault();
    const e = {};
    if (!f.empreendimentoId) e.empreendimentoId = "Escolha o empreendimento.";
    if (!f.clienteId) e.clienteId = "Escolha o cliente.";
    if (!Number(f.centavos)) e.valor = "Informe o valor da venda.";
    setErros(e);
    setErroGeral("");
    if (Object.keys(e).length) return;

    setEnviando(true);
    try {
      onCriada(await criarVenda({ empreendimentoId: f.empreendimentoId, clienteId: f.clienteId, valor: Number(f.centavos) / 100 }));
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Folha titulo="Lançar venda" onClose={onClose}>
      <form onSubmit={enviar} noValidate className="space-y-3.5">
        <p className="text-[13px] text-ink-2">A venda entra como <strong className="text-ink">aguardando</strong> e só soma no VGV depois que o seu gerente confirmar.</p>
        <Campo rotulo="Empreendimento" erro={erros.empreendimentoId}>
          <select value={f.empreendimentoId} onChange={(e) => setF((s) => ({ ...s, empreendimentoId: e.target.value }))} className={`${CAMPO} ${borda("empreendimentoId")}`}>
            <option value="">Escolha o empreendimento</option>
            {empreendimentos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Cliente" erro={erros.clienteId}>
          <select value={f.clienteId} onChange={(e) => setF((s) => ({ ...s, clienteId: e.target.value }))} className={`${CAMPO} ${borda("clienteId")}`}>
            <option value="">{clientes.length ? "Escolha o cliente" : "Nenhum cliente cadastrado"}</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Valor da venda" erro={erros.valor}>
          <input inputMode="numeric" placeholder="R$ 0,00" value={moeda(f.centavos)} onChange={(e) => setF((s) => ({ ...s, centavos: soDigitos(e.target.value).slice(0, 12) }))} className={`${CAMPO} ${borda("valor")}`} />
        </Campo>
        {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
        <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
          {enviando ? "Enviando..." : "Enviar para confirmação"}
        </button>
      </form>
    </Folha>
  );
}

function Venda({ v, indice, decide, onDecidir }) {
  const [acao, setAcao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const st = STATUS[v.status] ?? STATUS.pendente;

  async function aplicar() {
    setSalvando(true);
    try {
      await onDecidir(v.id, acao);
    } catch {
    } finally {
      setSalvando(false);
      setAcao(null);
    }
  }

  return (
    <li style={{ animationDelay: `${Math.min(indice, 6) * 50}ms` }} className="animate-fade-up space-y-3 rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xl font-semibold text-gold">{brl(v.valor)}</p>
          <p className="truncate text-sm font-medium">{v.empreendimento?.nome ?? "Empreendimento removido"}</p>
          <p className="truncate text-[13px] text-ink-2">
            {v.cliente?.nome ?? "Cliente não informado"}{v.corretor?.nome ? ` · ${v.corretor.nome}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <Selo tom={st.tom}>{st.rotulo}</Selo>
          <p className="mt-1.5 text-[12px] text-ink-3">{dataCurta(v.criado_em)}</p>
        </div>
      </div>

      {decide && v.status === "pendente" && (
        acao ? (
          <div className="animate-fade-in space-y-2">
            <p className="text-[13px] text-ink-2">
              {acao === "confirmada" ? `Confirmar a venda de ${brl(v.valor)}? Ela passa a somar no VGV.` : "Recusar esta venda? Ela não soma no VGV."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setAcao(null)} className="h-12 rounded-xl border border-line text-sm text-ink-2">Voltar</button>
              <button type="button" disabled={salvando} onClick={aplicar}
                className={`h-12 rounded-xl text-sm font-semibold disabled:opacity-60 ${acao === "confirmada" ? "bg-gold-gradient text-[#1a1408]" : "bg-danger text-white"}`}>
                {salvando ? "Salvando..." : acao === "confirmada" ? "Confirmar" : "Recusar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setAcao("recusada")} className="h-12 rounded-xl border border-danger/40 text-sm font-medium text-danger transition-colors hover:bg-danger/10">Recusar</button>
            <button type="button" onClick={() => setAcao("confirmada")} className="h-12 rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110">Confirmar</button>
          </div>
        )
      )}
    </li>
  );
}

export default function VendasPage() {
  usePageTitle("Vendas");
  const { user } = useOutletContext();
  const ehCorretor = user.cargo === "corretor";
  const decide = !ehCorretor;

  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [lancando, setLancando] = useState(false);
  const filtroDefinido = useRef(false);

  useEffect(() => {
    let ativo = true;
    listarVendas()
      .then((l) => {
        if (!ativo) return;
        setVendas(l);
        if (!filtroDefinido.current) {
          filtroDefinido.current = true;
          if (decide && l.some((v) => v.status === "pendente")) setFiltro("pendente");
        }
      })
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [decide]);

  const decidir = useCallback(async (id, status) => {
    setErro("");
    try {
      const atualizada = await decidirVenda(id, status);
      setVendas((l) => l.map((v) => (v.id === id ? atualizada : v)));
    } catch (e) {
      setErro(e.message);
      throw e;
    }
  }, []);

  const por = (s) => vendas.filter((v) => v.status === s);
  const confirmadas = por("confirmada");
  const pendentes = por("pendente");
  const soma = (l) => l.reduce((t, v) => t + Number(v.valor), 0);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return vendas.filter(
      (v) => (!filtro || v.status === filtro) && (!q || `${v.corretor?.nome ?? ""} ${v.cliente?.nome ?? ""} ${v.empreendimento?.nome ?? ""}`.toLowerCase().includes(q)),
    );
  }, [vendas, filtro, busca]);

  const filtros = [["", "Todas", vendas.length], ["pendente", "Aguardando", pendentes.length], ["confirmada", "Confirmadas", confirmadas.length], ["recusada", "Recusadas", por("recusada").length]];

  return (
    <div className="space-y-5">
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Vendas</h1>
          <p className="text-[13px] text-ink-2">
            {ehCorretor ? "Lance suas vendas e acompanhe a confirmação." : user.cargo === "gerente" ? "Confirme as vendas da sua equipe." : "Confirme as vendas: só as confirmadas somam no VGV."}
          </p>
        </div>
        {ehCorretor && (
          <button type="button" onClick={() => setLancando(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110">
            <Icon name="chart" className="size-4.5" /> Lançar venda
          </button>
        )}
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Indicador rotulo="VGV confirmado" destaque atraso={0} rodape={`${confirmadas.length} ${confirmadas.length === 1 ? "venda confirmada" : "vendas confirmadas"}`}>
          <Contagem valor={soma(confirmadas)} formato={(n) => brl(n)} />
        </Indicador>
        <Indicador rotulo="Aguardando confirmação" atraso={70} rodape={brl(soma(pendentes))}>
          <Contagem valor={pendentes.length} />
        </Indicador>
        <Indicador rotulo="Recusadas" atraso={140} rodape={brl(soma(por("recusada")))}>
          <Contagem valor={por("recusada").length} />
        </Indicador>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filtrar por status">
        {filtros.map(([k, rotulo, n]) => (
          <button key={k || "todas"} type="button" onClick={() => setFiltro(k)} aria-pressed={filtro === k}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm transition-colors ${filtro === k ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
            {rotulo} <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{n}</span>
          </button>
        ))}
      </div>

      {decide && vendas.length > 0 && (
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por corretor, cliente ou empreendimento" aria-label="Buscar" className={`${CAMPO} border-line focus:border-gold`} />
      )}

      {carregando ? (
        <div className="grid gap-3 lg:grid-cols-2" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : visiveis.length === 0 ? (
        <Vazio>
          {vendas.length === 0
            ? ehCorretor ? "Você ainda não lançou nenhuma venda." : "Nenhuma venda lançada ainda."
            : "Nenhuma venda com esse filtro."}
          {ehCorretor && vendas.length === 0 && <button type="button" onClick={() => setLancando(true)} className="ml-1 text-gold hover:underline">Lançar a primeira</button>}
        </Vazio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {visiveis.map((v, i) => <Venda key={v.id} v={v} indice={i} decide={decide} onDecidir={decidir} />)}
        </ul>
      )}

      {lancando && (
        <LancarVenda onClose={() => setLancando(false)} onCriada={(nova) => { setVendas((l) => [nova, ...l]); setFiltro(""); setLancando(false); }} />
      )}
    </div>
  );
}