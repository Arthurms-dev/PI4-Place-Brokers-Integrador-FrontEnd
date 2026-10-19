import { useMemo, useState } from "react";
import { Avatar, CAMPO, Selo, Vazio, ehAutonomo, nomeReservado, ufDe } from "./ui";

const STATUS = { aprovado: ["ok", "Aprovado"], pendente: ["alerta", "Pendente"], recusado: ["perigo", "Recusado"] };

function Linha({ m, times, onMudar, mostrarEquipe }) {
  const [salvando, setSalvando] = useState(false);
  const autonomo = ehAutonomo(m);
  const [tom, rotulo] = STATUS[m.status] ?? STATUS.pendente;
  const time = times.find((t) => t.id === m.equipe_id);

  async function alternar() {
    setSalvando(true);
    try {
      await onMudar(m.id, { ativo: !m.ativo });
    } catch {
    } finally {
      setSalvando(false);
    }
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar nome={autonomo ? nomeReservado(m.nome) : m.nome} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-medium">{autonomo ? nomeReservado(m.nome) : m.nome}</span>
          {autonomo ? <Selo tom="alerta">Autônomo</Selo> : <Selo tom="ouro">Place</Selo>}
          {m.status !== "aprovado" && <Selo tom={tom}>{rotulo}</Selo>}
          {!m.ativo && <Selo tom="perigo">Inativo</Selo>}
        </div>
        <div className="truncate text-[11px] text-ink-3">
          {autonomo ? (m.creci ? "CRECI informado" : "Sem CRECI") : mostrarEquipe ? (time?.nome ?? "Sem equipe") : m.email}
        </div>
      </div>
      {m.status === "aprovado" && (
        <button type="button" disabled={salvando} onClick={alternar} aria-pressed={m.ativo}
          className={`h-11 shrink-0 rounded-xl border px-4 text-[13px] transition-colors disabled:opacity-50 ${m.ativo ? "border-line text-ink-2 hover:border-danger/50 hover:text-danger" : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"}`}>
          {m.ativo ? "Desativar" : "Reativar"}
        </button>
      )}
    </li>
  );
}

export default function CorretoresTab({ modo, corretores, times, onMudar }) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return corretores
      .filter((m) => (modo === "autonomos" ? ehAutonomo(m) : true))
      .filter((m) => !status || m.status === status)
      .filter((m) => !q || (ehAutonomo(m) ? nomeReservado(m.nome) : m.nome).toLowerCase().includes(q));
  }, [corretores, modo, busca, status]);

  const porUf = useMemo(() => {
    if (modo !== "autonomos") return [];
    const mapa = new Map();
    for (const m of lista) {
      const uf = ufDe(m) ?? "—";
      mapa.set(uf, [...(mapa.get(uf) ?? []), m]);
    }
    return [...mapa.entries()].sort(([a], [b]) => (a === "—") - (b === "—") || a.localeCompare(b));
  }, [lista, modo]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome" aria-label="Buscar" className={`${CAMPO} border-line focus:border-gold`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className={`${CAMPO} border-line sm:w-48`}>
          <option value="">Todos os status</option>
          <option value="aprovado">Aprovados</option>
          <option value="pendente">Pendentes</option>
          <option value="recusado">Recusados</option>
        </select>
      </div>

      {modo === "autonomos" && <p className="text-[12px] text-ink-3">Por sigilo, aparecem só o primeiro e o segundo nome. Só entram os estados que têm corretor cadastrado.</p>}

      {lista.length === 0 ? (
        <Vazio>{modo === "autonomos" ? "Nenhum corretor autônomo encontrado." : "Nenhum corretor encontrado."}</Vazio>
      ) : modo === "autonomos" ? (
        porUf.map(([uf, grupo]) => (
          <section key={uf} className="animate-fade-up space-y-2">
            <h2 className="text-[13px] font-medium text-ink-2">{uf === "—" ? "Estado não informado" : uf} <span className="text-ink-3">({grupo.length})</span></h2>
            <ul className="divide-y divide-line-soft rounded-2xl border border-line bg-card px-4">
              {grupo.map((m) => <Linha key={m.id} m={m} times={times} onMudar={onMudar} />)}
            </ul>
          </section>
        ))
      ) : (
        <ul className="animate-fade-up divide-y divide-line-soft rounded-2xl border border-line bg-card px-4">
          {lista.map((m) => <Linha key={m.id} m={m} times={times} onMudar={onMudar} mostrarEquipe />)}
        </ul>
      )}
    </div>
  );
}