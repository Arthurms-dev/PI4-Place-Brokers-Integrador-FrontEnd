import { useEffect, useState } from "react";
import { MOCK_PROPERTIES } from "./imoveis";
import { STATUS, formatarFaixa, listarEmpreendimentos } from "@/services/empreendimentos";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

export function normalizarApi(r) {
  const preco = r.preco_min != null ? Number(r.preco_min) : null;
  return {
    id: String(r.id),
    origem: "api",
    title: r.nome,
    tag: STATUS[r.status]?.label ?? "Lançamento",
    cidade: r.cidade,
    uf: r.uf,
    bairro: r.bairro ?? "",
    city: `${r.cidade}, ${r.uf}`,
    image: r.capa_url ?? null,
    galeria: [],
    quartosMax: r.quartos_max ?? r.quartos_min ?? null,
    quartosTexto: formatarFaixa(r.quartos_min, r.quartos_max, "quarto", "quartos"),
    vagasTexto: formatarFaixa(r.vagas_min, r.vagas_max, "vaga", "vagas"),
    area: null,
    precoMin: preco,
    preco: preco != null ? `A partir de ${brl(preco)}` : "Sob consulta",
    disponivel: r.disponivel !== false,
    destaque: Boolean(r.destaque),
    lazer: r.lazer ?? [],
    description: r.descricao ?? "",
    lat: r.latitude ?? null,
    lng: r.longitude ?? null,
    construtora: r.construtora?.nome ?? null,
  };
}

export function normalizarMock(m) {
  const cidade = String(m.city ?? "").split(",")[0].trim();
  const quartos = Number(m.bedrooms) || null;
  return {
    id: String(m.id),
    origem: "mock",
    title: m.title,
    tag: m.type ?? "Lançamento",
    cidade,
    uf: String(m.city ?? "").split(",")[1]?.trim() ?? "PE",
    bairro: "",
    city: m.city,
    image: m.image ?? null,
    galeria: m.galeria ?? [],
    quartosMax: quartos,
    quartosTexto: quartos ? plural(quartos, "quarto", "quartos") : "",
    vagasTexto: m.vagas != null ? plural(m.vagas, "vaga", "vagas") : "",
    area: m.area ?? null,
    precoMin: null,
    preco: m.price ?? "Sob consulta",
    disponivel: true,
    destaque: ["Destaque", "Lançamento"].includes(m.type),
    lazer: m.lazer ?? [],
    description: m.description ?? "",
    lat: m.lat ?? null,
    lng: m.lng ?? null,
    construtora: null,
  };
}

let cache = null;

export function useEmpreendimentosPublicos() {
  const [estado, setEstado] = useState(cache ?? { itens: [], carregando: true, origem: null });

  useEffect(() => {
    if (cache) return undefined;
    let ativo = true;
    listarEmpreendimentos()
      .then((lista) => lista.filter((e) => e.publicado))
      .catch(() => [])
      .then((lista) => {
        const pronto = lista.length
          ? { itens: lista.map(normalizarApi), carregando: false, origem: "api" }
          : { itens: MOCK_PROPERTIES.map(normalizarMock), carregando: false, origem: "mock" };
        cache = pronto;
        if (ativo) setEstado(pronto);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return estado;
}
