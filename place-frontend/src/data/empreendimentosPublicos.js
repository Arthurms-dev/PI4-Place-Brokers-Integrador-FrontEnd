import { useEffect, useState } from "react";
import { obterFichaPublicaVerificada } from "./fichasPublicasVerificadas";
import { prazoDoEmpreendimento, precoDoEmpreendimento } from "@/lib/precoCatalogo";
import {
  STATUS,
  formatarFaixa,
  listarEmpreendimentos,
} from "@/services/empreendimentos";


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

  const galeria = Array.isArray(empreendimento.imagens)
    ? [...empreendimento.imagens]
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .filter((imagem) => typeof imagem.url === "string" && imagem.url.trim())
        .map((imagem) => imagem.url)
    : [];

  return {
    id: String(empreendimento.id),
    origem: "api",
    title: empreendimento.nome,
    tag: STATUS[empreendimento.status]?.label ?? "Lançamento",
    cidade: empreendimento.cidade,
    uf: empreendimento.uf,
    bairro: empreendimento.bairro && empreendimento.bairro !== "A confirmar" ? empreendimento.bairro : "",
    city: `${empreendimento.cidade}, ${empreendimento.uf}`,
    image: empreendimento.capa_url ?? null,
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
    ...(() => {
      const p = precoDoEmpreendimento(empreendimento);
      return {
        precoRotulo: p.rotulo,
        precoValor: `${p.valor}${p.sufixo}`,
        preco: p.temValor ? `${p.rotulo} ${p.valor}${p.sufixo}` : "Sob consulta",
      };
    })(),
    segmento: empreendimento.segmento ?? null,
    parcelaMin: numero(empreendimento.parcela_min),
    entregaEm: empreendimento.previsao_entrega ?? null,
    prazo: prazoDoEmpreendimento(empreendimento),
    disponivel: empreendimento.disponivel !== false,
    destaque: Boolean(empreendimento.destaque),
    lazer: empreendimento.lazer ?? [],
    description: empreendimento.descricao ?? "",
    lat: empreendimento.latitude ?? null,
    lng: empreendimento.longitude ?? null,
    localAproximado: Boolean(empreendimento.localizacao_aproximada),
    construtora: empreendimento.construtora?.nome ?? null,
  };
}

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

  const ESPERAS_MS = [1500, 3000, 5000, 8000, 12000, 15000, 15000];
  const comNovaTentativa = (tentativa = 0) =>
    listarEmpreendimentos({ publico: true }).catch((falha) => {
      if (tentativa >= ESPERAS_MS.length) throw falha;
      return new Promise((resolver) => setTimeout(resolver, ESPERAS_MS[tentativa]))
        .then(() => comNovaTentativa(tentativa + 1));
    });

  carregamento = comNovaTentativa()
    .then((lista) => {
      const publicados = lista.filter((item) => item.publicado === true);

      return {
        itens: publicados.map(normalizarApi),
        carregando: false,
        origem: "api",
        erro: null,
      };
    })
    .catch(() => ({
      itens: [],
      carregando: false,
      origem: null,
      erro: "Não foi possível consultar os empreendimentos na API.",
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