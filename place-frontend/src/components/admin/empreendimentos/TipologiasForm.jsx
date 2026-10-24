import { useEffect, useRef, useState } from "react";
import { Campo, CAMPO } from "@/components/admin/equipe/ui";
import {
  buscarEmpreendimentoPorId,
  criarTipologia,
  atualizarTipologia,
} from "@/services/empreendimentos";

const CAMPOS_INICIAIS = {
  nome: "",
  quartos: "",
  suites: "",
  vagas: "",
  areaM2: "",
  ordem: "0",
};

const CAMPOS_NUMERICOS = [
  { campo: "quartos", rotulo: "Quartos", passo: "1" },
  { campo: "suites", rotulo: "Suítes", passo: "1" },
  { campo: "vagas", rotulo: "Vagas", passo: "1" },
  { campo: "areaM2", rotulo: "Área (m²)", passo: "0.01" },
  { campo: "ordem", rotulo: "Ordem", passo: "1" },
];

function ordenar(lista) {
  return [...lista].sort(
    (a, b) =>
      (a.ordem ?? 0) - (b.ordem ?? 0) ||
      a.nome.localeCompare(b.nome, "pt-BR")
  );
}

function detalhes(tipologia) {
  return [
    tipologia.quartos != null
      ? `${tipologia.quartos} quartos`
      : null,
    tipologia.suites != null
      ? `${tipologia.suites} suítes`
      : null,
    tipologia.vagas != null
      ? `${tipologia.vagas} vagas`
      : null,
    tipologia.area_m2 != null
      ? `${Number(tipologia.area_m2).toLocaleString("pt-BR")} m²`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function TipologiasForm({ empreendimentoId, onAtualizadas }) {
  const aoAtualizarRef = useRef(onAtualizadas);
  useEffect(() => {
    aoAtualizarRef.current = onAtualizadas;
  }, [onAtualizadas]);

  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    setCarregando(true);

    buscarEmpreendimentoPorId(empreendimentoId)
      .then((empreendimento) => {
        if (ativo) {
          const atuais = ordenar(empreendimento.tipologias ?? []);
          setLista(atuais);
          // Sincroniza o formulário e os cards após a leitura inicial da API.
          aoAtualizarRef.current?.(atuais);
        }
      })
      .catch((erro) => {
        if (ativo) setErroGeral(erro.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [empreendimentoId]);

  function alterar(campo, valor) {
    setCampos((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setErros((atual) => ({
      ...atual,
      [campo]: undefined,
    }));
  }

  function novaPlanta() {
    setEditando("novo");
    setCampos({ ...CAMPOS_INICIAIS });
    setErros({});
    setErroGeral("");
  }

  function editarPlanta(tipologia) {
    setEditando(tipologia.id);
    setCampos({
      nome: tipologia.nome ?? "",
      quartos: String(tipologia.quartos ?? ""),
      suites: String(tipologia.suites ?? ""),
      vagas: String(tipologia.vagas ?? ""),
      areaM2: String(tipologia.area_m2 ?? ""),
      ordem: String(tipologia.ordem ?? 0),
    });
    setErros({});
    setErroGeral("");
  }

  function cancelar() {
    setEditando(null);
    setCampos({ ...CAMPOS_INICIAIS });
    setErros({});
    setErroGeral("");
  }

  async function salvar() {
    if (salvando) return;

    const dados = {
      nome: campos.nome.trim(),
      quartos: campos.quartos === "" ? null : Number(campos.quartos),
      suites: campos.suites === "" ? null : Number(campos.suites),
      vagas: campos.vagas === "" ? null : Number(campos.vagas),
      areaM2: campos.areaM2 === "" ? null : Number(campos.areaM2),
      ordem: campos.ordem === "" ? 0 : Number(campos.ordem),
    };

    const novosErros = {};

    if (dados.nome.length < 2) {
      novosErros.nome = "Informe o nome da planta.";
    }

    if (
      dados.quartos != null &&
      dados.suites != null &&
      dados.suites > dados.quartos
    ) {
      novosErros.suites = "Suítes não podem superar os quartos.";
    }

    if (Object.keys(novosErros).length) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    setErroGeral("");
    setErros({});

    try {
      const resultado =
        editando === "novo"
          ? await criarTipologia(empreendimentoId, dados)
          : await atualizarTipologia(empreendimentoId, editando, dados);

      // Notifica o painel somente após a API confirmar o salvamento.
      const novasTipologias = ordenar(
        editando === "novo"
          ? [...lista, resultado]
          : lista.map((item) =>
              item.id === resultado.id ? resultado : item
            )
      );

      setLista(novasTipologias);
      onAtualizadas?.(novasTipologias);
      setEditando(null);
      setCampos({ ...CAMPOS_INICIAIS });
    } catch (erro) {
      setErroGeral(erro.message);
      setErros(erro.fieldErrors ?? {});
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section
      className="space-y-4 border-t border-line-soft pt-5"
      aria-label="Plantas do empreendimento"
      onKeyDown={(evento) => {
        if (
          evento.key === "Enter" &&
          evento.target instanceof HTMLInputElement
        ) {
          evento.preventDefault();
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gold">
            Plantas e tipologias
          </h3>
          <p className="mt-1 text-xs text-ink-3">
            Cadastre as configurações disponíveis no empreendimento.
          </p>
        </div>

        {editando === null && !carregando && (
          <button
            type="button"
            onClick={novaPlanta}
            className="h-10 rounded-xl border border-gold/50 px-4 text-xs font-semibold text-gold hover:bg-gold/10"
          >
            Adicionar planta
          </button>
        )}
      </div>

      {carregando && (
        <p className="text-sm text-ink-3">Carregando plantas...</p>
      )}

      {!carregando && lista.length === 0 && (
        <p className="rounded-xl border border-dashed border-line p-4 text-sm text-ink-3">
          Nenhuma planta cadastrada.
        </p>
      )}

      {!carregando && lista.length > 0 && (
        <div className="space-y-2">
          {lista.map((tipologia) => (
            <div
              key={tipologia.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card-2 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{tipologia.nome}</p>
                <p className="mt-1 text-xs text-ink-3">
                  {detalhes(tipologia) || "Características não informadas"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => editarPlanta(tipologia)}
                disabled={editando !== null}
                className="h-10 rounded-lg border border-line px-4 text-xs font-medium hover:border-gold disabled:opacity-40"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {editando !== null && (
        <div className="space-y-4 rounded-xl border border-gold/30 bg-card-2 p-4">
          <h4 className="text-sm font-semibold">
            {editando === "novo" ? "Nova planta" : "Editar planta"}
          </h4>

          <Campo rotulo="Nome da planta" erro={erros.nome}>
            <input
              value={campos.nome}
              onChange={(evento) =>
                alterar("nome", evento.target.value)
              }
              placeholder="Ex.: Planta de 2 quartos"
              maxLength={120}
              className={`${CAMPO} border-line focus:border-gold`}
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CAMPOS_NUMERICOS.map(({ campo, rotulo, passo }) => (
              <Campo key={campo} rotulo={rotulo} erro={erros[campo]}>
                <input
                  type="number"
                  min="0"
                  step={passo}
                  value={campos[campo]}
                  onChange={(evento) =>
                    alterar(campo, evento.target.value)
                  }
                  className={`${CAMPO} border-line focus:border-gold`}
                />
              </Campo>
            ))}
          </div>

          {erroGeral && (
            <p role="alert" className="text-xs text-danger">
              {erroGeral}
            </p>
          )}

          <p className="text-xs text-ink-3">
            Salvar a planta atualiza o cadastro imediatamente.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelar}
              disabled={salvando}
              className="h-11 flex-1 rounded-xl border border-line text-sm disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="h-11 flex-1 rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar planta"}
            </button>
          </div>
        </div>
      )}

      {erroGeral && editando === null && (
        <p role="alert" className="text-xs text-danger">
          {erroGeral}
        </p>
      )}
    </section>
  );
}
