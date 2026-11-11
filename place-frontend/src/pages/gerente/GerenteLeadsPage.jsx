import { useMemo, useState } from "react";
import { reatribuirLead } from "@/services/gerente";
import { CAMPO, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDadosEquipe } from "./useDadosEquipe";

const STATUS = {
  novo: ["ouro", "Novo"],
  em_atendimento: ["azul", "Em atendimento"],
  convertido: ["ok", "Convertido"],
  perdido: ["neutro", "Perdido"],
};
const dataCurta = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

function Reatribuir({ lead, membros, onFeito, onErro }) {
  const [destino, setDestino] = useState("");
  const [salvando, setSalvando] = useState(false);
  const opcoes = membros.filter((m) => m.ativo && m.id !== lead.corretor?.id);
  const nomeDestino = membros.find((m) => m.id === destino)?.nome;

  async function confirmar() {
    setSalvando(true);
    try {
      onFeito(await reatribuirLead(lead.id, destino), nomeDestino);
      setDestino("");
    } catch (e) {
      onErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (opcoes.length === 0) return null;
  return destino ? (
    <div className="animate-fade-in space-y-2 rounded-xl border border-gold/30 p-3">
      <p className="text-[13px] text-ink-2">Passar este lead para <strong className="text-ink">{nomeDestino}</strong>?</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setDestino("")} className="h-11 rounded-xl border border-line text-sm text-ink-2">Voltar</button>
        <button type="button" disabled={salvando} onClick={confirmar} className="h-11 rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] disabled:opacity-60">{salvando ? "Passando..." : "Confirmar"}</button>
      </div>
    </div>
  ) : (
    <select value="" onChange={(e) => setDestino(e.target.value)} aria-label={`Reatribuir ${lead.nome}`} className="h-11 w-full rounded-xl border border-line bg-card-2 px-3 text-sm text-ink-2 outline-none focus:border-gold">
      <option value="">Passar para outro corretor…</option>
      {opcoes.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
    </select>
  );
}

export default function GerenteLeadsPage() {
  usePageTitle("Leads da equipe");
  const { membros, leads, carregando, erro, atualizarLead } = useDadosEquipe();
  const [aviso, setAviso] = useState("");
  const [falha, setFalha] = useState("");
  const [busca, setBusca] = useState("");
  const [corretorId, setCorretorId] = useState("");
  const [status, setStatus] = useState("");

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return leads
      .filter((l) => (!corretorId || l.corretor?.id === corretorId) && (!status || l.status === status) && (!q || `${l.nome} ${l.email ?? ""} ${l.telefone ?? ""} ${l.empreendimento?.nome ?? ""}`.toLowerCase().includes(q)))
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  }, [leads, busca, corretorId, status]);

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <p className="pb-eyebrow">Gestão do funil</p>
        <h1 className="text-xl font-semibold">Leads da equipe</h1>
        <p className="text-[13px] text-ink-2">{leads.length} {leads.length === 1 ? "lead" : "leads"} com os seus corretores. Você pode passar um lead de um corretor para outro da equipe; os que chegam do site são distribuídos pelo admin.</p>
      </div>
      {(erro || falha) && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro || falha}</p>}
      {aviso && <p role="status" className="animate-fade-in rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{aviso}</p>}

      <div className="grid gap-2 sm:grid-cols-[1fr_14rem_12rem]">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, contato ou empreendimento" aria-label="Buscar" className={`${CAMPO} border-line focus:border-gold`} />
        <select value={corretorId} onChange={(e) => setCorretorId(e.target.value)} aria-label="Corretor" className={`${CAMPO} border-line`}>
          <option value="">Todos os corretores</option>
          {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className={`${CAMPO} border-line`}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS).map(([k, [, r]]) => <option key={k} value={k}>{r}</option>)}
        </select>
      </div>

      {carregando ? (
        <div className="grid gap-3 lg:grid-cols-2" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : visiveis.length === 0 ? (
        <Vazio>{leads.length === 0 ? "Nenhum lead com os seus corretores ainda." : "Nenhum lead com esses filtros."}</Vazio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {visiveis.map((l, i) => {
            const [tom, rotulo] = STATUS[l.status] ?? STATUS.novo;
            return (
              <li key={l.id} style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }} className="animate-fade-up space-y-2 rounded-2xl border border-line bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{l.nome}</h3>
                    <p className="truncate text-[13px] text-ink-2">{l.empreendimento?.nome ?? "Interesse geral"} · {dataCurta(l.criadoEm)}</p>
                  </div>
                  <Selo tom={tom}>{rotulo}</Selo>
                </div>
                <p className="text-[13px] text-ink-2">{l.telefone}{l.email ? ` · ${l.email}` : ""}</p>
                {l.mensagem && <p className="rounded-xl bg-card-2 px-3 py-2 text-[13px] text-ink-2">{l.mensagem}</p>}
                <p className="text-[12px] text-ink-3">Corretor: <span className="text-ink-2">{l.corretor?.nome}</span></p>
                <Reatribuir lead={l} membros={membros} onErro={(m) => { setAviso(""); setFalha(m); }} onFeito={(novo, nome) => { setFalha(""); atualizarLead(novo); setAviso(`Lead de ${novo.nome} passou para ${nome}.`); }} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}