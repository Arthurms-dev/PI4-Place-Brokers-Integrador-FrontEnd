import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Avatar, CAMPO, SEDES, Selo, Vazio } from "./ui";

function Membro({ m, times, onMudar }) {
  const [salvando, setSalvando] = useState(false);
  async function mover(equipeId) {
    setSalvando(true);
    try {
      await onMudar(m.id, { equipeId });
    } catch {
    } finally {
      setSalvando(false);
    }
  }
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar nome={m.nome} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{m.nome}</div>
        <div className="truncate text-[11px] text-ink-3">{m.email}</div>
      </div>
      <select value={m.equipe_id ?? ""} disabled={salvando} onChange={(e) => mover(e.target.value)} aria-label={`Equipe de ${m.nome}`}
        className="h-11 max-w-[9.5rem] rounded-xl border border-line bg-card-2 px-2 text-[13px] outline-none focus:border-gold scheme-dark">
        <option value="">Sem equipe</option>
        {times.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
      </select>
    </li>
  );
}

function CartaoEquipe({ time, membros, times, onMudar, onEditar, onRemover, indice }) {
  const [aberto, setAberto] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  return (
    <li style={{ animationDelay: `${Math.min(indice, 5) * 60}ms` }} className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-card">
      <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className="flex w-full items-center gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{time.nome}</h3>
          <p className="truncate text-[13px] text-ink-2">Gerente: {time.gerente?.nome ?? "—"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {time.diretoria && <Selo tom="azul">{time.diretoria.nome}</Selo>}
            <Selo tom="ouro">{time.totalMembros} {time.totalMembros === 1 ? "corretor" : "corretores"}</Selo>
          </div>
        </div>
        <Icon name="chevronRight" className={`size-5 shrink-0 text-ink-3 transition-transform duration-300 ${aberto ? "rotate-90" : ""}`} />
      </button>

      {aberto && (
        <div className="animate-fade-in space-y-3 border-t border-line-soft p-4">
          {membros.length === 0 ? (
            <p className="text-[13px] text-ink-3">Nenhum corretor nesta equipe ainda. Direcione corretores sem equipe pela lista abaixo.</p>
          ) : (
            <ul className="divide-y divide-line-soft">{membros.map((m) => <Membro key={m.id} m={m} times={times} onMudar={onMudar} />)}</ul>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onEditar(time)} className="h-11 rounded-xl border border-line text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink">Editar</button>
            {removendo ? (
              <button type="button" onClick={() => onRemover(time)} className="h-11 rounded-xl bg-danger text-sm font-semibold text-white">Confirmar exclusão</button>
            ) : (
              <button type="button" onClick={() => setRemovendo(true)} className="h-11 rounded-xl border border-danger/40 text-sm text-danger transition-colors hover:bg-danger/10">Excluir</button>
            )}
          </div>
          {removendo && <p className="text-[12px] text-ink-3">Os corretores ficam sem equipe; nada é apagado deles.</p>}
        </div>
      )}
    </li>
  );
}

export default function EquipesTab({ times, diretorias, corretoresPlace, gerentes, onMudar, onNovaEquipe, onEditar, onRemover, onNovaDiretoria, onNovoGerente }) {
  const [sede, setSede] = useState("");
  const [diretoriaId, setDiretoriaId] = useState("");

  const filtrados = useMemo(() => times.filter((t) => (!sede || t.sede === sede) && (!diretoriaId || t.diretoriaId === diretoriaId)), [times, sede, diretoriaId]);
  const grupos = useMemo(() => {
    const porSede = [...SEDES, null].map((s) => [s, filtrados.filter((t) => (t.sede ?? null) === s)]);
    return porSede.filter(([, lista]) => lista.length > 0);
  }, [filtrados]);
  const semEquipe = corretoresPlace.filter((m) => !m.equipe_id);
  let indice = 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onNovaEquipe} className="h-11 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110">Nova equipe</button>
        <button type="button" onClick={onNovaDiretoria} className="h-11 rounded-xl border border-line px-5 text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink">Nova diretoria</button>
        <button type="button" onClick={onNovoGerente} className="h-11 rounded-xl border border-line px-5 text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink">Novo gerente</button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="Sede">
          {["", ...SEDES].map((s) => (
            <button key={s || "todas"} type="button" onClick={() => setSede(s)} aria-pressed={sede === s}
              className={`h-11 shrink-0 rounded-full border px-4 text-[13px] transition-colors ${sede === s ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
              {s || "Todas as sedes"}
            </button>
          ))}
        </div>
        <select value={diretoriaId} onChange={(e) => setDiretoriaId(e.target.value)} aria-label="Diretoria" className={`${CAMPO} border-line sm:ml-auto sm:max-w-xs`}>
          <option value="">Todas as diretorias</option>
          {diretorias.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      </div>

      {gerentes.length > 0 && (
        <p className="text-[13px] text-ink-3">Gerentes: {gerentes.map((g) => g.nome).join(" · ")}</p>
      )}

      {grupos.length === 0 ? (
        <Vazio>{times.length === 0 ? "Nenhuma equipe criada ainda. Comece criando uma diretoria e depois a primeira equipe." : "Nenhuma equipe com esses filtros."}</Vazio>
      ) : (
        grupos.map(([nomeSede, lista]) => (
          <section key={nomeSede ?? "sem"} className="space-y-2">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-ink-2"><Icon name="mapPin" className="size-4 text-gold" /> {nomeSede ?? "Sem sede definida"} <span className="text-ink-3">({lista.length})</span></h2>
            <ul className="grid gap-3 lg:grid-cols-2">
              {lista.map((t) => (
                <CartaoEquipe key={t.id} time={t} indice={indice++} times={times} membros={corretoresPlace.filter((m) => m.equipe_id === t.id)} onMudar={onMudar} onEditar={onEditar} onRemover={onRemover} />
              ))}
            </ul>
          </section>
        ))
      )}

      {semEquipe.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[13px] font-medium text-ink-2">Corretores da Place sem equipe ({semEquipe.length})</h2>
          <ul className="animate-fade-up divide-y divide-line-soft rounded-2xl border border-line bg-card px-4">
            {semEquipe.map((m) => <Membro key={m.id} m={m} times={times} onMudar={onMudar} />)}
          </ul>
        </section>
      )}
    </div>
  );
}