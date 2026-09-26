import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listarEmpreendimentos, STATUS } from "@/services/empreendimentos";
import { listarConstrutoras } from "@/services/construtoras";
import { normalizarTexto, valoresUnicos, localExibicao, criarIconesPorStatus } from "@/lib/mapHelpers";
import { FitBounds } from "@/components/map/FitBounds";

const ICONES = criarIconesPorStatus(STATUS);
const FILTRO_VAZIO = { uf: "", cidade: "", bairro: "", construtoraId: "", busca: "", apenasDisponiveis: false };

export default function MapaGeralPage() {

  const { data: empreendimentos, loading: carregandoEmpreendimentos } = useAsyncData(listarEmpreendimentos);
  const { data: construtoras, loading: carregandoConstrutoras } = useAsyncData(listarConstrutoras);

  const lista = empreendimentos ?? [];
  const listaConstrutoras = construtoras ?? [];
  const carregando = carregandoEmpreendimentos || carregandoConstrutoras;

  const [f, setF] = useState(FILTRO_VAZIO);
  const [ocultos, setOcultos] = useState([]);

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

  return (
    <div className="space-y-4.5">
      <header>
        <h1 className="text-[28px] font-semibold">Mapa Geral</h1>
        <p className="mt-1.5 max-w-lg text-[13px] text-ink-2">
          Todos os empreendimentos num só mapa — filtre por região, construtora, etapa ou disponibilidade.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="rounded-xl border border-line bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <label className="flex h-9.5 flex-1 items-center gap-2.5 rounded-lg border border-line bg-card-2 px-3.5 text-ink-3 focus-within:border-gold">
              <Icon name="search" className="size-4.5" />
              <input
                value={f.busca}
                onChange={(e) => set("busca", e.target.value)}
                placeholder="Digite a cidade, bairro ou região..."
                className="flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
              />
            </label>
            <button type="button" onClick={limpar} className="inline-flex shrink-0 items-center gap-1.5 text-[12px] text-gold hover:underline">
              Limpar filtros <Icon name="refresh" className="size-3.5" />
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Estado", "uf", ufs, "Todos"], ["Cidade", "cidade", cidades, "Todas"], ["Bairro", "bairro", bairros, "Todos"]].map(
              ([rotulo, k, ops, todos]) => (
                <label key={k} className="flex flex-col gap-0.5 rounded-lg border border-line bg-card-2 px-3 py-2 text-[11px] text-ink-3">
                  {rotulo}
                  <select value={f[k]} onChange={(e) => set(k, e.target.value)} className="cursor-pointer bg-transparent text-[13px] text-ink outline-none">
                    <option value="" className="bg-card">{todos}</option>
                    {ops.map((o) => <option key={o} value={o} className="bg-card">{o}</option>)}
                  </select>
                </label>
              ),
            )}
            <label className="flex flex-col gap-0.5 rounded-lg border border-line bg-card-2 px-3 py-2 text-[11px] text-ink-3">
              Construtora
              <select value={f.construtoraId} onChange={(e) => set("construtoraId", e.target.value)} className="cursor-pointer bg-transparent text-[13px] text-ink outline-none">
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
                className={cn("inline-flex items-center gap-2 text-[12px] text-ink-2", ocultos.includes(k) && "opacity-40")}
              >
                <span className="size-3 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
            <label className="ml-auto inline-flex items-center gap-2 text-[12px] text-ink-2">
              <input
                type="checkbox"
                checked={f.apenasDisponiveis}
                onChange={(e) => set("apenasDisponiveis", e.target.checked)}
                className="size-3.5 accent-gold"
              />
              Somente disponíveis
            </label>
          </div>

          {carregando ? (
            <div className="grid h-105 place-items-center rounded-lg border border-line text-ink-2">Carregando mapa…</div>
          ) : (
            <div className="h-105 overflow-hidden rounded-lg border border-line">
              <MapContainer center={[-8.05, -34.9]} zoom={11} scrollWheelZoom className="h-full w-full bg-card-2">
                <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <FitBounds pontos={filtrados} />
                {filtrados.map((e) => (
                  <Marker key={e.id} position={[e.latitude, e.longitude]} icon={ICONES[e.status]}>
                    <Popup>
                      <b>{e.nome}</b>{!e.disponivel && " (esgotado)"}<br />
                      {localExibicao(e)}<br />
                      {e.construtora?.nome && <>{e.construtora.nome}<br /></>}
                      <Link to={`/corretor/empreendimentos/${e.id}`}>Ver detalhes</Link>
                    </Popup>
                  </Marker>
                ))}
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
              <Link key={e.id} to={`/corretor/empreendimentos/${e.id}`} className="flex items-center justify-between gap-2 py-2.5 text-[13px]">
                <div className="min-w-0">
                  <b className="block truncate">{e.nome}</b>
                  <small className="text-ink-3">{localExibicao(e)}{!e.disponivel && " · esgotado"}</small>
                </div>
                <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold text-page" style={{ background: STATUS[e.status]?.color }}>
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