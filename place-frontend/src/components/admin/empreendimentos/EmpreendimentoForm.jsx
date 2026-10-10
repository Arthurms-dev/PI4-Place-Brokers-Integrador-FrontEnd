import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CAMPO, Campo, Folha } from "@/components/admin/equipe/ui";
import { criarConstrutora } from "@/services/construtoras";
import { atualizarEmpreendimento, criarEmpreendimento } from "@/services/empreendimentos";

const MiniMapa = lazy(() => import("@/components/site/MiniMapa"));
const MAX_ARQUIVO = 15 * 1024 * 1024;

const borda = (erros, c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");
const num = (v) => (v === "" || v == null ? null : Number(v));

export function lerCoords(texto = "") {
  const t = texto.trim();
  if (!t) return { vazio: true };
  const m = t.match(/^(-?\d{1,3}(?:\.\d+)?)\s*[,;]?\s+(-?\d{1,3}(?:\.\d+)?)$|^(-?\d{1,3}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (!m) return { erro: "Use o formato -8.0476, -34.8770 (copie do Google Maps)." };
  const lat = Number(m[1] ?? m[3]);
  const lng = Number(m[2] ?? m[4]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return { erro: "Coordenadas fora do intervalo válido." };
  return { lat, lng };
}

function Secao({ titulo, children }) {
  return (
    <fieldset className="space-y-3.5 border-t border-line-soft pt-4">
      <legend className="-mt-7 mb-1 bg-card pr-3 text-[13px] font-semibold text-gold">{titulo}</legend>
      {children}
    </fieldset>
  );
}

function Arquivo({ rotulo, accept, arquivo, onChange, dica, erro }) {
  const ref = useRef(null);
  return (
    <div className={`rounded-xl border border-dashed p-3 ${erro ? "border-danger" : "border-line"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-ink-2">{rotulo}</div>
          <div className="truncate text-[13px]">{arquivo ? arquivo.name : dica}</div>
        </div>
        <div className="flex shrink-0 gap-2">
          {arquivo && <button type="button" onClick={() => onChange(null)} className="h-11 rounded-xl border border-line px-3 text-sm text-ink-2 hover:text-danger">Remover</button>}
          <button type="button" onClick={() => ref.current?.click()} className="h-11 rounded-xl border border-line px-4 text-sm transition-colors hover:border-gold">{arquivo ? "Trocar" : "Escolher"}</button>
        </div>
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => { onChange(e.target.files?.[0] ?? null); e.target.value = ""; }} />
      {erro && <p className="mt-1 text-[11px] text-danger">{erro}</p>}
    </div>
  );
}

function Interruptor({ ativo, onChange, rotulo, ajuda }) {
  return (
    <button type="button" role="switch" aria-checked={ativo} onClick={() => onChange(!ativo)}
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2 text-left transition-colors hover:border-gold/60">
      <span>
        <span className="block text-sm">{rotulo}</span>
        <span className="block text-[11px] text-ink-3">{ajuda}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${ativo ? "bg-gold" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${ativo ? "left-[1.375rem]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export default function EmpreendimentoForm({ empreendimento: emp, construtoras, onConstrutoraCriada, onClose, onSalvo }) {
  const [f, setF] = useState(() => ({
    nome: emp?.nome ?? "",
    construtoraId: emp?.construtora_id ?? "",
    status: emp?.status ?? "lancamento",
    uf: emp?.uf ?? "PE",
    cidade: emp?.cidade ?? "",
    bairro: emp?.bairro ?? "",
    endereco: emp?.endereco ?? "",
    coords: emp?.latitude != null && emp?.longitude != null ? `${emp.latitude}, ${emp.longitude}` : "",
    quartosMin: emp?.quartos_min ?? "", quartosMax: emp?.quartos_max ?? "",
    vagasMin: emp?.vagas_min ?? "", vagasMax: emp?.vagas_max ?? "",
    precoMin: emp?.preco_min ?? "", precoMax: emp?.preco_max ?? "",
    lazer: (emp?.lazer ?? []).join(", "),
    descricao: emp?.descricao ?? "",
    publicado: emp?.publicado ?? false,
    disponivel: emp?.disponivel ?? true,
  }));
  const [arquivos, setArquivos] = useState({ capa: null, galeria: [], book: null, tabela: null });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [novaConstrutora, setNovaConstrutora] = useState(null); // null = fechado, string = digitando

  const set = (c) => (e) => setF((s) => ({ ...s, [c]: e.target.value }));
  const coords = useMemo(() => lerCoords(f.coords), [f.coords]);

  const galeriaUrls = useMemo(() => arquivos.galeria.map((a) => URL.createObjectURL(a)), [arquivos.galeria]);
  useEffect(() => () => galeriaUrls.forEach((u) => URL.revokeObjectURL(u)), [galeriaUrls]);

  function aceitarArquivo(chave, arquivo, { multiplo = false } = {}) {
    if (!arquivo) return setArquivos((s) => ({ ...s, [chave]: multiplo ? [] : null }));
    if (arquivo.size > MAX_ARQUIVO) return setErros((e) => ({ ...e, [chave]: `${arquivo.name} passa de 15 MB.` }));
    setErros((e) => ({ ...e, [chave]: undefined }));
    setArquivos((s) => ({ ...s, [chave]: arquivo }));
  }
  function addGaleria(lista) {
    const validos = [...lista].filter((a) => a.size <= MAX_ARQUIVO);
    const grandes = lista.length - validos.length;
    setErros((e) => ({ ...e, galeria: grandes ? `${grandes} arquivo(s) passam de 15 MB e foram ignorados.` : undefined }));
    setArquivos((s) => ({ ...s, galeria: [...s.galeria, ...validos].slice(0, 20) }));
  }

  async function salvarConstrutora() {
    const nome = novaConstrutora?.trim();
    if (!nome) return;
    try {
      const nova = await criarConstrutora({ nome });
      onConstrutoraCriada(nova);
      setF((s) => ({ ...s, construtoraId: nova.id }));
      setNovaConstrutora(null);
    } catch (err) {
      setErros((e) => ({ ...e, construtoraId: err.message }));
    }
  }

  function validar() {
    const e = {};
    if (!f.nome.trim()) e.nome = "Informe o nome.";
    if (!f.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!f.bairro.trim()) e.bairro = "Informe o bairro.";
    if (f.uf.trim().length !== 2) e.uf = "Use a sigla (ex.: PE).";
    if (coords.erro) e.coords = coords.erro;
    if (num(f.quartosMin) != null && num(f.quartosMax) != null && num(f.quartosMin) > num(f.quartosMax)) e.quartosMax = "Máximo menor que o mínimo.";
    if (num(f.precoMin) != null && num(f.precoMax) != null && num(f.precoMin) > num(f.precoMax)) e.precoMax = "Máximo menor que o mínimo.";
    return e;
  }

  async function enviar(ev) {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    setErroGeral("");
    if (Object.keys(e).length) return;

    setEnviando(true);
    try {
      const base = {
        nome: f.nome.trim(),
        construtoraId: f.construtoraId || null,
        status: f.status,
        uf: f.uf.trim().toUpperCase(),
        cidade: f.cidade.trim(),
        bairro: f.bairro.trim(),
        endereco: f.endereco.trim() || null,
        descricao: f.descricao.trim() || null,
        latitude: coords.lat ?? null,
        longitude: coords.lng ?? null,
        quartosMin: num(f.quartosMin), quartosMax: num(f.quartosMax),
        vagasMin: num(f.vagasMin), vagasMax: num(f.vagasMax),
        precoMin: num(f.precoMin), precoMax: num(f.precoMax),
        lazer: f.lazer.split(",").map((s) => s.trim()).filter(Boolean),
        publicado: f.publicado,
        disponivel: f.disponivel,
      };
      const salvo = emp ? await atualizarEmpreendimento(emp.id, base) : await criarEmpreendimento({ ...base, ...arquivos });
      onSalvo(salvo, !emp);
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const Num = ({ campo, rotulo, ...resto }) => (
    <Campo rotulo={rotulo} erro={erros[campo]}>
      <input type="number" min="0" inputMode="numeric" value={f[campo]} onChange={set(campo)} className={`${CAMPO} ${borda(erros, campo)}`} {...resto} />
    </Campo>
  );

  return (
    <Folha titulo={emp ? "Editar empreendimento" : "Novo empreendimento"} onClose={onClose} largo>
      <form onSubmit={enviar} noValidate className="space-y-6 pt-3">
        {erroGeral && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erroGeral}</p>}

        <Secao titulo="Informações">
          <Campo rotulo="Nome do empreendimento" erro={erros.nome}><input value={f.nome} onChange={set("nome")} className={`${CAMPO} ${borda(erros, "nome")}`} /></Campo>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Campo rotulo="Fase" erro={erros.status}>
              <select value={f.status} onChange={set("status")} className={`${CAMPO} ${borda(erros, "status")}`}>
                <option value="lancamento">Lançamento</option>
                <option value="obras">Em obras</option>
                <option value="pronto">Pronto</option>
                <option value="outros">Outros</option>
              </select>
            </Campo>
            <Campo rotulo="Construtora" erro={erros.construtoraId}>
              {novaConstrutora === null ? (
                <div className="flex gap-2">
                  <select value={f.construtoraId} onChange={set("construtoraId")} className={`${CAMPO} border-line focus:border-gold`}>
                    <option value="">Sem construtora</option>
                    {construtoras.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <button type="button" onClick={() => setNovaConstrutora("")} className="h-12 shrink-0 rounded-xl border border-line px-3 text-sm hover:border-gold">Nova</button>
                </div>
              ) : (
                <div className="animate-fade-in flex gap-2">
                  <input autoFocus value={novaConstrutora} onChange={(e) => setNovaConstrutora(e.target.value)} placeholder="Nome da construtora" className={`${CAMPO} border-line focus:border-gold`} />
                  <button type="button" onClick={salvarConstrutora} className="h-12 shrink-0 rounded-xl bg-gold-gradient px-3 text-sm font-semibold text-[#1a1408]">Salvar</button>
                  <button type="button" onClick={() => setNovaConstrutora(null)} aria-label="Cancelar" className="grid size-12 shrink-0 place-items-center rounded-xl border border-line"><Icon name="x" className="size-4" /></button>
                </div>
              )}
            </Campo>
          </div>
          <Campo rotulo="Descrição (opcional)"><textarea value={f.descricao} onChange={set("descricao")} rows={3} className="w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 text-sm outline-none focus:border-gold scheme-dark" /></Campo>
        </Secao>

        <Secao titulo="Localização">
          <div className="grid grid-cols-[5rem_1fr] gap-3.5 sm:grid-cols-[5rem_1fr_1fr]">
            <Campo rotulo="UF" erro={erros.uf}><input value={f.uf} maxLength={2} onChange={set("uf")} className={`${CAMPO} uppercase ${borda(erros, "uf")}`} /></Campo>
            <Campo rotulo="Cidade" erro={erros.cidade}><input value={f.cidade} onChange={set("cidade")} className={`${CAMPO} ${borda(erros, "cidade")}`} /></Campo>
            <div className="col-span-2 sm:col-span-1"><Campo rotulo="Bairro" erro={erros.bairro}><input value={f.bairro} onChange={set("bairro")} className={`${CAMPO} ${borda(erros, "bairro")}`} /></Campo></div>
          </div>
          <Campo rotulo="Endereço (opcional)"><input value={f.endereco} onChange={set("endereco")} className={`${CAMPO} border-line focus:border-gold`} /></Campo>
          <Campo rotulo="Coordenadas (clique com o botão direito no Google Maps e copie)" erro={erros.coords}>
            <input value={f.coords} onChange={set("coords")} placeholder="-8.0476, -34.8770" inputMode="text" className={`${CAMPO} ${borda(erros, "coords")}`} />
          </Campo>
          {coords.lat != null && (
            <div className="animate-fade-in h-44 overflow-hidden rounded-xl border border-line">
              <Suspense fallback={<div className="grid size-full place-items-center text-sm text-ink-3">Carregando mapa…</div>}>
                <MiniMapa key={`${coords.lat},${coords.lng}`} lat={coords.lat} lng={coords.lng} />
              </Suspense>
            </div>
          )}
        </Secao>

        <Secao titulo="Características">
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <Num campo="quartosMin" rotulo="Quartos (mín.)" />
            <Num campo="quartosMax" rotulo="Quartos (máx.)" />
            <Num campo="vagasMin" rotulo="Vagas (mín.)" />
            <Num campo="vagasMax" rotulo="Vagas (máx.)" />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <Num campo="precoMin" rotulo="Preço a partir de (R$)" />
            <Num campo="precoMax" rotulo="Preço até (R$)" />
          </div>
          <Campo rotulo="Lazer e diferenciais (separe por vírgula)"><input value={f.lazer} onChange={set("lazer")} placeholder="Piscina, Academia, Playground" className={`${CAMPO} border-line focus:border-gold`} /></Campo>
        </Secao>

        <Secao titulo="Arquivos">
          {emp ? (
            <p className="rounded-xl bg-card-2 px-3.5 py-3 text-[13px] text-ink-2">
              A troca de capa, galeria, book e tabela pela edição ainda não está disponível. Os atuais continuam como estão.
            </p>
          ) : (
            <>
              <Arquivo rotulo="Foto de capa" accept="image/*" arquivo={arquivos.capa} onChange={(a) => aceitarArquivo("capa", a)} dica="JPG, PNG ou WebP (até 15 MB; é reduzida automaticamente)" erro={erros.capa} />
              <div className={`rounded-xl border border-dashed p-3 ${erros.galeria ? "border-danger" : "border-line"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-ink-2">Galeria de fotos</div>
                    <div className="text-[13px]">{arquivos.galeria.length ? `${arquivos.galeria.length} de 20 fotos` : "Até 20 fotos"}</div>
                  </div>
                  <label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-line px-4 text-sm transition-colors hover:border-gold">
                    Adicionar
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addGaleria(e.target.files ?? []); e.target.value = ""; }} />
                  </label>
                </div>
                {galeriaUrls.length > 0 && (
                  <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {galeriaUrls.map((u, i) => (
                      <li key={u} className="relative aspect-square overflow-hidden rounded-lg bg-card-2">
                        <img src={u} alt="" className="size-full object-cover" />
                        <button type="button" aria-label={`Remover foto ${i + 1}`} onClick={() => setArquivos((s) => ({ ...s, galeria: s.galeria.filter((_, k) => k !== i) }))}
                          className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/70 text-white"><Icon name="x" className="size-3.5" /></button>
                      </li>
                    ))}
                  </ul>
                )}
                {erros.galeria && <p className="mt-1 text-[11px] text-danger">{erros.galeria}</p>}
              </div>
              <Arquivo rotulo="Book (PDF)" accept="application/pdf" arquivo={arquivos.book} onChange={(a) => aceitarArquivo("book", a)} dica="PDF do book do empreendimento" erro={erros.book} />
              <Arquivo rotulo="Tabela de preços (PDF)" accept="application/pdf" arquivo={arquivos.tabela} onChange={(a) => aceitarArquivo("tabela", a)} dica="PDF da tabela vigente" erro={erros.tabela} />
            </>
          )}
        </Secao>

        <Secao titulo="Publicação">
          <Interruptor ativo={f.publicado} onChange={(v) => setF((s) => ({ ...s, publicado: v }))} rotulo="Publicado" ajuda="Visível para quem não está logado" />
          <Interruptor ativo={f.disponivel} onChange={(v) => setF((s) => ({ ...s, disponivel: v }))} rotulo="Disponível para venda" ajuda="Desmarque quando as unidades acabarem" />
        </Secao>

        <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
          {enviando ? (emp ? "Salvando..." : "Enviando arquivos...") : emp ? "Salvar alterações" : "Cadastrar empreendimento"}
        </button>
      </form>
    </Folha>
  );
}