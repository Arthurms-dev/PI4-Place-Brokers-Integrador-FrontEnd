import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CAMPO, Campo, Folha, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { listarMembros } from "@/services/admin/equipe";
import { criarCliente, listarClientes } from "@/services/meusLeads";
import { listarVendas } from "@/services/vendas";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const dataCurta = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const digitos = (v = "") => v.replace(/\D/g, "");
function mascarar(v) {
  const d = digitos(v).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
const zap = (tel, nome) => `https://wa.me/55${digitos(tel)}?text=${encodeURIComponent(`Olá, ${nome}! Aqui é da Place Brokers.`)}`;

function NovoCliente({ corretores, onClose, onCriado }) {
  const [f, setF] = useState({ nome: "", telefone: "", email: "", corretorId: "", observacoes: "" });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (c) => (e) => setF((s) => ({ ...s, [c]: c === "telefone" ? mascarar(e.target.value) : e.target.value }));
  const borda = (c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");

  async function enviar(ev) {
    ev.preventDefault();
    const e = {};
    if (!f.nome.trim()) e.nome = "Informe o nome.";
    if (digitos(f.telefone).length < 10) e.telefone = "Informe o telefone com DDD.";
    if (!f.corretorId) e.corretorId = "Escolha o corretor responsável.";
    setErros(e);
    setErroGeral("");
    if (Object.keys(e).length) return;
    setEnviando(true);
    try {
      onCriado(await criarCliente(f));
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Folha titulo="Cadastrar cliente" onClose={onClose}>
      <form onSubmit={enviar} noValidate className="space-y-3.5">
        <Campo rotulo="Nome" erro={erros.nome}><input value={f.nome} onChange={set("nome")} autoComplete="off" className={`${CAMPO} ${borda("nome")}`} /></Campo>
        <Campo rotulo="WhatsApp (com DDD)" erro={erros.telefone}><input value={f.telefone} onChange={set("telefone")} inputMode="tel" placeholder="(81) 99999-9999" className={`${CAMPO} ${borda("telefone")}`} /></Campo>
        <Campo rotulo="E-mail (opcional)" erro={erros.email}><input type="email" value={f.email} onChange={set("email")} autoComplete="off" className={`${CAMPO} ${borda("email")}`} /></Campo>
        <Campo rotulo="Corretor responsável" erro={erros.corretorId}>
          <select value={f.corretorId} onChange={set("corretorId")} className={`${CAMPO} ${borda("corretorId")}`}>
            <option value="">Escolha o corretor</option>
            {corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Observações (opcional)"><textarea value={f.observacoes} onChange={set("observacoes")} rows={3} className="w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 text-sm outline-none focus:border-gold scheme-dark" /></Campo>
        {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
        <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">{enviando ? "Salvando..." : "Salvar cliente"}</button>
      </form>
    </Folha>
  );
}

export default function ClientesPage() {
  usePageTitle("Clientes");
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [corretorId, setCorretorId] = useState("");
  const [novo, setNovo] = useState(false);

  useEffect(() => {
    let ativo = true;
    Promise.all([listarClientes(), listarVendas().catch(() => []), listarMembros().catch(() => [])])
      .then(([c, v, m]) => {
        if (!ativo) return;
        setClientes(c);
        setVendas(v);
        setCorretores(m.filter((x) => x.cargo === "corretor" && x.status === "aprovado" && x.ativo));
      })
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const nomeDoCorretor = useCallback((id) => corretores.find((c) => c.id === id)?.nome ?? "—", [corretores]);
  const vendasDoCliente = useMemo(() => {
    const m = new Map();
    for (const v of vendas) if (v.cliente_id) m.set(v.cliente_id, [...(m.get(v.cliente_id) ?? []), v]);
    return m;
  }, [vendas]);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return clientes.filter((c) => (!corretorId || c.corretorId === corretorId) && (!q || `${c.nome} ${c.email ?? ""} ${c.telefone ?? ""}`.toLowerCase().includes(q)));
  }, [clientes, busca, corretorId]);

  const comVenda = clientes.filter((c) => (vendasDoCliente.get(c.id) ?? []).some((v) => v.status === "confirmada")).length;
  const mes = new Date().getMonth();
  const novosNoMes = clientes.filter((c) => new Date(c.criadoEm).getMonth() === mes && new Date(c.criadoEm).getFullYear() === new Date().getFullYear()).length;

  function exportar() {
    const linhas = [["Nome", "Telefone", "E-mail", "Corretor", "Cadastrado em", "Vendas confirmadas (R$)"]];
    for (const c of visiveis) {
      const total = (vendasDoCliente.get(c.id) ?? []).filter((v) => v.status === "confirmada").reduce((t, v) => t + Number(v.valor), 0);
      linhas.push([c.nome, c.telefone ?? "", c.email ?? "", nomeDoCorretor(c.corretorId), new Date(c.criadoEm).toLocaleDateString("pt-BR"), total.toFixed(2).replace(".", ",")]);
    }
    const csv = "\uFEFF" + linhas.map((l) => l.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), download: "clientes.csv" });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-[13px] text-ink-2">Carteira de todos os corretores.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportar} disabled={!visiveis.length} className="h-11 rounded-xl border border-line px-4 text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink disabled:opacity-40">Exportar CSV</button>
          <button type="button" onClick={() => setNovo(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110"><Icon name="userPlus" className="size-4.5" /> Cadastrar cliente</button>
        </div>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      <div className="grid grid-cols-3 gap-3">
        {[["Clientes", clientes.length], ["Com venda confirmada", comVenda], ["Novos no mês", novosNoMes]].map(([r, n], i) => (
          <div key={r} style={{ animationDelay: `${i * 70}ms` }} className="animate-fade-up rounded-2xl border border-line bg-card p-4">
            <p className="text-[12px] text-ink-3">{r}</p>
            <p className="mt-1 text-2xl font-semibold">{n}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_16rem]">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone" aria-label="Buscar" className={`${CAMPO} border-line focus:border-gold`} />
        <select value={corretorId} onChange={(e) => setCorretorId(e.target.value)} aria-label="Corretor" className={`${CAMPO} border-line`}>
          <option value="">Todos os corretores</option>
          {corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {carregando ? (
        <div className="grid gap-3 lg:grid-cols-2" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : visiveis.length === 0 ? (
        <Vazio>{clientes.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente com esses filtros."}</Vazio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {visiveis.map((c, i) => {
            const confirmadas = (vendasDoCliente.get(c.id) ?? []).filter((v) => v.status === "confirmada");
            return (
              <li key={c.id} style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }} className="animate-fade-up space-y-3 rounded-2xl border border-line bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{c.nome}</h3>
                    <p className="truncate text-[13px] text-ink-2">{mascarar(c.telefone ?? "")}{c.email ? ` · ${c.email}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-[12px] text-ink-3">{dataCurta(c.criadoEm)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Selo tom="azul">Corretor: {nomeDoCorretor(c.corretorId)}</Selo>
                  {confirmadas.length > 0 && <Selo tom="ok">{confirmadas.length} {confirmadas.length === 1 ? "venda" : "vendas"} · {brl(confirmadas.reduce((t, v) => t + Number(v.valor), 0))}</Selo>}
                </div>
                {c.observacoes && <p className="rounded-xl bg-card-2 px-3 py-2 text-[13px] text-ink-2">{c.observacoes}</p>}
                {c.telefone && (
                  <a href={zap(c.telefone, c.nome)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-[#06210f] transition hover:brightness-105">
                    <Icon name="messageCircle" className="size-4.5" /> WhatsApp
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {novo && <NovoCliente corretores={corretores} onClose={() => setNovo(false)} onCriado={(c) => { setClientes((l) => [c, ...l]); setNovo(false); }} />}
    </div>
  );
}