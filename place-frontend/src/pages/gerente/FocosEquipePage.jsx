import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/cn";
import { listarFocos, salvarFocos } from "@/services/roleta";
import { SEGMENTOS } from "@/lib/precoCatalogo";

const norm = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function EditorFocos({ corretor, empreendimentos, onSalvo, onFechar, equipe = [] }) {
  const [marcados, setMarcados] = useState(() => new Set(corretor.focos));
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const grupos = useMemo(() => {
    const q = norm(busca.trim());
    const lista = empreendimentos.filter((e) => !q || norm(`${e.nome} ${e.bairro ?? ""} ${e.cidade ?? ""}`).includes(q));
    const porSegmento = new Map();
    for (const e of lista) {
      const chave = e.segmento || "Outros";
      porSegmento.set(chave, [...(porSegmento.get(chave) ?? []), e]);
    }
    return [...porSegmento.entries()].sort(([a], [b]) => (SEGMENTOS[a] ?? a).localeCompare(SEGMENTOS[b] ?? b, "pt-BR"));
  }, [empreendimentos, busca]);

  const alternar = (id) => setMarcados((atual) => {
    const novo = new Set(atual);
    if (novo.has(id)) novo.delete(id); else novo.add(id);
    return novo;
  });

  // "Toda a equipe": numa campanha forte o gerente coloca todo mundo no mesmo empreendimento de uma vez.
  async function salvar(paraEquipe = false) {
    setSalvando(true);
    setErro("");
    try {
      const alvos = paraEquipe ? equipe : [corretor];
      const resultados = [];
      for (const c of alvos) resultados.push([c.id, (await salvarFocos(c.id, [...marcados])).focos]);
      onSalvo(new Map(resultados));
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center" role="dialog" aria-modal="true" aria-label={`Focos de ${corretor.nome}`}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-line bg-card sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line-soft p-4">
          <div>
            <h2 className="text-[16px] font-semibold">Focos de {corretor.nome.split(" ")[0]}</h2>
            <p className="text-[12px] text-ink-2">{marcados.size} empreendimento{marcados.size === 1 ? "" : "s"} marcado{marcados.size === 1 ? "" : "s"}</p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="grid size-11 place-items-center rounded-full hover:bg-white/5">
            <Icon name="x" className="size-5" />
          </button>
        </div>
        <div className="p-4 pb-2">
          <label className="relative block">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar empreendimento ou bairro"
              className="h-11 w-full rounded-xl border border-line bg-card-2 pl-10 pr-3.5 text-base text-ink outline-none focus:border-gold scheme-dark sm:text-sm" />
          </label>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {grupos.map(([segmento, lista]) => (
            <fieldset key={segmento} className="mb-4">
              <legend className="mb-1.5 flex w-full items-center justify-between gap-2 text-[13px] font-semibold text-gold">
                {SEGMENTOS[segmento] ?? segmento}
                <button type="button" onClick={() => setMarcados((atual) => {
                  const novo = new Set(atual);
                  const todos = lista.every((e) => novo.has(e.id));
                  for (const e of lista) (todos ? novo.delete(e.id) : novo.add(e.id));
                  return novo;
                })} className="inline-flex min-h-11 items-center px-2 text-xs font-medium normal-case tracking-normal text-ink-2 hover:text-gold">
                  {lista.every((e) => marcados.has(e.id)) ? "Desmarcar todos" : "Marcar todos"}
                </button>
              </legend>
              {lista.map((e) => (
                <label key={e.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
                  <input type="checkbox" checked={marcados.has(e.id)} onChange={() => alternar(e.id)} className="size-4.5 accent-[#c9a54c]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px]">{e.nome}</span>
                    {(e.bairro || e.cidade) && <small className="block truncate text-xs text-ink-3">{[e.bairro, e.cidade].filter(Boolean).join(", ")}</small>}
                  </span>
                </label>
              ))}
            </fieldset>
          ))}
          {grupos.length === 0 && <p className="py-6 text-center text-[13px] text-ink-2">Nenhum empreendimento encontrado.</p>}
        </div>
        <div className="border-t border-line-soft p-4">
          {erro && <p role="alert" className="mb-2 text-[13px] text-danger">{erro}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setMarcados(new Set())} className="min-h-11 rounded-xl border border-line px-4 text-[13px] text-ink-2 hover:text-ink">
              Limpar
            </button>
            <Button className="flex-1" disabled={salvando} onClick={() => salvar(false)}>{salvando ? "Salvando…" : "Salvar focos"}</Button>
          </div>
          {equipe.length > 1 && (
            <button type="button" disabled={salvando} onClick={() => salvar(true)}
              className="mt-2 min-h-11 w-full rounded-xl text-[13px] text-gold hover:underline disabled:opacity-50">
              Aplicar estes focos a toda a equipe ({equipe.length} corretores)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Gerente escolhe em quais empreendimentos cada corretor recebe leads da roleta. */
export default function FocosEquipePage() {
  usePageTitle("Focos da equipe");
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    listarFocos().then(setDados).catch((e) => setErro(e.message));
  }, []);

  const nomes = useMemo(() => new Map((dados?.empreendimentos ?? []).map((e) => [e.id, e.nome])), [dados]);
  const corretores = useMemo(() => {
    const q = norm(busca.trim());
    return (dados?.corretores ?? []).filter((c) => !q || norm(c.nome).includes(q));
  }, [dados, busca]);

  if (!dados) return <div className="grid min-h-[50vh] place-items-center text-ink-2">{erro || "Carregando…"}</div>;

  const atual = dados.corretores.find((c) => c.id === editando);
  const semFoco = dados.corretores.filter((c) => c.focos.length === 0).length;

  return (
    <div className="space-y-5">
      <header>
        <p className="pb-eyebrow">Roleta de leads</p>
        <h1 className="text-xl font-semibold">Focos da equipe</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-2">
          Marque em quais empreendimentos cada corretor recebe leads. Lead de um empreendimento vai só para quem tem foco nele;
          se ninguém apto tem foco, o lead fica com o administrador para atribuir.
        </p>
        {semFoco > 0 && (
          <p role="status" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[13px] text-amber-300">
            <Icon name="bell" className="size-4" /> {semFoco} {semFoco === 1 ? "corretor sem foco: não recebe" : "corretores sem foco: não recebem"} leads da roleta.
          </p>
        )}
      </header>

      {dados.corretores.length > 6 && (
        <label className="relative block max-w-sm">
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar corretor"
            className="h-11 w-full rounded-xl border border-line bg-card-2 pl-10 pr-3.5 text-base text-ink outline-none focus:border-gold scheme-dark sm:text-sm" />
        </label>
      )}

      {dados.corretores.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-2">Nenhum corretor ativo na sua equipe.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {corretores.map((c) => (
            <li key={c.id}>
              <Card className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <b className="block truncate text-[15px] font-semibold">{c.nome}</b>
                    {c.equipe && <small className="text-[12px] text-ink-3">{c.equipe}</small>}
                  </div>
                  <button type="button" onClick={() => setEditando(c.id)} className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-gold/50 px-4 text-[13px] text-gold hover:bg-gold/10">
                    Editar
                  </button>
                </div>
                {c.focos.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[13px] text-amber-300">
                    <Icon name="bell" className="size-4 shrink-0" /> Sem foco: não recebe leads da roleta.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {c.focos.map((id) => (
                      <span key={id} className={cn("rounded-full bg-gold/10 px-2.5 py-1 text-[12px] text-gold")}>{nomes.get(id) ?? "Empreendimento"}</span>
                    ))}
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {atual && (
        <EditorFocos
          corretor={atual}
          equipe={dados.corretores}
          empreendimentos={dados.empreendimentos}
          onFechar={() => setEditando(null)}
          onSalvo={(porCorretor) => {
            setDados((d) => ({ ...d, corretores: d.corretores.map((c) => (porCorretor.has(c.id) ? { ...c, focos: porCorretor.get(c.id) } : c)) }));
            setEditando(null);
          }}
        />
      )}
    </div>
  );
}
