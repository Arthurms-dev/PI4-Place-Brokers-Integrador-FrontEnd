import { useState } from "react";
import { Avatar, Selo, Vazio, dataCurta } from "./ui";

export default function AprovacoesTab({ pendentes, onMudar }) {
  const [ocupado, setOcupado] = useState(null);
  const [recusando, setRecusando] = useState(null);

  async function decidir(id, status) {
    setOcupado(id);
    try {
      await onMudar(id, { status });
    } catch {
    } finally {
      setOcupado(null);
      setRecusando(null);
    }
  }

  if (pendentes.length === 0) return <Vazio>Nenhum cadastro aguardando aprovação.</Vazio>;

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {pendentes.map((m, i) => (
        <li key={m.id} style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }} className="animate-fade-up space-y-3 rounded-2xl border border-line bg-card p-4">
          <div className="flex items-start gap-3">
            <Avatar nome={m.nome} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{m.nome}</h3>
              <p className="truncate text-[13px] text-ink-2">{m.email}{m.telefone ? ` · ${m.telefone}` : ""}</p>
            </div>
            <span className="shrink-0 text-[12px] text-ink-3">{dataCurta(m.criado_em)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Selo tom="azul">{m.cargo === "viabilizador" ? "Viabilizador" : "Corretor"}</Selo>
            {m.cargo === "corretor" && <Selo tom={m.vinculo === "externo" ? "alerta" : "ouro"}>{m.vinculo === "externo" ? "Autônomo" : "Place"}</Selo>}
            {m.creci ? <Selo>CRECI {m.creci}</Selo> : m.vinculo === "externo" && <Selo tom="perigo">Sem CRECI</Selo>}
          </div>
          {m.vinculo === "externo" && <p className="text-[12px] text-ink-3">Confira o CRECI no conselho antes de aprovar.</p>}

          {recusando === m.id ? (
            <div className="animate-fade-in grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRecusando(null)} className="h-12 rounded-xl border border-line text-sm text-ink-2">Voltar</button>
              <button type="button" disabled={ocupado === m.id} onClick={() => decidir(m.id, "recusado")} className="h-12 rounded-xl bg-danger text-sm font-semibold text-white disabled:opacity-60">Confirmar recusa</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={ocupado === m.id} onClick={() => setRecusando(m.id)} className="h-12 rounded-xl border border-danger/40 text-sm font-medium text-danger transition-colors hover:bg-danger/10">Recusar</button>
              <button type="button" disabled={ocupado === m.id} onClick={() => decidir(m.id, "aprovado")} className="h-12 rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
                {ocupado === m.id ? "Salvando..." : "Aprovar"}
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}