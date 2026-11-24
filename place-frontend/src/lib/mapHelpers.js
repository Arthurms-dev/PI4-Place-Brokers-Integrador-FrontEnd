import L from "leaflet";

export const normalizarTexto = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export const valoresUnicos = (a) => [...new Set(a)].sort();
export const localExibicao = (e) => `${e.bairro} · ${e.cidade}/${e.uf}`;

function criarPin(color) {
  return L.divIcon({
    className: "",
    // O pino tem 22 px, mas a área de toque tem 44 × 44 (fica em volta, com a ponta no mesmo lugar).
    html: `<span style="display:flex;align-items:flex-end;justify-content:center;width:44px;height:44px"><span style="display:block;width:22px;height:22px;margin-bottom:4px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);background:${color}"></span></span>`,
    iconSize: [44, 44], iconAnchor: [22, 40], popupAnchor: [0, -22],
  });
}

/** @param {typeof import("@/services/empreendimentos").STATUS} STATUS */
export function criarIconesPorStatus(STATUS) {
  return Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, criarPin(v.color)]));
}