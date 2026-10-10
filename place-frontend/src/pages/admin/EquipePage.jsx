import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import AprovacoesTab from "@/components/admin/equipe/AprovacoesTab";
import CorretoresTab from "@/components/admin/equipe/CorretoresTab";
import EquipesTab from "@/components/admin/equipe/EquipesTab";
import { ModalDiretoria, ModalEquipe, ModalGerente } from "@/components/admin/equipe/modais";
import { ehAutonomo } from "@/components/admin/equipe/ui";
import * as api from "@/services/admin/equipe";

export default function EquipePage() {
  usePageTitle("Equipe");
  const [membros, setMembros] = useState([]);
  const [times, setTimes] = useState([]);
  const [diretorias, setDiretorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState("equipes");
  const [modal, setModal] = useState(null);
  const abaDefinida = useRef(false);

  const recarregar = useCallback(async () => {
    try {
      const [m, t, d] = await Promise.all([api.listarMembros(), api.listarTimes(), api.listarDiretorias()]);
      setMembros(m);
      setTimes(t);
      setDiretorias(d);
      if (!abaDefinida.current) {
        abaDefinida.current = true;
        if (m.some((x) => x.status === "pendente" && ["corretor", "viabilizador"].includes(x.cargo))) setAba("aprovacoes");
      }
    } catch (e) {
      setErro(e.message ?? "Não foi possível carregar a equipe.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const mudar = useCallback(async (id, corpo) => {
    setErro("");
    try {
      const atualizado = await api.atualizarMembro(id, corpo);
      setMembros((l) => l.map((m) => (m.id === id ? { ...m, ...atualizado } : m)));
      if ("equipeId" in corpo || "status" in corpo) api.listarTimes().then(setTimes).catch(() => {});
      return atualizado;
    } catch (e) {
      setErro(e.message);
      throw e;
    }
  }, []);

  const removerTime = useCallback(async (time) => {
    setErro("");
    try {
      await api.removerTime(time.id);
      await recarregar();
    } catch (e) {
      setErro(e.message);
    }
  }, [recarregar]);

  const pendentes = useMemo(() => membros.filter((m) => m.status === "pendente" && ["corretor", "viabilizador"].includes(m.cargo)), [membros]);
  const corretores = useMemo(() => membros.filter((m) => m.cargo === "corretor"), [membros]);
  const aprovadosPlace = useMemo(() => corretores.filter((m) => m.status === "aprovado" && m.ativo && !ehAutonomo(m)), [corretores]);
  const gerentes = useMemo(() => membros.filter((m) => m.cargo === "gerente"), [membros]);
  const autonomos = useMemo(() => corretores.filter(ehAutonomo), [corretores]);

  const abas = [
    ["aprovacoes", "Aprovações", pendentes.length],
    ["equipes", "Equipes da Place", times.length],
    ["autonomos", "Autônomos", autonomos.length],
    ["todos", "Todos os corretores", corretores.length],
  ];

  if (carregando) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Carregando equipe">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-card" />
        <div className="h-11 w-full max-w-xl animate-pulse rounded-xl bg-card" />
        <div className="grid gap-3 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold">Equipe</h1>
        <p className="text-[13px] text-ink-2">Aprove cadastros, monte equipes por sede e diretoria e acompanhe os corretores.</p>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" role="tablist">
        {abas.map(([id, rotulo, n]) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm transition-colors ${aba === id ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
            {rotulo}
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${id === "aprovacoes" && n > 0 ? "bg-gold text-[#1a1408]" : "bg-white/10"}`}>{n}</span>
          </button>
        ))}
      </div>

      <div key={aba} className="animate-fade-in">
        {aba === "aprovacoes" && <AprovacoesTab pendentes={pendentes} onMudar={mudar} />}
        {aba === "equipes" && (
          <EquipesTab
            times={times} diretorias={diretorias} corretoresPlace={aprovadosPlace} gerentes={gerentes} onMudar={mudar}
            onNovaEquipe={() => setModal({ tipo: "equipe" })} onEditar={(time) => setModal({ tipo: "equipe", time })}
            onRemover={removerTime} onNovaDiretoria={() => setModal({ tipo: "diretoria" })} onNovoGerente={() => setModal({ tipo: "gerente" })}
          />
        )}
        {aba === "autonomos" && <CorretoresTab modo="autonomos" corretores={corretores} times={times} onMudar={mudar} />}
        {aba === "todos" && <CorretoresTab modo="todos" corretores={corretores} times={times} onMudar={mudar} />}
      </div>

      {modal?.tipo === "equipe" && (
        <ModalEquipe key={modal.time?.id ?? "nova"} time={modal.time} diretorias={diretorias} gerentes={gerentes} onClose={() => setModal(null)}
          onSalvo={async () => { setModal(null); await recarregar(); }} />
      )}
      {modal?.tipo === "diretoria" && (
        <ModalDiretoria onClose={() => setModal(null)} onSalvo={async () => { setModal(null); await recarregar(); }} />
      )}
      {modal?.tipo === "gerente" && (
        <ModalGerente onClose={() => setModal(null)} onSalvo={async () => { setModal(null); await recarregar(); }} />
      )}
    </div>
  );
}