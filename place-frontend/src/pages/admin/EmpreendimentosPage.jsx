import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import EmpreendimentoForm from "@/components/admin/empreendimentos/EmpreendimentoForm";
import PendenciasDrivePanel from "@/components/admin/empreendimentos/PendenciasDrivePanel";
import { listarDocumentosAdmin } from "@/services/documentosComerciaisAdmin";
import { CAMPO, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { listarConstrutoras } from "@/services/construtoras";
import {
  STATUS,
  atualizarEmpreendimento,
  formatarFaixa,
  listarEmpreendimentos,
} from "@/services/empreendimentos";

const TOM_STATUS = {
  lancamento: "ok",
  obras: "azul",
  pronto: "ouro",
  outros: "neutro",
};

const brl = (valor) =>
  Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

function quartosParaExibicao(empreendimento) {
  const quartosGerais = formatarFaixa(
    empreendimento.quartos_min,
    empreendimento.quartos_max,
    "quarto",
    "quartos"
  );

  if (quartosGerais) return quartosGerais;

  const plantas = Array.isArray(empreendimento.tipologias)
    ? empreendimento.tipologias
    : [];

  const quartosDasPlantas = plantas
    .map((planta) => planta?.quartos)
    .filter((valor) => valor != null && valor !== "")
    .map(Number)
    .filter((valor) => Number.isInteger(valor) && valor >= 0);

  if (!quartosDasPlantas.length) return "";

  return `Plantas cadastradas: ${formatarFaixa(
    Math.min(...quartosDasPlantas),
    Math.max(...quartosDasPlantas),
    "quarto",
    "quartos"
  )}`;
}

function Chave({ ativo, rotulo, onClick, ocupado }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      disabled={ocupado}
      onClick={onClick}
      className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-[13px] transition-colors disabled:opacity-50 ${
        ativo
          ? "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
          : "border-line text-ink-3 hover:border-gold/60 hover:text-ink"
      }`}
    >
      <span className={`size-2 rounded-full ${ativo ? "bg-emerald-400" : "bg-white/30"}`} />
      {rotulo}
    </button>
  );
}

function documentoVigente(doc, tipo) {
  const hoje = new Date().toISOString().slice(0, 10);
  return doc.tipo === tipo && doc.status === "aprovado" &&
    (!doc.validade_ate || doc.validade_ate >= hoje) && !!doc.driveUrl;
}

function Cartao({ e, indice, onEditar, onMudar, docsComerciais }) {
  const [ocupado, setOcupado] = useState(false);

  async function alternar(campo) {
    setOcupado(true);
    try {
      await onMudar(e.id, { [campo]: !e[campo] });
    } catch {
    } finally {
      setOcupado(false);
    }
  }

  const plantas = Array.isArray(e.tipologias) ? e.tipologias : [];
  const book = e.tem_book || (Array.isArray(docsComerciais) && docsComerciais.some((doc) => documentoVigente(doc, "book")));
  const tabela = e.tem_tabela || (Array.isArray(docsComerciais) && docsComerciais.some((doc) => documentoVigente(doc, "tabela")));
  const quartos = quartosParaExibicao(e);
  const vagas = formatarFaixa(e.vagas_min, e.vagas_max, "vaga", "vagas");
  const caracteristicas = [
    quartos,
    vagas,
    e.preco_min != null ? `a partir de ${brl(e.preco_min)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li
      style={{ animationDelay: `${Math.min(indice, 6) * 55}ms` }}
      className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-gold/40"
    >
      <div className="relative aspect-16/9 bg-card-2">
        {e.capa_url ? (
          <img
            src={e.capa_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-gold/60">
            <Icon name="building" className="size-10" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Selo tom={TOM_STATUS[e.status] ?? "neutro"}>
            {STATUS[e.status]?.label ?? e.status}
          </Selo>
        </div>
        <div className="absolute right-3 top-3">
          <Selo tom={e.publicado ? "ok" : "alerta"}>
            {e.publicado ? "Publicado" : "Rascunho"}
          </Selo>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="truncate font-semibold">{e.nome}</h3>
          <p className="truncate text-[13px] text-ink-2">
            {e.bairro} · {e.cidade}/{e.uf}
          </p>
          {e.construtora?.nome && (
            <p className="truncate text-[12px] text-ink-3">
              {e.construtora.nome}
            </p>
          )}
        </div>

        <p className="text-[13px] text-ink-2">
          {caracteristicas || (plantas.length > 0
            ? "Características disponíveis nas plantas cadastradas"
            : "Sem características preenchidas")}
        </p>

        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {plantas.length > 0 && (
            <Selo tom="neutro">
              {plantas.length}{" "}
              {plantas.length === 1 ? "planta cadastrada" : "plantas cadastradas"}
            </Selo>
          )}
          <Selo tom={book ? "ok" : "neutro"}>
            {book ? "Book ✓" : docsComerciais === undefined || docsComerciais === null ? "Book: verificar" : "Sem book"}
          </Selo>
          <Selo tom={tabela ? "ok" : "neutro"}>
            {tabela ? "Tabela ✓" : docsComerciais === undefined || docsComerciais === null ? "Tabela: verificar" : "Sem tabela"}
          </Selo>
          <Selo tom={e.latitude != null ? "ok" : "alerta"}>
            {e.latitude != null ? "No mapa" : "Sem coordenadas"}
          </Selo>
        </div>

        <div className="flex gap-2">
          <Chave
            ativo={e.publicado}
            rotulo="Publicado"
            ocupado={ocupado}
            onClick={() => alternar("publicado")}
          />
          <Chave
            ativo={e.disponivel}
            rotulo="Disponível"
            ocupado={ocupado}
            onClick={() => alternar("disponivel")}
          />
        </div>
        <button
          type="button"
          onClick={() => onEditar(e)}
          className="h-11 w-full rounded-xl border border-line text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink"
        >
          Editar
        </button>
      </div>
    </li>
  );
}

export default function EmpreendimentosPage() {
  usePageTitle("Empreendimentos");
  const [lista, setLista] = useState([]);
  const [docsPorEmp, setDocsPorEmp] = useState({});
  const [construtoras, setConstrutoras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [publicacao, setPublicacao] = useState("");
  const [form, setForm] = useState(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([
      listarEmpreendimentos(),
      listarConstrutoras().catch(() => []),
    ])
      .then(([empreendimentos, listaConstrutoras]) => {
        if (ativo) {
          setLista(empreendimentos);
          setConstrutoras(listaConstrutoras);
        }
      })
      .catch((err) => {
        if (ativo) setErro(err.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (lista.length === 0) return;
    let ativo = true;
    // Consulta separada, pois os indicadores antigos só cobrem book_url/tabela_url.
    Promise.all(lista.map(async (emp) => {
      try { return [String(emp.id), await listarDocumentosAdmin(emp.id)]; }
      catch { return [String(emp.id), null]; }
    })).then((pares) => { if (ativo) setDocsPorEmp((atual) => ({ ...atual, ...Object.fromEntries(pares) })); });
    return () => { ativo = false; };
  }, [lista.length]);

  const mudar = useCallback(async (id, mudancas) => {
    setErro("");
    try {
      const atualizado = await atualizarEmpreendimento(id, mudancas);
      setLista((atual) =>
        atual.map((item) =>
          item.id === id ? { ...item, ...atualizado } : item
        )
      );
    } catch (err) {
      setErro(err.message);
      throw err;
    }
  }, []);

  const visiveis = useMemo(() => {
    const consulta = busca.trim().toLowerCase();
    return lista.filter(
      (item) =>
        (!status || item.status === status) &&
        (!publicacao ||
          (publicacao === "publicado" ? item.publicado : !item.publicado)) &&
        (!consulta ||
          `${item.nome} ${item.cidade} ${item.bairro}`
            .toLowerCase()
            .includes(consulta))
    );
  }, [lista, busca, status, publicacao]);

  const total = lista.length;
  const publicados = lista.filter((item) => item.publicado).length;
  const semMapa = lista.filter((item) => item.latitude == null).length;

  return (
    <div className="space-y-5">
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pb-eyebrow">Portfólio imobiliário</p>
          <h1 className="text-xl font-semibold">Empreendimentos</h1>
          <p className="text-[13px] text-ink-2">
            {total} cadastrados · {publicados} publicados
            {semMapa ? ` · ${semMapa} sem coordenadas` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({})}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110"
        >
          <Icon name="building" className="size-4.5" /> Novo empreendimento
        </button>
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {erro}
        </p>
      )}

      <PendenciasDrivePanel
        onAbrirEmpreendimento={(id) => {
          const empreendimento = lista.find((item) => String(item.id) === String(id));
          if (empreendimento) setForm({ emp: empreendimento });
        }}
      />

      <div className="grid gap-2 sm:grid-cols-[1fr_11rem_11rem]">
        <input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar por nome, cidade ou bairro"
          aria-label="Buscar"
          className={`${CAMPO} border-line focus:border-gold`}
        />
        <select
          value={status}
          onChange={(evento) => setStatus(evento.target.value)}
          aria-label="Fase"
          className={`${CAMPO} border-line`}
        >
          <option value="">Todas as fases</option>
          {Object.entries(STATUS).map(([chave, valor]) => (
            <option key={chave} value={chave}>
              {valor.label}
            </option>
          ))}
        </select>
        <select
          value={publicacao}
          onChange={(evento) => setPublicacao(evento.target.value)}
          aria-label="Publicação"
          className={`${CAMPO} border-line`}
        >
          <option value="">Publicados e rascunhos</option>
          <option value="publicado">Só publicados</option>
          <option value="rascunho">Só rascunhos</option>
        </select>
      </div>

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((indice) => (
            <div key={indice} className="h-96 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <Vazio>
          {total === 0
            ? "Nenhum empreendimento cadastrado ainda."
            : "Nenhum empreendimento com esses filtros."}
          {total === 0 && (
            <button
              type="button"
              onClick={() => setForm({})}
              className="ml-1 text-gold hover:underline"
            >
              Cadastrar o primeiro
            </button>
          )}
        </Vazio>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((item, indice) => (
            <Cartao
              key={item.id}
              e={item}
              indice={indice}
              onEditar={(empreendimento) => setForm({ emp: empreendimento })}
              onMudar={mudar}
              docsComerciais={docsPorEmp[String(item.id)]}
            />
          ))}
        </ul>
      )}

      {form && (
        <EmpreendimentoForm
          key={form.emp?.id ?? "novo"}
          empreendimento={form.emp}
          construtoras={construtoras}
          onConstrutoraCriada={(nova) =>
            setConstrutoras((atual) =>
              [...atual, nova].sort((a, b) => a.nome.localeCompare(b.nome))
            )
          }
          onClose={() => setForm(null)}
          onDocumentosAtualizados={(empreendimentoId, documentos) => {
            setDocsPorEmp((atual) => ({ ...atual, [String(empreendimentoId)]: documentos }));
          }}
          onCapaAtualizada={(empreendimentoId, capaUrl) => {
            setLista((atual) => atual.map((item) => String(item.id) === String(empreendimentoId)
              ? { ...item, capa_url: capaUrl } : item));
          }}
          onTipologiasAtualizadas={(empreendimentoId, tipologias) => {
            setLista((atual) =>
              atual.map((item) =>
                String(item.id) === String(empreendimentoId)
                  ? { ...item, tipologias }
                  : item
              )
            );
          }}
          onSalvo={(salvo, novo) => {
            if (novo) setDocsPorEmp((atual) => ({ ...atual, [String(salvo.id)]: [] }));
            setLista((atual) =>
              novo
                ? [salvo, ...atual]
                : atual.map((item) =>
                    item.id === salvo.id ? { ...item, ...salvo } : item
                  )
            );
            setForm(null);
          }}
        />
      )}
    </div>
  );
}
