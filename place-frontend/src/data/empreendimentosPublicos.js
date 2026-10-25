import { useEffect, useState } from "react";
import { MOCK_PROPERTIES } from "./imoveis";
import { obterMidiasPublicasVerificadas } from "./midiasPublicasVerificadas";
import { prepararImagensPublicas } from "@/lib/imagensPublicas";
import { obterFichaPublicaVerificada } from "./fichasPublicasVerificadas";
import {
  STATUS,
  formatarFaixa,
  listarEmpreendimentos,
} from "@/services/empreendimentos";

const formatoPreco = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function numero(valor) {
  if (valor == null || valor === "") return null;
  const resultado = Number(valor);
  return Number.isFinite(resultado) ? resultado : null;
}

function formatarArea(min, max) {
  const valorMinimo = numero(min);
  const valorMaximo = numero(max);
  const minimo = valorMinimo != null && valorMinimo > 0 ? valorMinimo : null;
  const maximo = valorMaximo != null && valorMaximo > 0 ? valorMaximo : null;

  if (minimo == null && maximo == null) return null;
  if (minimo != null && maximo != null && minimo > maximo) return null;

  const formatar = (valor) =>
    valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  if (minimo == null) return `Até ${formatar(maximo)} m²`;
  if (maximo == null) return `A partir de ${formatar(minimo)} m²`;
  if (minimo === maximo) return `${formatar(minimo)} m²`;
  return `${formatar(minimo)} a ${formatar(maximo)} m²`;
}

export function normalizarApi(empreendimento) {
  const preco = numero(empreendimento.preco_min);
  const precoMin = preco != null && preco > 0 ? preco : null;
  const ficha = obterFichaPublicaVerificada(empreendimento.nome);

  // A API pode retornar plantas mesmo quando a faixa geral de quartos está vazia.
  // Não assumimos que uma planta representa todas as unidades do empreendimento.
  const tipologias = Array.isArray(empreendimento.tipologias)
    ? empreendimento.tipologias
    : [];

  const quartosDasPlantas = tipologias
    .map((planta) => numero(planta?.quartos))
    .filter((valor) => valor != null && Number.isInteger(valor) && valor >= 0);

  const quartosMaxGeral = numero(empreendimento.quartos_max ?? empreendimento.quartos_min);
  const quartosMax = quartosMaxGeral ?? (
    quartosDasPlantas.length > 0 ? Math.max(...quartosDasPlantas) : null
  );

  const quartosTextoGeral = formatarFaixa(
    empreendimento.quartos_min,
    empreendimento.quartos_max,
    "quarto",
    "quartos"
  );

  const quartosTexto = quartosTextoGeral || (
    quartosDasPlantas.length > 0
      ? `Plantas cadastradas: ${formatarFaixa(
          Math.min(...quartosDasPlantas),
          Math.max(...quartosDasPlantas),
          "quarto",
          "quartos"
        )}`
      : ""
  );

  const suitesTexto = formatarFaixa(
    empreendimento.suites_min,
    empreendimento.suites_max,
    "suíte",
    "suítes"
  );

  const midias = obterMidiasPublicasVerificadas(empreendimento.nome);
  const imagensCadastradas = prepararImagensPublicas({ imagens: empreendimento.imagens, titulo: empreendimento.nome });
  const galeria = imagensCadastradas.length ? imagensCadastradas : midias;

  return {
    id: String(empreendimento.id),
    origem: "api",
    title: empreendimento.nome,
    tag: STATUS[empreendimento.status]?.label ?? "Lançamento",
    cidade: empreendimento.cidade,
    uf: empreendimento.uf,
    bairro: empreendimento.bairro ?? "",
    city: `${empreendimento.cidade}, ${empreendimento.uf}`,
    image: empreendimento.capa_url || midias[0]?.src || null,
    galeria,
    quartosMax,
    quartosTexto,
    tipologias,
    suitesTexto: suitesTexto || ficha?.suitesTexto || "",
    tipoTexto: ficha?.tipoTexto ?? "",
    vagasTexto: formatarFaixa(
      empreendimento.vagas_min,
      empreendimento.vagas_max,
      "vaga",
      "vagas"
    ),
    area: formatarArea(empreendimento.area_min, empreendimento.area_max),
    precoMin,
    preco:
      precoMin != null
        ? `A partir de ${formatoPreco.format(precoMin)}`
        : "Sob consulta",
    disponivel: empreendimento.disponivel !== false,
    destaque: Boolean(empreendimento.destaque),
    lazer: empreendimento.lazer ?? [],
    description: empreendimento.descricao ?? "",
    lat: empreendimento.latitude ?? null,
    lng: empreendimento.longitude ?? null,
    construtora: empreendimento.construtora?.nome ?? null,
  };
}

export function normalizarMock(imovel) {
  const [cidade = "", uf = "PE"] = String(imovel.city ?? "")
    .split(",")
    .map((parte) => parte.trim());

  const quartos = numero(imovel.bedrooms);

  return {
    id: String(imovel.id),
    origem: "mock",
    title: imovel.title,
    tag: imovel.type ?? "Lançamento",
    cidade,
    uf,
    bairro: "",
    city: imovel.city,
    image: imovel.image ?? null,
    galeria: imovel.galeria ?? [],
    quartosMax: quartos,
    quartosTexto: formatarFaixa(quartos, quartos, "quarto", "quartos"),
    tipologias: [],
    suitesTexto: "",
    tipoTexto: "",
    vagasTexto: formatarFaixa(imovel.vagas, imovel.vagas, "vaga", "vagas"),
    area: imovel.area ?? null,
    precoMin: null,
    preco: imovel.price ?? "Sob consulta",
    disponivel: true,
    destaque: ["Destaque", "Lançamento"].includes(imovel.type),
    lazer: imovel.lazer ?? [],
    description: imovel.description ?? "",
    lat: imovel.lat ?? null,
    lng: imovel.lng ?? null,
    construtora: null,
  };
}

const MODO_DEMO = import.meta.env.VITE_DEMO_MODE === "true";
const TEMPO_CACHE = 45_000;

const ESTADO_INICIAL = {
  itens: [],
  carregando: true,
  origem: null,
  erro: null,
};

let cache = null;
let carregamento = null;

function cacheRecente() {
  return cache && Date.now() - cache.quando < TEMPO_CACHE
    ? cache.estado
    : null;
}

function carregarCatalogoPublico() {
  const recente = cacheRecente();

  if (recente) return Promise.resolve(recente);
  if (carregamento) return carregamento;

  carregamento = listarEmpreendimentos({ publico: true })
    .then((lista) => {
      const publicados = lista.filter((item) => item.publicado === true);

      if (publicados.length) {
        return {
          itens: publicados.map(normalizarApi),
          carregando: false,
          origem: "api",
          erro: null,
        };
      }

      return {
        itens: MODO_DEMO ? MOCK_PROPERTIES.map(normalizarMock) : [],
        carregando: false,
        origem: MODO_DEMO ? "mock" : "api",
        erro: null,
      };
    })
    .catch(() => ({
      itens: MODO_DEMO ? MOCK_PROPERTIES.map(normalizarMock) : [],
      carregando: false,
      origem: MODO_DEMO ? "mock" : null,
      erro: MODO_DEMO
        ? null
        : "Não foi possível consultar os empreendimentos na API.",
    }))
    .then((estado) => {
      if (!estado.erro) {
        cache = { estado, quando: Date.now() };
      }
      return estado;
    })
    .finally(() => {
      carregamento = null;
    });

  return carregamento;
}

export function useEmpreendimentosPublicos() {
  const [estado, setEstado] = useState(
    () => cacheRecente() ?? ESTADO_INICIAL
  );

  useEffect(() => {
    let ativo = true;

    carregarCatalogoPublico().then((resultado) => {
      if (ativo) setEstado(resultado);
    });

    return () => {
      ativo = false;
    };
  }, []);

  return estado;
}
