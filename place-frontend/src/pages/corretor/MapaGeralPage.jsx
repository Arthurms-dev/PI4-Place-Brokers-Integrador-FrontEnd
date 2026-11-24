import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapTiles } from "@/components/map/MapTiles";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/cn";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listarEmpreendimentos, STATUS } from "@/services/empreendimentos";
import { listarConstrutoras } from "@/services/construtoras";
import { normalizarTexto, valoresUnicos, localExibicao, criarIconesPorStatus } from "@/lib/mapHelpers";
import { FitBounds } from "@/components/map/FitBounds";
import { MarcadoresAgrupados } from "@/components/map/MarcadoresAgrupados";
import { AbasCatalogo } from "@/components/catalogo/AbasCatalogo";

const ICONES = criarIconesPorStatus(STATUS);
const FILTRO_VAZIO = { uf: "", cidade: "", bairro: "", construtoraId: "", busca: "", apenasDisponiveis: false };

export default function MapaGeralPage() {
  usePageTitle("Mapa dos empreendimentos");

  const { data: empreendimentos, loading: carregandoEmpreendimentos } = useAsyncData(listarEmpreendimentos);
  const { data: construtoras, loading: carregandoConstrutoras } = useAsyncData(listarConstrutoras);

  const lista = useMemo(() => (empreendimentos ?? []).filter((e) => e.publicado), [empreendimentos]);
  const listaConstrutoras = construtoras ?? [];
  const carregando = carregandoEmpreendimentos || carregandoConstrutoras;

  const [f, setF] = useState(FILTRO_VAZIO);
  const [ocultos, setOcultos] = useState([]);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const qtdFiltros = ["uf", "cidade", "bairro", "construtoraId"].filter((k) => f[k]).length;

  const set = (k, v) =>
    setF((s) => ({ ...s, [k]: v, ...(k === "uf" && { cidade: "", bairro: "" }), ...(k === "cidade" && { bairro: "" }) }));
  const limpar = () => { setF(FILTRO_VAZIO); setOcultos([]); };
  const alternar = (s) => setOcultos((o) => (o.includes(s) ? o.filter((x) => x !== s) : [...o, s]));

  const ufs = valoresUnicos(lista.map((e) => e.uf));
  const cidades = valoresUnicos(lista.filter((e) => !f.uf || e.uf === f.uf).map((e) => e.cidade));
  const bairros = valoresUnicos(lista.filter((e) => (!f.uf || e.uf === f.uf) && (!f.cidade || e.cidade === f.cidade)).map((e) => e.bairro));

  const filtrados = useMemo(() => {
    const q = normalizarTexto(f.busca.trim());
    return lista.filter(
      (e) =>
        (!f.uf || e.uf === f.uf) &&
        (!f.cidade || e.cidade === f.cidade) &&
        (!f.bairro || e.bairro === f.bairro) &&
        (!f.construtoraId || e.construtora_id === f.construtoraId) &&
        (!f.apenasDisponiveis || e.disponivel) &&
        !ocultos.includes(e.status) &&
        (!q || normalizarTexto(`${e.nome} ${e.bairro} ${e.cidade}`).includes(q)) &&
        e.latitude != null && e.longitude != null,
    );
  }, [lista, f, ocultos]);

  const semLocal = lista.filter((e) => e.latitude == null || e.longitude == null).length;

  return (
    <div className="space-y-4.5">
      <header className="space-y-3">
        <div>
          <h1 className="text-xl font-semibold">Empreendimentos</h1>
          <p className="text-[13px] text-ink-2">
            {carregando || semLocal === 0
              ? "Filtre por região, construtora, etapa ou disponibilidade."
              : `${lista.length - semLocal} de ${lista.length} empreendimentos têm localização cadastrada; os outros aparecem só na lista.`}
          </p>
        </div>
        <AbasCatalogo />
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="rounded-xl border border-line bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex h-11 min-w-0 flex-1 basis-56 items-center gap-2.5 rounded-lg border border-line bg-card-2 px-3.5 text-ink-3 focus-within:border-gold">
              <Icon name="search" className="size-4.5" />
              <input
                value={f.busca}
                onChange={(e) => set("busca", e.target.value)}
                placeholder="Digite a cidade, bairro ou região..."
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3 sm:text-[13px]"
              />
            </label>
            {/* No celular, os 4 filtros ficam recolhidos para o mapa aparecer logo. */}
            <button type="button" onClick={() => setFiltrosAbertos((v) => !v)} aria-expanded={filtrosAbertos} aria-controls="filtros-mapa"
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-xs text-ink-2 lg:hidden">
              <Icon name="list" className="size-4" /> Filtros{qtdFiltros ? ` (${qtdFiltros})` : ""}
            </button>
            <button type="button" onClick={limpar} className="inline-flex h-11 shrink-0 items-center gap-1.5 px-2 text-xs text-gold hover:underline">
              Limpar <Icon name="refresh" className="size-3.5" />
            </button>
          </div>

          <div id="filtros-mapa" className={cn("mt-3 gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-4", filtrosAbertos ? "grid" : "hidden")}>
            {[["Estado", "uf", ufs, "Todos"], ["Cidade", "cidade", cidades, "Todas"], ["Bairro", "bairro", bairros, "Todos"]].map(
              ([rotulo, k, ops, todos]) => (
                <label key={k} className="relative block rounded-lg border border-line bg-card-2 text-xs text-ink-3 focus-within:border-gold">
                  <span className="pointer-events-none absolute left-3 top-2">{rotulo}</span>
                  <select value={f[k]} onChange={(e) => set(k, e.target.value)} className="h-14 w-full cursor-pointer bg-transparent px-3 pt-5 text-base text-ink outline-none sm:text-[13px]">
                    <option value="" className="bg-card">{todos}</option>
                    {ops.map((o) => <option key={o} value={o} className="bg-card">{o}</option>)}
                  </select>
                </label>
              ),
            )}
            <label className="relative block rounded-lg border border-line bg-card-2 text-xs text-ink-3 focus-within:border-gold">
              <span className="pointer-events-none absolute left-3 top-2">Construtora</span>
              <select value={f.construtoraId} onChange={(e) => set("construtoraId", e.target.value)} className="h-14 w-full cursor-pointer bg-transparent px-3 pt-5 text-base text-ink outline-none sm:text-[13px]">
                <option value="" className="bg-card">Todas</option>
                {listaConstrutoras.map((c) => <option key={c.id} value={c.id} className="bg-card">{c.nome}</option>)}
              </select>
            </label>
          </div>

          <div className="my-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {Object.entries(STATUS).map(([k, s]) => (
              <button
                key={k}
                type="button"
                aria-pressed={!ocultos.includes(k)}
                onClick={() => alternar(k)}
                className={cn("inline-flex min-h-11 items-center gap-2 text-xs text-ink-2", ocultos.includes(k) && "opacity-40")}
              >
                <span className="size-3 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
            <label className="ml-auto inline-flex min-h-11 items-center gap-2 text-xs text-ink-2">
              <input
                type="checkbox"
                checked={f.apenasDisponiveis}
                onChange={(e) => set("apenasDisponiveis", e.target.checked)}
                className="size-4 accent-gold"
              />
              Somente disponíveis
            </label>
          </div>

          {carregando ? (
            <div className="grid h-105 place-items-center rounded-lg border border-line text-ink-2">Carregando mapa…</div>
          ) : (
            <div className="h-105 overflow-hidden rounded-lg border border-line">
              <MapContainer center={[-8.05, -34.9]} zoom={11} scrollWheelZoom className="h-full w-full bg-card-2">
                <MapTiles />
                <FitBounds pontos={filtrados} />
                <MarcadoresAgrupados
                  pontos={filtrados}
                  renderizar={(e) => (
                    <Marker position={[e.latitude, e.longitude]} icon={ICONES[e.status]} title={e.nome}>
                      <Popup>
                        <b>{e.nome}</b>{!e.disponivel && " (esgotado)"}<br />
                        {localExibicao(e)}<br />
                        {e.localizacao_aproximada && <><small>Localização aproximada (bairro)</small><br /></>}
                        {e.construtora?.nome && <>{e.construtora.nome}<br /></>}
                        <Link to={`/corretor/empreendimentos/${e.id}`}>Ver detalhes</Link>
                      </Popup>
                    </Marker>
                  )}
                  listar={(itens) => (
                    <>
                      <b>{itens.length} empreendimentos neste ponto</b><br />
                      <small>Localização aproximada (bairro)</small>
                      <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                        {itens.map((e) => <li key={e.id}><Link to={`/corretor/empreendimentos/${e.id}`}>{e.nome}</Link>{!e.disponivel && " (esgotado)"}</li>)}
                      </ul>
                    </>
                  )}
                />
              </MapContainer>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-3 text-[15px] font-medium">
            {filtrados.length} empreendimento{filtrados.length === 1 ? "" : "s"} encontrado{filtrados.length === 1 ? "" : "s"}
          </h2>
          <div className="flex flex-col divide-y divide-line-soft">
            {filtrados.map((e) => (
              <Link key={e.id} to={`/corretor/empreendimentos/${e.id}`} className="flex min-h-11 items-center justify-between gap-2 py-2.5 text-[13px] hover:text-gold">
                <div className="min-w-0">
                  <b className="block truncate">{e.nome}</b>
                  <span className="block text-xs text-ink-3">{localExibicao(e)}{!e.disponivel && " · esgotado"}</span>
                </div>
                <span className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold text-page" style={{ background: STATUS[e.status]?.color }}>
                  {STATUS[e.status]?.label}
                </span>
              </Link>
            ))}
            {filtrados.length === 0 && !carregando && (
              <p className="py-4 text-center text-[13px] text-ink-2">Nenhum empreendimento encontrado com esses filtros.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
