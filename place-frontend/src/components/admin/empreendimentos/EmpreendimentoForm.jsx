import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CAMPO, Campo, Folha } from "@/components/admin/equipe/ui";
import { criarConstrutora } from "@/services/construtoras";
import { atualizarEmpreendimento, criarEmpreendimento } from "@/services/empreendimentos";
import TipologiasForm from "./TipologiasForm";
import DocumentosComerciaisForm from "./DocumentosComerciaisForm";
import ImagensEmpreendimentoForm from "./ImagensEmpreendimentoForm";
import { auditarTipologias } from "@/lib/auditoriaTipologias";
import { avisoDeSegmento } from "@/lib/precoCatalogo";
import { DIAS_PARA_DESATUALIZAR, lerAndamento } from "@/lib/andamentoObra";

const MiniMapa = lazy(() => import("@/components/site/MiniMapa"));
const MAX_ARQUIVO = 15 * 1024 * 1024;
const borda = (erros, c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");
const num = (v) => (v === "" || v == null ? null : Number(v));
export function lerCoords(texto = "") {
  const t = texto.trim();
  if (!t) return { vazio: true };
  const m = t.match(/^(-?\d{1,3}(?:\.\d+)?)\s*(?:[,;]\s*|\s+)(-?\d{1,3}(?:\.\d+)?)$/);
  if (!m) return { erro: "Use o formato -8.0476, -34.8770 (copie do Google Maps)." };
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return { erro: "Coordenadas fora do intervalo válido." };
  return { lat, lng };
}

const COLUNA_FICHA = {
  torres: "torres", andares: "andares", aptosPorAndar: "aptos_por_andar", unidadesTotal: "unidades_total",
  elevadoresPorTorre: "elevadores_por_torre", areaTerrenoM2: "area_terreno_m2",
  registroIncorporacao: "registro_incorporacao", registroCartorio: "registro_cartorio", registroData: "registro_data",
};

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

function CampoNumero({ campo, rotulo, valor, onChange, erro, ...resto }) {
  return (
    <Campo rotulo={rotulo} erro={erro}>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={valor}
        onChange={onChange}
        className={`${CAMPO} ${erro ? "border-danger" : "border-line focus:border-gold"}`}
        {...resto}
      />
    </Campo>
  );
}

export default function EmpreendimentoForm({ empreendimento: emp, construtoras, onConstrutoraCriada, onClose, onSalvo, onTipologiasAtualizadas, onDocumentosAtualizados, onCapaAtualizada }) {
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
    areaMin: emp?.area_min ?? "", areaMax: emp?.area_max ?? "",
    precoMin: emp?.preco_min ?? "", precoMax: emp?.preco_max ?? "",
    segmento: emp?.segmento ?? "",
    parcelaMin: emp?.parcela_min != null ? String(Number(emp.parcela_min)) : "",
    previsaoEntrega: emp?.previsao_entrega ? String(emp.previsao_entrega).slice(0, 7) : "",
    lazer: (emp?.lazer ?? []).join(", "),
    descricao: emp?.descricao ?? "",
    publicado: emp?.publicado ?? false,
    disponivel: emp?.disponivel ?? true,
    destaque: emp?.destaque ?? false,
    andamentoReferencia: emp?.andamento_referencia ? String(emp.andamento_referencia).slice(0, 7) : "",
    torres: emp?.torres ?? "", andares: emp?.andares ?? "", aptosPorAndar: emp?.aptos_por_andar ?? "",
    unidadesTotal: emp?.unidades_total ?? "", elevadoresPorTorre: emp?.elevadores_por_torre ?? "",
    areaTerrenoM2: emp?.area_terreno_m2 != null ? String(Number(emp.area_terreno_m2)) : "",
    registroIncorporacao: emp?.registro_incorporacao ?? "", registroCartorio: emp?.registro_cartorio ?? "",
    registroData: emp?.registro_data ? String(emp.registro_data).slice(0, 10) : "",
    andamentoFonteUrl: emp?.andamento_fonte_url ?? "",
  }));
  // Andamento da obra: uma linha por módulo/torre, como a construtora publica.
  const [modulos, setModulos] = useState(() =>
    (Array.isArray(emp?.andamento_obra) ? emp.andamento_obra : []).map((m) => ({ modulo: m.modulo ?? "", percentual: m.percentual != null ? String(m.percentual) : "" }))
  );
  const mudarModulo = (i, campo) => (e) => setModulos((l) => l.map((m, k) => (k === i ? { ...m, [campo]: e.target.value } : m)));
  // Fatos da região: só com fonte (quem publicou), link e mês. Até 3.
  const [fatos, setFatos] = useState(() =>
    (Array.isArray(emp?.fatos_mercado) ? emp.fatos_mercado : []).map((f) => ({ texto: f.texto ?? "", fonte: f.fonte ?? "", url: f.url ?? "", mes: f.mes ?? "" }))
  );
  const mudarFato = (i, campo) => (e) => setFatos((l) => l.map((f, k) => (k === i ? { ...f, [campo]: e.target.value } : f)));
  const [tipologias, setTipologias] = useState(() =>
    Array.isArray(emp?.tipologias) ? emp.tipologias : []
  );
  const avisosTipologias = useMemo(
    () => auditarTipologias(f, tipologias),
    [f, tipologias]
  );
  const [arquivos, setArquivos] = useState({ capa: null, galeria: [], book: null, tabela: null });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [novaConstrutora, setNovaConstrutora] = useState(null);
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
    for (const campo of ["quartosMin", "quartosMax", "vagasMin", "vagasMax"]) {
      if (f[campo] !== "" && (!Number.isInteger(num(f[campo])) || num(f[campo]) < 0)) {
        e[campo] = "Informe um número inteiro válido.";
      }
    }
    for (const [campo, minimo, maximo] of [["torres", 1, 100], ["andares", 1, 200], ["aptosPorAndar", 1, 100], ["unidadesTotal", 1, 50000], ["elevadoresPorTorre", 0, 50]]) {
      if (f[campo] !== "" && (!Number.isInteger(num(f[campo])) || num(f[campo]) < minimo || num(f[campo]) > maximo)) {
        e[campo] = `Use um número inteiro de ${minimo} a ${maximo}.`;
      }
    }
    if (f.areaTerrenoM2 !== "" && !(num(String(f.areaTerrenoM2).replace(",", ".")) > 0)) e.areaTerrenoM2 = "Informe a área do terreno em m².";
    if (f.registroIncorporacao.trim() && f.registroIncorporacao.trim().length < 2) e.registroIncorporacao = "Informe o número do registro.";
    if (f.registroData && f.registroData > new Date().toISOString().slice(0, 10)) e.registroData = "A data do registro não pode ser no futuro.";
    for (const campo of ["areaMin", "areaMax", "precoMin", "precoMax"]) {
      if (f[campo] !== "" && (!Number.isFinite(num(f[campo])) || num(f[campo]) < 0)) {
        e[campo] = "Informe um valor válido.";
      }
    }
    for (const [minimo, maximo] of [
      ["quartosMin", "quartosMax"],
      ["vagasMin", "vagasMax"],
      ["areaMin", "areaMax"],
      ["precoMin", "precoMax"],
    ]) {
      if (num(f[minimo]) != null && num(f[maximo]) != null && num(f[minimo]) > num(f[maximo])) {
        e[maximo] = "Máximo menor que o mínimo.";
      }
    }
    const preenchidos = modulos.filter((m) => m.modulo.trim() || m.percentual !== "");
    if (preenchidos.some((m) => !m.modulo.trim())) e.andamentoObra = "Dê um nome a cada módulo (ex.: Módulo 01, Torre A).";
    else if (preenchidos.some((m) => !(num(String(m.percentual).replace(",", ".")) >= 0 && num(String(m.percentual).replace(",", ".")) <= 100))) e.andamentoObra = "O percentual vai de 0 a 100.";
    if (preenchidos.length && !f.andamentoReferencia) e.andamentoReferencia = "Informe o mês da medição.";
    if (f.andamentoReferencia && f.andamentoReferencia > new Date().toISOString().slice(0, 7)) e.andamentoReferencia = "O mês da medição não pode ser no futuro.";
    const fatosPreenchidos = fatos.filter((x) => x.texto.trim() || x.fonte.trim() || x.url.trim() || x.mes);
    for (const x of fatosPreenchidos) {
      if (x.texto.trim().length < 10) { e.fatosMercado = "Escreva o fato (pelo menos 10 letras)."; break; }
      if (!x.fonte.trim()) { e.fatosMercado = "Informe quem publicou (a fonte)."; break; }
      if (!/^https:\/\/\S+$/.test(x.url.trim())) { e.fatosMercado = "Cole o link https da fonte."; break; }
      if (!x.mes || x.mes > new Date().toISOString().slice(0, 7)) { e.fatosMercado = "Informe o mês da publicação."; break; }
    }
    if (f.andamentoFonteUrl.trim() && !/^https:\/\/\S+$/.test(f.andamentoFonteUrl.trim())) e.andamentoFonteUrl = "Use o link https da página da construtora.";
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
        areaMin: num(f.areaMin), areaMax: num(f.areaMax),
        precoMin: num(f.precoMin), precoMax: num(f.precoMax),
        segmento: f.segmento || null,
        parcelaMin: f.segmento === "mcmv" ? num(f.parcelaMin) : null,
        previsaoEntrega: f.previsaoEntrega ? `${f.previsaoEntrega}-01` : null,
        // Só manda o andamento quando existe (assim o resto do formulário funciona mesmo antes da migration rodar).
        ...(modulos.length || f.andamentoReferencia || f.andamentoFonteUrl.trim() || emp?.andamento_obra?.length ? {
          andamentoObra: modulos
            .filter((m) => m.modulo.trim())
            .map((m) => ({ modulo: m.modulo.trim(), percentual: num(String(m.percentual).replace(",", ".")) })),
          andamentoReferencia: f.andamentoReferencia ? `${f.andamentoReferencia}-01` : null,
          andamentoFonteUrl: f.andamentoFonteUrl.trim() || null,
        } : {}),
        ...(fatos.length || emp?.fatos_mercado?.length ? {
          fatosMercado: fatos
            .filter((x) => x.texto.trim())
            .map((x) => ({ texto: x.texto.trim(), fonte: x.fonte.trim(), url: x.url.trim(), mes: x.mes })),
        } : {}),
        // Ficha técnica e registro da incorporação: só vão quando preenchidos ou quando já existiam (para poder limpar).
        ...Object.fromEntries(
          [
            ["torres", num(f.torres)], ["andares", num(f.andares)], ["aptosPorAndar", num(f.aptosPorAndar)],
            ["unidadesTotal", num(f.unidadesTotal)], ["elevadoresPorTorre", num(f.elevadoresPorTorre)],
            ["areaTerrenoM2", f.areaTerrenoM2 === "" ? null : num(String(f.areaTerrenoM2).replace(",", "."))],
            ["registroIncorporacao", f.registroIncorporacao.trim() || null], ["registroCartorio", f.registroCartorio.trim() || null],
            ["registroData", f.registroData || null],
          ].filter(([campo, valor]) => valor != null || (emp && emp[COLUNA_FICHA[campo]] != null))
        ),
        lazer: f.lazer.split(",").map((s) => s.trim()).filter(Boolean),
        publicado: f.publicado,
        disponivel: f.disponivel,
        // O destaque só é aceito na edição (o cadastro novo entra sem destaque).
        ...(emp ? { destaque: f.destaque } : {}),
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
            <CampoNumero campo="quartosMin" rotulo="Quartos (mín.)" valor={f.quartosMin} onChange={set("quartosMin")} erro={erros.quartosMin} step="1" />
            <CampoNumero campo="quartosMax" rotulo="Quartos (máx.)" valor={f.quartosMax} onChange={set("quartosMax")} erro={erros.quartosMax} step="1" />
            <CampoNumero campo="vagasMin" rotulo="Vagas (mín.)" valor={f.vagasMin} onChange={set("vagasMin")} erro={erros.vagasMin} step="1" />
            <CampoNumero campo="vagasMax" rotulo="Vagas (máx.)" valor={f.vagasMax} onChange={set("vagasMax")} erro={erros.vagasMax} step="1" />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <CampoNumero campo="areaMin" rotulo="Área mínima (m²)" valor={f.areaMin} onChange={set("areaMin")} erro={erros.areaMin} step="0.01" inputMode="decimal" />
            <CampoNumero campo="areaMax" rotulo="Área máxima (m²)" valor={f.areaMax} onChange={set("areaMax")} erro={erros.areaMax} step="0.01" inputMode="decimal" />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <CampoNumero campo="precoMin" rotulo="Preço a partir de (R$)" valor={f.precoMin} onChange={set("precoMin")} erro={erros.precoMin} step="0.01" inputMode="decimal" />
            <CampoNumero campo="precoMax" rotulo="Preço até (R$)" valor={f.precoMax} onChange={set("precoMax")} erro={erros.precoMax} step="0.01" inputMode="decimal" />
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <Campo rotulo="Segmento" erro={erros.segmento}>
              <select value={f.segmento} onChange={set("segmento")} className={`${CAMPO} ${borda(erros, "segmento")}`}>
                <option value="">Não definido</option>
                <option value="mcmv">MCMV</option>
                <option value="medio_padrao">Médio padrão</option>
                <option value="alto_padrao">Alto padrão</option>
                <option value="litoral">Litoral</option>
              </select>
            </Campo>
            {f.segmento === "mcmv" && (
              <Campo rotulo="Parcelas a partir de (R$)" erro={erros.parcelaMin}>
                <select value={String(f.parcelaMin)} onChange={set("parcelaMin")} className={`${CAMPO} ${borda(erros, "parcelaMin")}`}>
                  <option value="">Escolha</option>
                  <option value="399">R$ 399</option>
                  <option value="499">R$ 499 — longe do centro</option>
                  <option value="599">R$ 599 — perto do centro</option>
                  <option value="699">R$ 699</option>
                </select>
              </Campo>
            )}
            <Campo rotulo="Previsão de entrega (mês/ano)" erro={erros.previsaoEntrega}>
              <input type="month" value={f.previsaoEntrega} onChange={set("previsaoEntrega")} disabled={f.status === "pronto"} className={`${CAMPO} ${borda(erros, "previsaoEntrega")} disabled:opacity-50`} />
            </Campo>
          </div>
          {avisoDeSegmento(f) && (
            <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs leading-5 text-amber-700 dark:text-amber-300">
              {avisoDeSegmento(f)}
            </p>
          )}
          <Campo rotulo="Lazer e diferenciais (separe por vírgula)"><input value={f.lazer} onChange={set("lazer")} placeholder="Piscina, Academia, Playground" className={`${CAMPO} border-line focus:border-gold`} /></Campo>
        </Secao>
        <Secao titulo="Ficha técnica e registro da incorporação (opcional)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <CampoNumero campo="torres" rotulo="Torres" valor={f.torres} onChange={set("torres")} erro={erros.torres} step="1" />
            <CampoNumero campo="andares" rotulo="Andares por torre" valor={f.andares} onChange={set("andares")} erro={erros.andares} step="1" />
            <CampoNumero campo="aptosPorAndar" rotulo="Aptos por andar" valor={f.aptosPorAndar} onChange={set("aptosPorAndar")} erro={erros.aptosPorAndar} step="1" />
            <CampoNumero campo="unidadesTotal" rotulo="Total de unidades" valor={f.unidadesTotal} onChange={set("unidadesTotal")} erro={erros.unidadesTotal} step="1" />
            <CampoNumero campo="elevadoresPorTorre" rotulo="Elevadores por torre" valor={f.elevadoresPorTorre} onChange={set("elevadoresPorTorre")} erro={erros.elevadoresPorTorre} step="1" />
            <CampoNumero campo="areaTerrenoM2" rotulo="Área do terreno (m²)" valor={f.areaTerrenoM2} onChange={set("areaTerrenoM2")} erro={erros.areaTerrenoM2} step="0.01" inputMode="decimal" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo rotulo="Registro da incorporação" erro={erros.registroIncorporacao}>
              <input value={f.registroIncorporacao} onChange={set("registroIncorporacao")} placeholder="R-5 da matrícula 12.345" maxLength={120} className={`${CAMPO} ${borda(erros, "registroIncorporacao")}`} />
            </Campo>
            <Campo rotulo="Cartório" erro={erros.registroCartorio}>
              <input value={f.registroCartorio} onChange={set("registroCartorio")} placeholder="1º Registro de Imóveis do Recife" maxLength={120} className={`${CAMPO} ${borda(erros, "registroCartorio")}`} />
            </Campo>
            <Campo rotulo="Data do registro" erro={erros.registroData}>
              <input type="date" value={f.registroData} onChange={set("registroData")} max={new Date().toISOString().slice(0, 10)} className={`${CAMPO} ${borda(erros, "registroData")}`} />
            </Campo>
          </div>
          <p className="text-xs leading-5 text-ink-3">O número do registro aparece na página do empreendimento. Está no memorial ou na tabela da construtora.</p>
        </Secao>
        {emp && avisosTipologias.length > 0 && (
          <div
            role="status"
            aria-label="Divergências entre características e plantas"
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Atenção: confira os dados gerais e as plantas cadastradas
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-ink-2">
              {avisosTipologias.map((aviso) => (
                <li key={aviso.chave}>{aviso.mensagem}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-3">
              Os avisos não bloqueiam o salvamento nem alteram dados automaticamente.
            </p>
          </div>
        )}
        {f.status !== "pronto" && (() => {
          const situacao = lerAndamento({ andamento_obra: modulos.map((m) => ({ ...m, percentual: String(m.percentual).replace(",", ".") })), andamento_referencia: f.andamentoReferencia ? `${f.andamentoReferencia}-01` : null });
          return (
            <Secao titulo="Andamento da obra">
              <p className="text-xs leading-5 text-ink-3">
                Copie da página da construtora uma vez por mês, junto com a tabela. Por enquanto só os corretores veem. Com mais de {DIAS_PARA_DESATUALIZAR} dias, aparece para eles como desatualizado.
              </p>
              {situacao?.desatualizado && f.andamentoReferencia && (
                <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300">
                  Medição de {situacao.mes}: desatualizada há {situacao.dias} dias. Os corretores veem o aviso até ser atualizada.
                </p>
              )}
              <div className="space-y-2">
                {modulos.map((m, i) => (
                  <div key={i} className="grid grid-cols-[1fr_7rem_auto] gap-2">
                    <input aria-label={`Nome do módulo ${i + 1}`} value={m.modulo} onChange={mudarModulo(i, "modulo")} placeholder="Módulo 01" maxLength={60} className={`${CAMPO} ${borda(erros, "andamentoObra")}`} />
                    <input aria-label={`Percentual do módulo ${i + 1}`} value={m.percentual} onChange={mudarModulo(i, "percentual")} placeholder="86,29" inputMode="decimal" className={`${CAMPO} ${borda(erros, "andamentoObra")}`} />
                    <button type="button" onClick={() => setModulos((l) => l.filter((_, k) => k !== i))} aria-label={`Tirar o módulo ${i + 1}`} className="grid size-12 place-items-center rounded-xl border border-line hover:border-danger"><Icon name="x" className="size-4" /></button>
                  </div>
                ))}
                {erros.andamentoObra && <p className="text-[11px] text-danger">{erros.andamentoObra}</p>}
                {modulos.length < 10 && (
                  <button type="button" onClick={() => setModulos((l) => [...l, { modulo: `Módulo ${String(l.length + 1).padStart(2, "0")}`, percentual: "" }])} className="h-10 rounded-xl border border-dashed border-line px-4 text-sm hover:border-gold">
                    + Módulo / torre
                  </button>
                )}
              </div>
              <div className="grid gap-3.5 sm:grid-cols-[12rem_1fr]">
                <Campo rotulo="Mês da medição" erro={erros.andamentoReferencia}>
                  <input type="month" value={f.andamentoReferencia} onChange={set("andamentoReferencia")} max={new Date().toISOString().slice(0, 7)} className={`${CAMPO} ${borda(erros, "andamentoReferencia")}`} />
                </Campo>
                <Campo rotulo="Link da página da construtora (opcional)" erro={erros.andamentoFonteUrl}>
                  <input value={f.andamentoFonteUrl} onChange={set("andamentoFonteUrl")} placeholder="https://..." inputMode="url" className={`${CAMPO} ${borda(erros, "andamentoFonteUrl")}`} />
                </Campo>
              </div>
            </Secao>
          );
        })()}
        <Secao titulo="Fatos da região (com fonte)">
          <p className="text-xs leading-5 text-ink-3">
            Só fato publicado por alguém, com o link para conferir: governo, IBGE, FipeZap, jornal, a construtora. Nada de "vai valorizar".
            Aparece para o cliente no material exclusivo e para os corretores. Some sozinho depois de 18 meses.
          </p>
          {fatos.map((x, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-line p-3">
              <textarea aria-label={`Fato ${i + 1}`} value={x.texto} onChange={mudarFato(i, "texto")} maxLength={200} rows={2}
                placeholder="Ex.: Porto de Galinhas recebeu X mil turistas no verão de 2026, alta de Y% sobre 2025."
                className={`w-full rounded-xl border bg-card-2 px-3.5 py-2.5 text-sm outline-none scheme-dark ${borda(erros, "fatosMercado")}`} />
              <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_9rem_auto]">
                <input aria-label={`Fonte do fato ${i + 1}`} value={x.fonte} onChange={mudarFato(i, "fonte")} placeholder="Quem publicou" maxLength={80} className={`${CAMPO} ${borda(erros, "fatosMercado")}`} />
                <input aria-label={`Link do fato ${i + 1}`} value={x.url} onChange={mudarFato(i, "url")} placeholder="https://..." inputMode="url" className={`${CAMPO} ${borda(erros, "fatosMercado")}`} />
                <input aria-label={`Mês do fato ${i + 1}`} type="month" value={x.mes} onChange={mudarFato(i, "mes")} max={new Date().toISOString().slice(0, 7)} className={`${CAMPO} ${borda(erros, "fatosMercado")}`} />
                <button type="button" onClick={() => setFatos((l) => l.filter((_, k) => k !== i))} aria-label={`Tirar o fato ${i + 1}`} className="grid size-12 place-items-center rounded-xl border border-line hover:border-danger"><Icon name="x" className="size-4" /></button>
              </div>
            </div>
          ))}
          {erros.fatosMercado && <p className="text-[11px] text-danger">{erros.fatosMercado}</p>}
          {fatos.length < 3 && (
            <button type="button" onClick={() => setFatos((l) => [...l, { texto: "", fonte: "", url: "", mes: "" }])} className="h-10 rounded-xl border border-dashed border-line px-4 text-sm hover:border-gold">
              + Fato com fonte
            </button>
          )}
        </Secao>
        {emp && (
          <TipologiasForm
            empreendimentoId={emp.id}
            onAtualizadas={(novasTipologias) => {
              setTipologias(novasTipologias);
              onTipologiasAtualizadas?.(emp.id, novasTipologias);
            }}
          />
        )}
        {emp && (
          <DocumentosComerciaisForm
            empreendimentoId={emp.id}
            temBookLegado={emp.tem_book}
            temTabelaLegada={emp.tem_tabela}
            onAtualizados={(documentos) => onDocumentosAtualizados?.(emp.id, documentos)}
          />
        )}
        {emp && <ImagensEmpreendimentoForm
          empreendimentoId={emp.id}
          capaInicial={emp.capa_url}
          onCapaAtualizada={(url) => onCapaAtualizada?.(emp.id, url)}
        />}
        <Secao titulo="Arquivos">
          {!emp && (
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
          {emp && (
            <Interruptor ativo={f.destaque} onChange={(v) => setF((s) => ({ ...s, destaque: v }))} rotulo="Destaque na tela inicial" ajuda="Aparece primeiro no topo e na lista do site" />
          )}
        </Secao>
        <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
          {enviando ? (emp ? "Salvando..." : "Enviando arquivos...") : emp ? "Salvar alterações" : "Cadastrar empreendimento"}
        </button>
      </form>
    </Folha>
  );
}
