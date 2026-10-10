import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CAMPO, Folha, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { STATUS, buscarEmpreendimentoPorId, formatarFaixa, listarEmpreendimentos, urlDoDocumento } from "@/services/empreendimentos";

const MiniMapa = lazy(() => import("@/components/site/MiniMapa"));
const TOM_STATUS = { lancamento: "ok", obras: "azul", pronto: "ouro", outros: "neutro" };
const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Documento({ empreendimentoId, tipo, disponivel, rotulo }) {
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
      const url = await urlDoDocumento(empreendimentoId, tipo);
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
  useEffect(() => {
    buscarEmpreendimentoPorId(resumo.id).then((d) => setEmp((s) => ({ ...s, ...d }))).catch(() => {});
  }, [resumo.id]);

  const imagens = useMemo(() => {
    const galeria = [...(emp.imagens ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)).map((i) => i.url);
    return [emp.capa_url, ...galeria].filter(Boolean).filter((u, i, l) => l.indexOf(u) === i);
  }, [emp]);
  const temMapa = emp.latitude != null && emp.longitude != null;
  const dados = [
    ["Quartos", formatarFaixa(emp.quartos_min, emp.quartos_max, "quarto", "quartos")],
    ["Vagas", formatarFaixa(emp.vagas_min, emp.vagas_max, "vaga", "vagas")],
    ["A partir de", emp.preco_min != null ? brl(emp.preco_min) : null],
    ["Até", emp.preco_max != null ? brl(emp.preco_max) : null],
  ].filter(([, v]) => v);

  return (
    <Folha titulo={emp.nome} onClose={onClose} largo>
      <div className="space-y-5">
        {imagens.length > 0 && <Fotos imagens={imagens} titulo={emp.nome} />}

        <div className="flex flex-wrap items-center gap-2">
          <Selo tom={TOM_STATUS[emp.status] ?? "neutro"}>{STATUS[emp.status]?.label ?? emp.status}</Selo>
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

        <div className="flex flex-col gap-2 sm:flex-row">
          <Documento empreendimentoId={emp.id} tipo="book" disponivel={emp.tem_book} rotulo="Abrir book" />
          <Documento empreendimentoId={emp.id} tipo="tabela" disponivel={emp.tem_tabela} rotulo="Abrir tabela de preços" />
        </div>

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

function Cartao({ e, indice, onAbrir }) {
  const partes = [formatarFaixa(e.quartos_min, e.quartos_max, "quarto", "quartos"), formatarFaixa(e.vagas_min, e.vagas_max, "vaga", "vagas"), e.preco_min != null ? `a partir de ${brl(e.preco_min)}` : null].filter(Boolean);
  return (
    <li style={{ animationDelay: `${Math.min(indice, 6) * 55}ms` }} className="animate-fade-up">
      <button type="button" onClick={() => onAbrir(e)} className="group block w-full overflow-hidden rounded-2xl border border-line bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl hover:shadow-black/30">
        <div className="relative aspect-16/10 overflow-hidden bg-card-2">
          {e.capa_url ? <img src={e.capa_url} alt="" loading="lazy" decoding="async" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid size-full place-items-center text-gold/60"><Icon name="building" className="size-10" /></div>}
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Selo tom={TOM_STATUS[e.status] ?? "neutro"}>{STATUS[e.status]?.label ?? e.status}</Selo>
            {!e.disponivel && <Selo tom="perigo">Indisponível</Selo>}
          </div>
        </div>
        <div className="space-y-2 p-4">
          <h3 className="truncate font-semibold">{e.nome}</h3>
          <p className="truncate text-[13px] text-ink-2">{e.bairro} · {e.cidade}/{e.uf}</p>
          <p className="text-[13px] text-ink-3">{partes.join(" · ") || "Características em breve"}</p>
          <div className="flex gap-1.5"><Selo tom={e.tem_book ? "ok" : "neutro"}>{e.tem_book ? "Book ✓" : "Sem book"}</Selo><Selo tom={e.tem_tabela ? "ok" : "neutro"}>{e.tem_tabela ? "Tabela ✓" : "Sem tabela"}</Selo></div>
        </div>
      </button>
    </li>
  );
}

export default function CatalogoPage({ modo = "catalogo" }) {
  const books = modo === "books";
  usePageTitle(books ? "Books e tabelas" : "Empreendimentos");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("");
  const [status, setStatus] = useState("");
  const [soDisponiveis, setSoDisponiveis] = useState(false);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    let ativo = true;
    listarEmpreendimentos()
      .then((l) => ativo && setLista(l.filter((e) => e.publicado)))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const cidades = useMemo(() => [...new Set(lista.map((e) => e.cidade))].sort((a, b) => a.localeCompare(b)), [lista]);
  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return lista.filter((e) => (!cidade || e.cidade === cidade) && (!status || e.status === status) && (!soDisponiveis || e.disponivel) && (!q || `${e.nome} ${e.bairro} ${e.cidade}`.toLowerCase().includes(q)));
  }, [lista, busca, cidade, status, soDisponiveis]);

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold">{books ? "Books e tabelas" : "Empreendimentos"}</h1>
        <p className="text-[13px] text-ink-2">{books ? "Abra o book e a tabela de preços de cada empreendimento." : "Conheça os produtos, fotos, valores e localização."}</p>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      <div className="grid gap-2 sm:grid-cols-[1fr_11rem_11rem_auto]">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, bairro ou cidade" aria-label="Buscar" className={`${CAMPO} border-line focus:border-gold`} />
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
        <button type="button" role="switch" aria-checked={soDisponiveis} onClick={() => setSoDisponiveis((v) => !v)}
          className={`h-12 rounded-xl border px-4 text-sm transition-colors ${soDisponiveis ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
          Só disponíveis
        </button>
      </div>

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : visiveis.length === 0 ? (
        <Vazio>{lista.length === 0 ? "Nenhum empreendimento publicado ainda." : "Nenhum empreendimento com esses filtros."}</Vazio>
      ) : books ? (
        <ul className="divide-y divide-line-soft rounded-2xl border border-line bg-card px-4">
          {visiveis.map((e) => (
            <li key={e.id} className="animate-fade-in flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.nome}</p>
                <p className="truncate text-[13px] text-ink-3">{e.bairro} · {e.cidade}/{e.uf}</p>
              </div>
              <div className="flex gap-2 sm:w-96"><Documento empreendimentoId={e.id} tipo="book" disponivel={e.tem_book} rotulo="Book" /><Documento empreendimentoId={e.id} tipo="tabela" disponivel={e.tem_tabela} rotulo="Tabela" /></div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((e, i) => <Cartao key={e.id} e={e} indice={i} onAbrir={setAberto} />)}
        </ul>
      )}

      {aberto && <Detalhe key={aberto.id} resumo={aberto} onClose={() => setAberto(null)} />}
    </div>
  );
}