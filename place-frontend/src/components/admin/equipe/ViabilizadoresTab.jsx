import { useState } from "react";
import { Avatar, CAMPO, Selo, Vazio } from "./ui";

function Linha({ v, construtoras, onMudar }) {
  const [salvando, setSalvando] = useState(false);
  async function aplicar(mudancas) {
    setSalvando(true);
    try {
      await onMudar(v.id, mudancas);
    } catch {
    } finally {
      setSalvando(false);
    }
  }
  return (
    <li className="space-y-3 rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar nome={v.nome} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{v.nome}</p>
          <p className="truncate text-[12px] text-ink-3">{v.email}</p>
        </div>
        {!v.ativo && <Selo tom="perigo">Inativo</Selo>}
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="block text-xs text-ink-2">
          Construtora
          <select value={v.construtora_id ?? ""} disabled={salvando} onChange={(e) => aplicar({ construtoraId: e.target.value })} className={`${CAMPO} mt-1.5 ${v.construtora_id ? "border-line" : "border-danger"} focus:border-gold`}>
            <option value="">Sem construtora</option>
            {construtoras.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <button type="button" disabled={salvando} onClick={() => aplicar({ ativo: !v.ativo })}
          className={`h-12 self-end rounded-xl border px-4 text-sm transition-colors disabled:opacity-50 ${v.ativo ? "border-line text-ink-2 hover:border-danger/50 hover:text-danger" : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"}`}>
          {v.ativo ? "Desativar" : "Reativar"}
        </button>
      </div>
      {!v.construtora_id && <p className="text-[12px] text-danger">Sem construtora, ele não enxerga nenhum produto.</p>}
    </li>
  );
}

export default function ViabilizadoresTab({ viabilizadores, construtoras, onMudar }) {
  if (viabilizadores.length === 0) return <Vazio>Nenhum viabilizador aprovado ainda. Os cadastros novos aparecem em Aprovações.</Vazio>;
  return (
    <div className="space-y-3">
      <p className="text-[12px] text-ink-3">O viabilizador só vê e atualiza os empreendimentos da construtora a que está vinculado.</p>
      <ul className="grid gap-3 lg:grid-cols-2">
        {viabilizadores.map((v) => <Linha key={v.id} v={v} construtoras={construtoras} onMudar={onMudar} />)}
      </ul>
    </div>
  );
}