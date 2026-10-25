import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { Foto } from "./pecas";

const categorias = [
  {
    nome: "Até R$ 350 mil",
    detalhe: "Preço inicial",
    icone: "home",
    filtro: { precoAte: "350000" },
    incluir: (item) => item.precoMin != null && item.precoMin <= 350000,
  },
  {
    nome: "2 quartos ou mais",
    detalhe: "Mais espaço",
    icone: "bedDouble",
    filtro: { quartos: "2" },
    incluir: (item) => Number(item.quartosMax ?? 0) >= 2,
  },
  {
    nome: "Lançamentos",
    detalhe: "Novos projetos",
    icone: "building",
    filtro: { tag: "Lançamento" },
    incluir: (item) => item.tag === "Lançamento",
  },
  {
    nome: "Prontos para morar",
    detalhe: "Construção concluída",
    icone: "calendar",
    filtro: { tag: "Pronto" },
    incluir: (item) => item.tag === "Pronto",
  },
];

export default function ExplorarRegioes({ itens, onEscolher }) {
  const opcoes = useMemo(
    () => categorias
      .map((categoria) => ({
        ...categoria,
        quantidade: itens.filter(categoria.incluir).length,
        exemplo: itens.find((item) => categoria.incluir(item) && item.image),
      }))
      .filter((categoria) => categoria.quantidade > 0),
    [itens]
  );

  if (!opcoes.length) return null;

  return (
    <section
      className="pb-c-explore mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14"
      aria-labelledby="pb-c-explore-title"
    >
      <div className="mb-5">
        <p className="pb-site-eyebrow">Seu jeito de escolher</p>
        <h2
          id="pb-c-explore-title"
          className="text-2xl font-extrabold tracking-tight text-[#0b203b] sm:text-[29px]"
        >
          O que faz um lugar ser seu?
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {opcoes.map((opcao) => (
          <button
            key={opcao.nome}
            type="button"
            onClick={() => onEscolher(opcao.filtro)}
            className="pb-home-collection group text-left"
          >
            <span className="pb-home-collection-photo">
              <Foto p={opcao.exemplo ?? { title: opcao.nome }} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {opcao.exemplo && <small>{opcao.exemplo.title}</small>}
            </span>
            <span className="pb-home-collection-info">
            <span className="min-w-0 flex-1">
              <strong className="block text-[14px] text-[#102843]">
                {opcao.nome}
              </strong>
              <span className="mt-1 block text-[11px] text-[#718399]">
                {opcao.quantidade} {opcao.quantidade === 1 ? "imóvel" : "imóveis"} · {opcao.detalhe}
              </span>
            </span>

            <Icon
              name="arrowRight"
              className="size-4 text-[#a77537] transition-transform group-hover:translate-x-1"
            />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
