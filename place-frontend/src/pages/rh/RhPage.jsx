import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, CAMPO, Campo, Folha, Selo, Vazio, dataCurta } from "@/components/admin/equipe/ui";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  AREAS, NOME_DA_AREA, STATUS_CANDIDATURA, UNIDADES,
  apagarCandidatura, atualizarCandidatura, atualizarVaga, criarVaga, linkDoCurriculo,
  listarCandidaturas, listarVagas, whatsappDoCandidato,
} from "@/services/trabalheConosco";

const STATUS = Object.fromEntries(STATUS_CANDIDATURA.map(([v, rotulo, tom]) => [v, { rotulo, tom }]));
const fone = (t = "") => (t.length === 11 ? `(${t.slice(0, 2)}) ${t.slice(2, 7)}-${t.slice(7)}` : t);

function Candidatura({ c, onAtualizada, onApagada }) {
  const [aberta, setAberta] = useState(false);
  const [notas, setNotas] = useState(c.notas ?? "");
  const [salvando, setSalvando] = useState(false);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(mudancas) {
    setSalvando(true);
    setErro("");
    try {
      onAtualizada(await atualizarCandidatura(c.id, mudancas));
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function abrirCurriculo() {
    // Abre a aba antes do await para o navegador não bloquear como pop-up.
    const aba = window.open("", "_blank");
    try {
      const url = await linkDoCurriculo(c.id);
      if (aba) aba.location.href = url;
      else window.location.href = url;
    } catch (e) {
      aba?.close();
      setErro(e.message);
    }
  }

  async function apagar() {
    setSalvando(true);
    try {
      await apagarCandidatura(c.id);
      onApagada(c.id);
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  }

  const st = STATUS[c.status] ?? STATUS.novo;
  const aprovadoCorretor = c.status === "aprovado" && c.area === "corretor";

  return (
    <li className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar nome={c.nome} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium">{c.nome}</p>
            <Selo tom={st.tom}>{st.rotulo}</Selo>
            {c.reenvios > 0 && <Selo>Reenviou {c.reenvios}x</Selo>}
          </div>
          <p className="truncate text-[12px] text-ink-3">
            {NOME_DA_AREA[c.area] ?? c.area}{c.unidade ? ` · ${c.unidade}` : ""} · {c.vaga?.titulo ?? "Banco de talentos"} · {dataCurta(c.criado_em)}
          </p>
        </div>
        <button type="button" onClick={() => setAberta((v) => !v)} aria-expanded={aberta} aria-label={aberta ? "Recolher" : "Ver detalhes"}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-gold hover:text-ink">
          <Icon name="chevronDown" className={`size-4.5 transition-transform ${aberta ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <select value={c.status} disabled={salvando} onChange={(e) => salvar({ status: e.target.value })} aria-label="Status"
          className="h-11 rounded-xl border border-line bg-card-2 px-3 text-[13px] text-ink outline-none transition-colors scheme-dark focus:border-gold">
          {STATUS_CANDIDATURA.map(([v, rotulo]) => <option key={v} value={v}>{rotulo}</option>)}
        </select>
        <a href={whatsappDoCandidato(c)} target="_blank" rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-line px-3 text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink">
          <Icon name="messageCircle" className="size-4" /> {fone(c.telefone)}
        </a>
        <a href={`mailto:${c.email}`} className="inline-flex h-11 min-w-0 items-center gap-2 rounded-xl border border-line px-3 text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink">
          <Icon name="mail" className="size-4 shrink-0" /> <span className="truncate">{c.email}</span>
        </a>
        {c.temCurriculo && (
          <button type="button" onClick={abrirCurriculo} className="inline-flex h-11 items-center gap-2 rounded-xl border border-gold/50 px-3 text-[13px] text-gold transition-colors hover:bg-gold/10">
            <Icon name="book" className="size-4" /> Currículo
          </button>
        )}
      </div>

      {aprovadoCorretor && (
        <p className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-300">
          Aprovado como corretor: o botão do WhatsApp já leva o link de cadastro. Depois ele aparece em Equipe → Aprovações.
        </p>
      )}

      {aberta && (
        <div className="animate-fade-in mt-4 space-y-3 border-t border-line-soft pt-4 text-[13px]">
          <dl className="grid gap-2 sm:grid-cols-2">
            {c.creci && <div><dt className="text-ink-3">CRECI</dt><dd>{c.creci}</dd></div>}
            {c.linkedin && <div className="min-w-0"><dt className="text-ink-3">LinkedIn</dt><dd className="truncate"><a href={c.linkedin} target="_blank" rel="noreferrer" className="text-gold hover:underline">{c.linkedin.replace(/^https:\/\/(www\.)?/, "")}</a></dd></div>}
          </dl>
          {c.mensagem && <p className="whitespace-pre-line rounded-xl bg-card-2 p-3 leading-relaxed text-ink-2">{c.mensagem}</p>}
          <Campo rotulo="Anotações do RH (só a equipe vê)">
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={3000} rows={3}
              className="w-full resize-none rounded-xl border border-line bg-card-2 p-3 text-sm text-ink outline-none focus:border-gold" />
          </Campo>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" disabled={salvando || notas === (c.notas ?? "")} onClick={() => salvar({ notas })}
              className="h-11 rounded-xl bg-gold-gradient px-4 text-[13px] font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-50">
              Salvar anotação
            </button>
            {confirmarApagar ? (
              <span className="flex items-center gap-2">
                <span className="text-[12px] text-ink-2">Apagar dados e currículo?</span>
                <button type="button" disabled={salvando} onClick={apagar} className="h-11 rounded-xl border border-danger/50 px-3 text-[13px] text-danger hover:bg-danger/10">Apagar</button>
                <button type="button" onClick={() => setConfirmarApagar(false)} className="h-11 rounded-xl border border-line px-3 text-[13px] text-ink-2">Cancelar</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmarApagar(true)} className="h-11 rounded-xl px-3 text-[12px] text-ink-3 hover:text-danger">
                Apagar a pedido da pessoa (LGPD)
              </button>
            )}
          </div>
        </div>
      )}
      {erro && <p role="alert" className="mt-2 text-[12px] text-danger">{erro}</p>}
    </li>
  );
}

function Candidaturas({ vagas }) {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [status, setStatus] = useState("");
  const [filtros, setFiltros] = useState({ vagaId: "", area: "", unidade: "" });
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    listarCandidaturas(filtros)
      .then((l) => ativo && setLista(l))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => { ativo = false; };
  }, [filtros]);

  const contagem = useMemo(() => Object.fromEntries(STATUS_CANDIDATURA.map(([v]) => [v, lista.filter((c) => c.status === v).length])), [lista]);
  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return lista.filter((c) => (!status || c.status === status) && (!q || `${c.nome} ${c.email} ${c.telefone}`.toLowerCase().includes(q)));
  }, [lista, status, busca]);

  const atualizar = useCallback((nova) => setLista((l) => l.map((c) => (c.id === nova.id ? { ...c, ...nova } : c))), []);
  const remover = useCallback((id) => setLista((l) => l.filter((c) => c.id !== id)), []);
  const setFiltro = (campo) => (e) => setFiltros((s) => ({ ...s, [campo]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Status">
        {[["", "Todas", lista.length], ...STATUS_CANDIDATURA.map(([v, r]) => [v, r, contagem[v]])].map(([v, rotulo, n]) => (
          <button key={v || "todas"} type="button" role="tab" aria-selected={status === v} onClick={() => setStatus(v)}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-[13px] transition-colors ${status === v ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
            {rotulo}
            <span className={`rounded-full px-2 py-0.5 text-xs ${v === "novo" && n > 0 ? "bg-gold text-[#1a1408]" : "bg-white/10"}`}>{n}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, e-mail ou telefone" aria-label="Buscar candidatura" className={`${CAMPO} border-line focus:border-gold`} />
        <select value={filtros.vagaId} onChange={setFiltro("vagaId")} aria-label="Vaga" className={`${CAMPO} border-line focus:border-gold`}>
          <option value="">Todas as vagas</option>
          <option value="banco">Banco de talentos</option>
          {vagas.map((v) => <option key={v.id} value={v.id}>{v.titulo}{v.aberta ? "" : " (fechada)"}</option>)}
        </select>
        <select value={filtros.area} onChange={setFiltro("area")} aria-label="Área" className={`${CAMPO} border-line focus:border-gold`}>
          <option value="">Todas as áreas</option>
          {AREAS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <select value={filtros.unidade} onChange={setFiltro("unidade")} aria-label="Unidade" className={`${CAMPO} border-line focus:border-gold`}>
          <option value="">Todas as unidades</option>
          {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}
      {carregando ? (
        <div className="grid gap-3 lg:grid-cols-2" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : visiveis.length === 0 ? (
        <Vazio>
          {lista.length ? "Nenhuma candidatura com esses filtros." : (
            <>
              Nenhuma candidatura ainda. Elas chegam pela página{" "}
              <a href="/trabalhe-conosco" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-gold hover:underline">Trabalhe conosco</a> do site.
            </>
          )}
        </Vazio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {visiveis.map((c) => <Candidatura key={c.id} c={c} onAtualizada={atualizar} onApagada={remover} />)}
        </ul>
      )}
    </div>
  );
}

const VINCULOS = [["autonomo", "Autônomo"], ["clt", "CLT"], ["estagio", "Estágio"]];
const NOME_DO_VINCULO = Object.fromEntries(VINCULOS);
const hojeIso = () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
const dataLonga = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

/** Como a vaga aparece no Trabalhe conosco (para o RH conferir antes de abrir). */
function PreviaVaga({ f }) {
  const detalhes = [NOME_DA_AREA[f.area], f.unidade || "Qualquer unidade", f.vinculo && NOME_DO_VINCULO[f.vinculo], f.quantidade && `${f.quantidade} ${Number(f.quantidade) === 1 ? "vaga" : "vagas"}`].filter(Boolean);
  return (
    <div className="space-y-2 rounded-xl border border-dashed border-gold/40 bg-page p-4">
      <p className="text-xs font-semibold text-gold">Prévia no site</p>
      <p className="font-semibold">{f.titulo || "Título da vaga"}</p>
      <p className="text-[13px] text-ink-2">{detalhes.join(" · ")}</p>
      {f.descricao && <p className="whitespace-pre-line text-[13px] text-ink-2">{f.descricao}</p>}
      {f.requisitos && <p className="whitespace-pre-line text-[13px] text-ink-2"><b className="text-ink">Requisitos:</b> {f.requisitos}</p>}
      {f.prazo && <p className="text-xs text-ink-3">Candidaturas até {dataLonga(f.prazo)}</p>}
    </div>
  );
}

function ModalVaga({ vaga, onClose, onSalva }) {
  const [f, setF] = useState({
    titulo: vaga?.titulo ?? "", area: vaga?.area ?? "corretor", unidade: vaga?.unidade ?? "", descricao: vaga?.descricao ?? "",
    requisitos: vaga?.requisitos ?? "", vinculo: vaga?.vinculo ?? "", prazo: vaga?.prazo ?? "", quantidade: vaga?.quantidade ?? "",
  });
  const [previa, setPrevia] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (c) => (e) => setF((s) => ({ ...s, [c]: e.target.value }));

  // Vaga nova: "Salvar fechada" guarda sem publicar; "Abrir agora" já aparece no site.
  async function enviar(e, aberta = true) {
    e.preventDefault();
    setEnviando(true);
    setErros({});
    setErroGeral("");
    const dados = { ...f, quantidade: f.quantidade === "" ? null : Number(f.quantidade), ...(vaga ? {} : { aberta }) };
    try {
      onSalva(vaga ? await atualizarVaga(vaga.id, dados) : await criarVaga(dados));
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }
  const borda = (c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");
  return (
    <Folha titulo={vaga ? "Editar vaga" : "Nova vaga"} onClose={onClose}>
      <form onSubmit={enviar} noValidate className="space-y-3.5">
        <Campo rotulo="Título" erro={erros.titulo}><input value={f.titulo} onChange={set("titulo")} maxLength={120} placeholder="Ex.: Corretor(a) de imóveis — Paulista" className={`${CAMPO} ${borda("titulo")}`} /></Campo>
        {/* Um campo por linha: lado a lado, o PC cortava "Corretor(a) de imó". */}
        <div className="grid gap-3.5">
          <Campo rotulo="Área" erro={erros.area}>
            <select value={f.area} onChange={set("area")} className={`${CAMPO} ${borda("area")}`}>
              {AREAS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Unidade" erro={erros.unidade}>
            <select value={f.unidade} onChange={set("unidade")} className={`${CAMPO} ${borda("unidade")}`}>
              <option value="">Qualquer unidade</option>
              {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Campo>
        </div>
        <Campo rotulo="Descrição (aparece no site)" erro={erros.descricao}>
          <textarea value={f.descricao} onChange={set("descricao")} maxLength={2000} rows={4}
            className={`w-full resize-none rounded-xl border bg-card-2 p-3 text-base text-ink outline-none sm:text-sm ${borda("descricao")}`} />
        </Campo>
        <Campo rotulo="Requisitos (opcional)" erro={erros.requisitos}>
          <textarea value={f.requisitos} onChange={set("requisitos")} maxLength={2000} rows={3} placeholder="Ex.: CRECI ativo, carro próprio, disponibilidade aos sábados"
            className={`w-full resize-none rounded-xl border bg-card-2 p-3 text-base text-ink outline-none sm:text-sm ${borda("requisitos")}`} />
        </Campo>
        <div className="grid gap-3.5 sm:grid-cols-3">
          <Campo rotulo="Vínculo" erro={erros.vinculo}>
            <select value={f.vinculo} onChange={set("vinculo")} className={`${CAMPO} ${borda("vinculo")}`}>
              <option value="">Não informar</option>
              {VINCULOS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Inscrições até" erro={erros.prazo}>
            <input type="date" value={f.prazo ?? ""} min={hojeIso()} onChange={set("prazo")} className={`${CAMPO} ${borda("prazo")} scheme-dark`} />
          </Campo>
          <Campo rotulo="Nº de vagas" erro={erros.quantidade}>
            <input type="number" inputMode="numeric" min={1} max={99} value={f.quantidade ?? ""} onChange={set("quantidade")} className={`${CAMPO} ${borda("quantidade")}`} />
          </Campo>
        </div>
        <button type="button" onClick={() => setPrevia((v) => !v)} aria-expanded={previa} className="inline-flex min-h-11 items-center gap-2 text-[13px] text-gold hover:underline">
          <Icon name="eye" className="size-4" /> {previa ? "Esconder prévia" : "Ver como fica no site"}
        </button>
        {previa && <PreviaVaga f={f} />}
        {erroGeral && !Object.keys(erros).length && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
        {vaga ? (
          <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
            {enviando ? "Salvando..." : "Salvar vaga"}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={enviando} onClick={(e) => enviar(e, false)} className="h-12 rounded-xl border border-line text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink disabled:opacity-60">
              Salvar fechada
            </button>
            <button type="submit" disabled={enviando} className="h-12 rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
              {enviando ? "Salvando..." : "Abrir agora"}
            </button>
          </div>
        )}
      </form>
    </Folha>
  );
}

function Vagas({ vagas, setVagas }) {
  const [modal, setModal] = useState(null);
  const [erro, setErro] = useState("");

  async function alternar(v) {
    setErro("");
    try {
      const nova = await atualizarVaga(v.id, { aberta: !v.aberta });
      setVagas((l) => l.map((x) => (x.id === nova.id ? nova : x)));
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-2">Vaga aberta aparece no site. Sem vaga, a candidatura vai para o banco de talentos.</p>
        <button type="button" onClick={() => setModal({})} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110">
          <Icon name="userPlus" className="size-4.5" /> Nova vaga
        </button>
      </div>
      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}
      {vagas.length === 0 ? (
        <Vazio>
          Nenhuma vaga criada. Por enquanto o site recebe tudo pelo banco de talentos.{" "}
          <button type="button" onClick={() => setModal({})} className="inline-flex min-h-11 items-center text-gold hover:underline">Criar a primeira vaga</button>
        </Vazio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {vagas.map((v) => (
            <li key={v.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{v.titulo}</p>
                  <p className="text-[12px] text-ink-3">
                    {NOME_DA_AREA[v.area]}{v.unidade ? ` · ${v.unidade}` : ""}{v.vinculo ? ` · ${NOME_DO_VINCULO[v.vinculo]}` : ""} · criada em {dataCurta(v.criado_em)}
                    {v.prazo ? ` · até ${dataLonga(v.prazo)}` : ""}
                  </p>
                </div>
                <Selo tom={v.aberta ? "ok" : "neutro"}>{v.aberta ? "Aberta" : "Fechada"}</Selo>
              </div>
              {v.descricao && <p className="mt-2 line-clamp-3 whitespace-pre-line text-[13px] text-ink-2">{v.descricao}</p>}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setModal({ vaga: v })} className="h-11 rounded-xl border border-line px-4 text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink">Editar</button>
                <button type="button" onClick={() => alternar(v)}
                  className={`h-11 rounded-xl border px-4 text-[13px] transition-colors ${v.aberta ? "border-line text-ink-2 hover:border-danger/50 hover:text-danger" : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"}`}>
                  {v.aberta ? "Fechar vaga" : "Reabrir"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {modal && (
        <ModalVaga vaga={modal.vaga} onClose={() => setModal(null)}
          onSalva={(v) => { setVagas((l) => (l.some((x) => x.id === v.id) ? l.map((x) => (x.id === v.id ? v : x)) : [v, ...l])); setModal(null); }} />
      )}
    </div>
  );
}

/** Painel do RH. Na área do RH cada aba é uma página do menu; no admin, as abas ficam aqui. */
export default function RhPage({ aba: abaInicial = "candidaturas", comAbas = false }) {
  usePageTitle(abaInicial === "vagas" ? "Vagas" : "Candidaturas");
  const [aba, setAba] = useState(abaInicial);
  const [vagas, setVagas] = useState([]);
  useEffect(() => setAba(abaInicial), [abaInicial]);
  useEffect(() => {
    listarVagas().then(setVagas).catch(() => setVagas([]));
  }, []);

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <p className="pb-eyebrow">Trabalhe conosco</p>
        <h1 className="text-xl font-semibold">{aba === "vagas" ? "Vagas" : "Candidaturas"}</h1>
        <p className="text-[13px] text-ink-2">
          {aba === "vagas" ? "Abra e feche as vagas que aparecem no site." : "Quem se candidatou pelo site. Mude o status, anote e abra o currículo."}
        </p>
      </div>
      {comAbas && (
        <div className="flex gap-2" role="tablist">
          {[["candidaturas", "Candidaturas"], ["vagas", "Vagas"]].map(([id, rotulo]) => (
            <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)}
              className={`h-11 rounded-xl border px-4 text-sm transition-colors ${aba === id ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
              {rotulo}
            </button>
          ))}
        </div>
      )}
      <div key={aba} className="animate-fade-in">
        {aba === "vagas" ? <Vagas vagas={vagas} setVagas={setVagas} /> : <Candidaturas vagas={vagas} />}
      </div>
    </div>
  );
}
