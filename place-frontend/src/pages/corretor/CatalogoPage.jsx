import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { rotaBaseCatalogo } from "@/lib/rotasCatalogo";
import { Icon } from "@/components/ui/Icon";
import { CAMPO, Folha, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { STATUS, buscarEmpreendimentoPorId, formatarFaixa, listarEmpreendimentos, listarDocumentosComerciais, urlDoDocumento, urlDoDocumentoPorId } from "@/services/empreendimentos";
import { SEGMENTOS, prazoDoEmpreendimento, precoDoEmpreendimento } from "@/lib/precoCatalogo";
import { registrarEvento } from "@/services/eventos";
import { AbasCatalogo } from "@/components/catalogo/AbasCatalogo";
import { cn } from "@/lib/cn";

const MiniMapa = lazy(() => import("@/components/site/MiniMapa"));
const TOM_STATUS = { lancamento: "ok", obras: "azul", pronto: "ouro", outros: "neutro" };
const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Documento({ empreendimentoId, tipo, disponivel, rotulo, docId = null }) {
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState("");
  const cls = "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors";

  if (!disponivel) {
    return <span className={`${cls} flex-1 cursor-not-allowed border-line text-ink-3`} aria-disabled="true">{rotulo} indisponível</span>;
  }

  async function abrir() {
    setErro("");
    const janela = window.open("", "_blank");
    setAbrindo(true);
    try {
      const url = docId ? await urlDoDocumentoPorId(empreendimentoId, docId) : await urlDoDocumento(empreendimentoId, tipo);
      if (janela) {
        janela.opener = null;
        janela.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (e) {
      janela?.close();
      setErro(e.message);
    } finally {
      setAbrindo(false);
    }
  }

  return (
    <div className="flex-1">
      <button type="button" onClick={abrir} disabled={abrindo} className={`${cls} border-gold/50 text-gold hover:bg-gold/10 disabled:opacity-60`}>
        <Icon name="book" className="size-4" /> {abrindo ? "Abrindo..." : rotulo}
      </button>
      {erro && <p role="alert" className="mt-1 text-[11px] text-danger">{erro}</p>}
    </div>
  );
}

function DocumentosCorretor({ empreendimentoId, temBook, temTabela }) {
  const [documentos, setDocumentos] = useState(null);
  const [erro, setErro] = useState('');
  useEffect(() => {
    let ativo = true;
    setDocumentos(null);
    setErro('');
    listarDocumentosComerciais(empreendimentoId)
      .then(lista => { if (ativo) setDocumentos(lista); })
      .catch(e => { if (ativo) setErro(e.message); });
    return () => { ativo = false; };
  }, [empreendimentoId]);

  if (erro) {
    // Compatibilidade com a API ainda não atualizada: links legados continuam funcionando.
    return <div className="flex flex-col gap-2 sm:flex-row">
      <Documento empreendimentoId={empreendimentoId} tipo="book" disponivel={temBook} rotulo="Book" />
      <Documento empreendimentoId={empreendimentoId} tipo="tabela" disponivel={temTabela} rotulo="Tabela" />
    </div>;
  }
  if (!documentos) return <p className="text-xs text-ink-3">Carregando documentos comerciais...</p>;
  if (!documentos.length) return <p className="text-xs text-ink-3">Ainda não há documentos comerciais disponíveis.</p>;
  return <div className="flex flex-wrap gap-2">
    {documentos.map((doc, indice) => (
      <div key={doc.id ?? `legado-${doc.tipo}-${indice}`} className="min-w-[190px] flex-1">
        <Documento empreendimentoId={empreendimentoId} tipo={doc.tipo} docId={doc.id}
          disponivel rotulo={doc.fase ? `${doc.tipo === 'book' ? 'Book' : 'Tabela'} — ${doc.fase}` : doc.tipo === 'book' ? 'Abrir book' : 'Abrir tabela'} />
      </div>
    ))}
  </div>;
}

function Fotos({ imagens, titulo }) {
  const trilho = useRef(null);
  const [atual, setAtual] = useState(0);
  const ir = (i) => trilho.current?.scrollTo({ left: i * trilho.current.clientWidth, behavior: "smooth" });
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card-2">
      <div ref={trilho} onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex aspect-16/10 snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {imagens.map((src, i) => <img key={src + i} src={src} alt={`${titulo} — foto ${i + 1}`} loading={i ? "lazy" : "eager"} className="size-full shrink-0 snap-center object-cover" />)}
      </div>
      {imagens.length > 1 && (
        <>
          <span className="absolute bottom-3 right-3 rounded-full bg-page/80 px-3 py-1 text-xs backdrop-blur">{atual + 1} / {imagens.length}</span>
          {atual > 0 && <button type="button" aria-label="Foto anterior" onClick={() => ir(atual - 1)} className="absolute left-2 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-page/80 backdrop-blur sm:grid"><Icon name="chevronLeft" className="size-5" /></button>}
          {atual < imagens.length - 1 && <button type="button" aria-label="Próxima foto" onClick={() => ir(atual + 1)} className="absolute right-2 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-page/80 backdrop-blur sm:grid"><Icon name="chevronRight" className="size-5" /></button>}
        </>
      )}
    </div>
  );
}

function Detalhe({ resumo, onClose }) {
  const [emp, setEmp] = useState(resumo);
  const [erroDetalhes, setErroDetalhes] = useState("");
  useEffect(() => {
    let ativo = true;
    setErroDetalhes("");
    // Alimenta "Seus últimos acessos" no Início (vai com o token, então conta para o usuário logado).
    registrarEvento({ tipo: "visualizacao_empreendimento", empreendimentoId: resumo.id });
    buscarEmpreendimentoPorId(resumo.id)
      .then((dados) => { if (ativo) setEmp((atual) => ({ ...atual, ...dados })); })
      .catch(() => {
        if (ativo) setErroDetalhes("Não foi possível atualizar os detalhes deste imóvel. Exibindo os dados do catálogo.");
      });
    return () => { ativo = false; };
  }, [resumo.id]);

  const imagens = useMemo(() => {
    const galeria = [...(emp.imagens ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)).map((i) => i.url);
    return [emp.capa_url, ...galeria].filter(Boolean).filter((u, i, l) => l.indexOf(u) === i);
  }, [emp]);
  const temMapa = emp.latitude != null && emp.longitude != null;
  const dados = [
    ["Quartos", formatarFaixa(emp.quartos_min, emp.quartos_max, "quarto", "quartos")],
    ["Vagas", formatarFaixa(emp.vagas_min, emp.vagas_max, "vaga", "vagas")],
    [precoDoEmpreendimento(emp).rotulo, precoDoEmpreendimento(emp).temValor ? `${precoDoEmpreendimento(emp).valor}${precoDoEmpreendimento(emp).sufixo}` : null],
    ["Segmento", SEGMENTOS[emp.segmento] ?? null],
    ["Prazo", prazoDoEmpreendimento(emp)],
    ["Até", emp.preco_max != null ? brl(emp.preco_max) : null],
  ].filter(([, v]) => v);

  return (
    <Folha titulo={emp.nome} onClose={onClose} largo>
      <div className="space-y-5">
        {erroDetalhes && <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-ink-2">{erroDetalhes}</p>}
        {imagens.length > 0 && <Fotos imagens={imagens} titulo={emp.nome} />}

        <div className="flex flex-wrap items-center gap-2">
          <Selo tom={TOM_STATUS[emp.status] ?? "neutro"}>{STATUS[emp.status]?.label ?? emp.status}</Selo>
          {!emp.publicado && <Selo tom="neutro">Rascunho</Selo>}
          {!emp.disponivel && <Selo tom="perigo">Indisponível</Selo>}
          {emp.construtora?.nome && <span className="text-[13px] text-ink-2">{emp.construtora.nome}</span>}
        </div>
        <p className="flex items-center gap-1.5 text-sm text-ink-2"><Icon name="mapPin" className="size-4 text-gold" /> {[emp.endereco, emp.bairro, `${emp.cidade}/${emp.uf}`].filter(Boolean).join(" · ")}</p>

        {dados.length > 0 && (
          <dl className="grid grid-cols-2 gap-3">
            {dados.map(([rotulo, valor]) => (
              <div key={rotulo} className="rounded-xl border border-line-soft bg-card-2 p-3">
                <dt className="text-[12px] text-ink-3">{rotulo}</dt>
                <dd className="mt-0.5 text-[15px] font-semibold">{valor}</dd>
              </div>
            ))}
          </dl>
        )}
        {emp.descricao && <p className="text-sm leading-relaxed text-ink-2">{emp.descricao}</p>}
        {emp.lazer?.length > 0 && <div className="flex flex-wrap gap-2">{emp.lazer.map((l) => <span key={l} className="rounded-full border border-line px-3 py-1 text-[12px] text-ink-2">{l}</span>)}</div>}

        <DocumentosCorretor empreendimentoId={emp.id} temBook={emp.tem_book} temTabela={emp.tem_tabela} />

        {temMapa && (
          <div className="space-y-3">
            <div className="h-56 overflow-hidden rounded-2xl border border-line">
              <Suspense fallback={<div className="grid size-full place-items-center text-sm text-ink-3">Carregando mapa…</div>}>
                <MiniMapa lat={emp.latitude} lng={emp.longitude} />
              </Suspense>
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${emp.latitude},${emp.longitude}`} target="_blank" rel="noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium transition-colors hover:border-gold">
              <Icon name="mapPin" className="size-4 text-gold" /> Ver no Google Maps
            </a>
          </div>
        )}
      </div>
    </Folha>
  );
}

/** Fase da obra legível em cima da foto: fundo sólido e bolinha na cor da fase. */
function Fase({ status, className }) {
  const fase = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}>
      <span className="size-2 shrink-0 rounded-full" style={{ background: fase?.color ?? "var(--color-ink-3)" }} aria-hidden="true" />
      {fase?.label ?? status}
    </span>
  );
}

function Cartao({ e, indice, onAbrir }) {
  const preco = precoDoEmpreendimento(e);
  const detalhes = [formatarFaixa(e.quartos_min, e.quartos_max, "quarto", "quartos"), prazoDoEmpreendimento(e)].filter(Boolean);
  return (
    <li style={{ animationDelay: `${Math.min(indice, 6) * 55}ms` }} className="animate-fade-up min-w-0">
      <button type="button" onClick={() => onAbrir(e)}
        className="group flex w-full gap-3 overflow-hidden rounded-2xl border border-line bg-card p-2.5 text-left transition duration-300 hover:border-gold/60 sm:block sm:p-0 sm:hover:-translate-y-1 sm:hover:shadow-xl sm:hover:shadow-black/30">
        <div className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-xl bg-card-2 sm:aspect-16/10 sm:w-full sm:rounded-none">
          {e.capa_url ? <img src={e.capa_url} alt="" loading="lazy" decoding="async" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid size-full place-items-center text-gold/60"><Icon name="building" className="size-8" /></div>}
          <div className="absolute left-3 top-3 hidden gap-1.5 sm:flex">
            <Fase status={e.status} className="rounded-full bg-page/85 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur" />
            {!e.publicado && <Selo tom="neutro">Rascunho</Selo>}
            {!e.disponivel && <Selo tom="perigo">Indisponível</Selo>}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1 py-0.5 sm:space-y-1.5 sm:p-4">
          <h3 className="truncate text-[15px] font-semibold sm:text-base">{e.nome}</h3>
          <p className="truncate text-[12px] text-ink-2 sm:text-[13px]">
            <Fase status={e.status} className="mr-1 text-ink-2 sm:hidden" />
            <span className="sm:hidden">· </span>{[e.bairro, e.cidade && `${e.cidade}/${e.uf}`].filter(Boolean).join(" · ")}
          </p>
          <p className={cn("truncate text-[13px]", preco.temValor ? "font-semibold text-gold" : "text-ink-3")}>
            {preco.temValor ? (
              <>
                {/* No celular "a partir de R$ 499/mês" já diz que é parcela; o rótulo completo vai a partir do tablet. */}
                <span className="hidden sm:inline">{preco.rotulo} </span>
                <span className="sm:hidden">A partir de </span>
                {preco.valor}{preco.sufixo}
              </>
            ) : "Valores sob consulta"}
          </p>
          {detalhes.length > 0 && <p className="truncate text-[12px] text-ink-3 sm:whitespace-normal sm:text-[13px]">{detalhes.join(" · ")}</p>}
          {(e.tem_book || e.tem_tabela || !e.disponivel || !e.publicado) && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {e.tem_book && <Selo tom="ok">Book</Selo>}
              {e.tem_tabela && <Selo tom="ok">Tabela</Selo>}
              {!e.disponivel && <span className="sm:hidden"><Selo tom="perigo">Indisponível</Selo></span>}
              {!e.publicado && <span className="sm:hidden"><Selo tom="neutro">Rascunho</Selo></span>}
            </div>
          )}
        </div>
      </button>
    </li>
  );
}

export default function CatalogoPage({ modo = "catalogo" }) {
  const { id: empreendimentoId } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const caminhoCatalogo = rotaBaseCatalogo(pathname);
  const books = modo === "books";
  usePageTitle(books ? "Books e tabelas" : "Empreendimentos");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("");
  const [status, setStatus] = useState("");
  const [segmento, setSegmento] = useState("");
  const [soDisponiveis, setSoDisponiveis] = useState(false);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    let ativo = true;
    listarEmpreendimentos()
      .then((l) => ativo && setLista(l))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!empreendimentoId || carregando) return;
    const escolhido = lista.find((e) => String(e.id) === empreendimentoId);
    if (escolhido) setAberto(escolhido);
    else navigate(caminhoCatalogo, { replace: true });
  }, [empreendimentoId, carregando, lista, navigate, caminhoCatalogo]);

  const cidades = useMemo(() => [...new Set(lista.map((e) => e.cidade))].sort((a, b) => a.localeCompare(b)), [lista]);
  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return lista.filter((e) => (!segmento || e.segmento === segmento) && (!cidade || e.cidade === cidade) && (!status || e.status === status) && (!soDisponiveis || e.disponivel) && (!q || `${e.nome} ${e.bairro} ${e.cidade}`.toLowerCase().includes(q)));
  }, [lista, busca, cidade, status, soDisponiveis, segmento]);
  // Segmentos do jeito que a Place separa os produtos (MCMV, médio, alto padrão, litoral), só os que existem.
  const segmentos = useMemo(
    () => Object.entries(SEGMENTOS).map(([k, rotulo]) => [k, rotulo, lista.filter((e) => e.segmento === k).length]).filter(([, , n]) => n > 0),
    [lista],
  );

  return (
    <div className="space-y-5">
      <div className="animate-fade-up space-y-3">
        <div>
          <h1 className="text-xl font-semibold">Empreendimentos</h1>
          <p className="text-[13px] text-ink-2">{books ? "Abra o book e a tabela de preços de cada empreendimento." : "Fotos, valores, prazo e localização de cada produto."}</p>
        </div>
        <AbasCatalogo />
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      <div className="space-y-2">
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, bairro ou cidade" aria-label="Buscar" className={`${CAMPO} border-line focus:border-gold`} />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
          {[["", "Todos", lista.length], ...segmentos].map(([k, rotulo, n]) => (
            <button key={k || "todos"} type="button" onClick={() => setSegmento(k)} aria-pressed={segmento === k}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] ${segmento === k ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
              {rotulo} <span className="text-ink-3">{n}</span>
            </button>
          ))}
          <button type="button" role="switch" aria-checked={soDisponiveis} onClick={() => setSoDisponiveis((v) => !v)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] ${soDisponiveis ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
            Só disponíveis
          </button>
        </div>
        <div className={`grid gap-2 ${books ? "" : "grid-cols-2"} sm:max-w-md`}>
          <select value={cidade} onChange={(e) => setCidade(e.target.value)} aria-label="Cidade" className={`${CAMPO} border-line`}>
            <option value="">Todas as cidades</option>
            {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {!books && (
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Fase" className={`${CAMPO} border-line`}>
              <option value="">Todas as fases</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : visiveis.length === 0 ? (
        <Vazio>{lista.length === 0 ? "Nenhum empreendimento disponível para esta conta." : "Nenhum empreendimento com esses filtros."}</Vazio>
      ) : books ? (
        <ul className="divide-y divide-line-soft rounded-2xl border border-line bg-card px-4">
          {visiveis.map((e) => (
            <li key={e.id} className="animate-fade-in flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.nome}</p>
                <p className="truncate text-[13px] text-ink-3">{e.bairro} · {e.cidade}/{e.uf}</p>
              </div>
              <div className="min-w-0 flex-1 sm:max-w-[500px]"><DocumentosCorretor empreendimentoId={e.id} temBook={e.tem_book} temTabela={e.tem_tabela} /></div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {visiveis.map((e, i) => <Cartao key={e.id} e={e} indice={i} onAbrir={setAberto} />)}
        </ul>
      )}

      {aberto && <Detalhe key={aberto.id} resumo={aberto} onClose={() => {
        setAberto(null);
        if (empreendimentoId) navigate(caminhoCatalogo);
      }} />}
    </div>
  );
}