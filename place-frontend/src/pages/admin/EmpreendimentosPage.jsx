import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import EmpreendimentoForm from "@/components/admin/empreendimentos/EmpreendimentoForm";
import { CAMPO, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { listarConstrutoras } from "@/services/construtoras";
import { STATUS, atualizarEmpreendimento, formatarFaixa, listarEmpreendimentos } from "@/services/empreendimentos";

const TOM_STATUS = { lancamento: "ok", obras: "azul", pronto: "ouro", outros: "neutro" };
const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Chave({ ativo, rotulo, onClick, ocupado }) {
  return (
    <button type="button" role="switch" aria-checked={ativo} disabled={ocupado} onClick={onClick}
      className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-[13px] transition-colors disabled:opacity-50 ${ativo ? "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10" : "border-line text-ink-3 hover:border-gold/60 hover:text-ink"}`}>
      <span className={`size-2 rounded-full ${ativo ? "bg-emerald-400" : "bg-white/30"}`} /> {rotulo}
    </button>
  );
}

function Cartao({ e, indice, onEditar, onMudar }) {
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
  const quartos = formatarFaixa(e.quartos_min, e.quartos_max, "quarto", "quartos");
  const vagas = formatarFaixa(e.vagas_min, e.vagas_max, "vaga", "vagas");
  return (
    <li style={{ animationDelay: `${Math.min(indice, 6) * 55}ms` }} className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-gold/40">
      <div className="relative aspect-16/9 bg-card-2">
        {e.capa_url ? (
          <img src={e.capa_url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-gold/60"><Icon name="building" className="size-10" /></div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Selo tom={TOM_STATUS[e.status] ?? "neutro"}>{STATUS[e.status]?.label ?? e.status}</Selo>
        </div>
        <div className="absolute right-3 top-3"><Selo tom={e.publicado ? "ok" : "alerta"}>{e.publicado ? "Publicado" : "Rascunho"}</Selo></div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="truncate font-semibold">{e.nome}</h3>
          <p className="truncate text-[13px] text-ink-2">{e.bairro} · {e.cidade}/{e.uf}</p>
          {e.construtora?.nome && <p className="truncate text-[12px] text-ink-3">{e.construtora.nome}</p>}
        </div>
        <p className="text-[13px] text-ink-2">
          {[quartos, vagas, e.preco_min != null ? `a partir de ${brl(e.preco_min)}` : null].filter(Boolean).join(" · ") || "Sem características preenchidas"}
        </p>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <Selo tom={e.tem_book ? "ok" : "neutro"}>{e.tem_book ? "Book ✓" : "Sem book"}</Selo>
          <Selo tom={e.tem_tabela ? "ok" : "neutro"}>{e.tem_tabela ? "Tabela ✓" : "Sem tabela"}</Selo>
          <Selo tom={e.latitude != null ? "ok" : "alerta"}>{e.latitude != null ? "No mapa" : "Sem coordenadas"}</Selo>
        </div>
        <div className="flex gap-2">
          <Chave ativo={e.publicado} rotulo="Publicado" ocupado={ocupado} onClick={() => alternar("publicado")} />
          <Chave ativo={e.disponivel} rotulo="Disponível" ocupado={ocupado} onClick={() => alternar("disponivel")} />
        </div>
        <button type="button" onClick={() => onEditar(e)} className="h-11 w-full rounded-xl border border-line text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink">Editar</button>
      </div>
    </li>
  );
}

export default function EmpreendimentosPage() {
  usePageTitle("Empreendimentos");
  const [lista, setLista] = useState([]);
  const [construtoras, setConstrutoras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [publicacao, setPublicacao] = useState("");
  const [form, setForm] = useState(null); // { emp? }

  useEffect(() => {
    let ativo = true;
    Promise.all([listarEmpreendimentos(), listarConstrutoras().catch(() => [])])
      .then(([l, c]) => ativo && (setLista(l), setConstrutoras(c)))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const mudar = useCallback(async (id, mudancas) => {
    setErro("");
    try {
      const atualizado = await atualizarEmpreendimento(id, mudancas);
      setLista((l) => l.map((e) => (e.id === id ? { ...e, ...atualizado } : e)));
    } catch (e) {
      setErro(e.message);
      throw e;
    }
  }, []);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return lista.filter(
      (e) =>
        (!status || e.status === status) &&
        (!publicacao || (publicacao === "publicado" ? e.publicado : !e.publicado)) &&
        (!q || `${e.nome} ${e.cidade} ${e.bairro}`.toLowerCase().includes(q)),
    );
  }, [lista, busca, status, publicacao]);

  const total = lista.length;
  const publicados = lista.filter((e) => e.publicado).length;
  const semMapa = lista.filter((e) => e.latitude == null).length;

  return (
    <div className="space-y-5">
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Empreendimentos</h1>
          <p className="text-[13px] text-ink-2">{total} cadastrados · {publicados} publicados{semMapa ? ` · ${semMapa} sem coordenadas` : ""}</p>
        </div>
        <button type="button" onClick={() => setForm({})} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110">
          <Icon name="building" className="size-4.5" /> Novo empreendimento
        </button>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      <div className="grid gap-2 sm:grid-cols-[1fr_11rem_11rem]">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, cidade ou bairro" aria-label="Buscar" className={`${CAMPO} border-line focus:border-gold`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Fase" className={`${CAMPO} border-line`}>
          <option value="">Todas as fases</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={publicacao} onChange={(e) => setPublicacao(e.target.value)} aria-label="Publicação" className={`${CAMPO} border-line`}>
          <option value="">Publicados e rascunhos</option>
          <option value="publicado">Só publicados</option>
          <option value="rascunho">Só rascunhos</option>
        </select>
      </div>

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : visiveis.length === 0 ? (
        <Vazio>
          {total === 0 ? "Nenhum empreendimento cadastrado ainda." : "Nenhum empreendimento com esses filtros."}
          {total === 0 && <button type="button" onClick={() => setForm({})} className="ml-1 text-gold hover:underline">Cadastrar o primeiro</button>}
        </Vazio>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((e, i) => <Cartao key={e.id} e={e} indice={i} onEditar={(emp) => setForm({ emp })} onMudar={mudar} />)}
        </ul>
      )}

      {form && (
        <EmpreendimentoForm
          key={form.emp?.id ?? "novo"}
          empreendimento={form.emp}
          construtoras={construtoras}
          onConstrutoraCriada={(c) => setConstrutoras((l) => [...l, c].sort((a, b) => a.nome.localeCompare(b.nome)))}
          onClose={() => setForm(null)}
          onSalvo={(salvo, novo) => {
            setLista((l) => (novo ? [salvo, ...l] : l.map((e) => (e.id === salvo.id ? { ...e, ...salvo } : e))));
            setForm(null);
          }}
        />
      )}
    </div>
  );
}