import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CAMPO, Campo, Folha, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MSG_SEM_CONSTRUTORA, ROTULO_PENDENCIA, atualizarProduto, getProdutos } from "@/services/viabilizador";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const soDigitos = (s) => s.replace(/\D/g, "");
const moeda = (d) => (d ? (Number(d) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "");
const paraCentavos = (n) => (n == null ? "" : String(Math.round(Number(n) * 100)));

function EditarPreco({ produto, onClose, onSalvo }) {
  const [min, setMin] = useState(paraCentavos(produto.precoMin));
  const [max, setMax] = useState(paraCentavos(produto.precoMax));
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function enviar(ev) {
    ev.preventDefault();
    setSalvando(true);
    setErros({});
    setErroGeral("");
    try {
      onSalvo(await atualizarProduto(produto.id, { precoMin: min ? Number(min) / 100 : null, precoMax: max ? Number(max) / 100 : null }));
    } catch (e) {
      setErros(e.fieldErrors ?? {});
      setErroGeral(Object.keys(e.fieldErrors ?? {}).length ? "" : e.message);
    } finally {
      setSalvando(false);
    }
  }
  const borda = (c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");

  return (
    <Folha titulo={`Preço — ${produto.nome}`} onClose={onClose}>
      <form onSubmit={enviar} noValidate className="space-y-3.5">
        <Campo rotulo="Preço a partir de" erro={erros.precoMin}><input inputMode="numeric" placeholder="R$ 0,00" value={moeda(min)} onChange={(e) => setMin(soDigitos(e.target.value).slice(0, 12))} className={`${CAMPO} ${borda("precoMin")}`} /></Campo>
        <Campo rotulo="Preço até" erro={erros.precoMax}><input inputMode="numeric" placeholder="R$ 0,00" value={moeda(max)} onChange={(e) => setMax(soDigitos(e.target.value).slice(0, 12))} className={`${CAMPO} ${borda("precoMax")}`} /></Campo>
        {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
        <button type="submit" disabled={salvando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">{salvando ? "Salvando..." : "Salvar preço"}</button>
      </form>
    </Folha>
  );
}

function Cartao({ p, indice, onMudar, onEditarPreco }) {
  const [ocupado, setOcupado] = useState(false);
  async function alternar() {
    setOcupado(true);
    try {
      await onMudar(p.id, { disponivel: !p.disponivel });
    } catch {
    } finally {
      setOcupado(false);
    }
  }
  return (
    <li style={{ animationDelay: `${Math.min(indice, 6) * 55}ms` }} className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-card">
      <div className="relative aspect-16/9 bg-card-2">
        {p.capaUrl ? <img src={p.capaUrl} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-gold/60"><Icon name="building" className="size-10" /></div>}
        <div className="absolute right-3 top-3"><Selo tom={p.publicado ? "ok" : "alerta"}>{p.publicado ? "Publicado" : "Rascunho"}</Selo></div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="truncate font-semibold">{p.nome}</h3>
          <p className="truncate text-[13px] text-ink-2">{p.bairro} · {p.cidade}/{p.uf}</p>
        </div>
        <p className="text-sm">
          <span className="text-ink-3">Preço: </span>
          {p.precoMin != null ? <strong className="text-gold">{brl(p.precoMin)}{p.precoMax != null ? ` a ${brl(p.precoMax)}` : ""}</strong> : <span className="text-amber-300">não informado</span>}
        </p>
        {p.pendencias.length > 0 && <div className="flex flex-wrap gap-1.5">{p.pendencias.map((k) => <Selo key={k} tom="alerta">{ROTULO_PENDENCIA[k]}</Selo>)}</div>}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" role="switch" aria-checked={p.disponivel} disabled={ocupado} onClick={alternar}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-[13px] transition-colors disabled:opacity-50 ${p.disponivel ? "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10" : "border-line text-ink-3 hover:border-gold/60 hover:text-ink"}`}>
            <span className={`size-2 rounded-full ${p.disponivel ? "bg-emerald-400" : "bg-white/30"}`} /> {p.disponivel ? "Disponível" : "Indisponível"}
          </button>
          <button type="button" onClick={() => onEditarPreco(p)} className="h-11 rounded-xl border border-line text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink">Editar preço</button>
        </div>
      </div>
    </li>
  );
}

export default function MeusProdutosPage() {
  usePageTitle("Meus produtos");
  const [lista, setLista] = useState([]);
  const [construtora, setConstrutora] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    let ativo = true;
    getProdutos().then((d) => ativo && (setLista(d.produtos), setConstrutora(d.construtora))).catch((e) => ativo && setErro(e.message)).finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  async function mudar(id, mudancas) {
    setErro("");
    try {
      const novo = await atualizarProduto(id, mudancas);
      setLista((l) => l.map((p) => (p.id === id ? novo : p)));
    } catch (e) {
      setErro(e.message);
      throw e;
    }
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold">Meus produtos</h1>
        <p className="text-[13px] text-ink-2">{construtora ? `Produtos da ${construtora.nome}. ` : ""}Marque quando as unidades acabarem e mantenha o preço em dia. O restante do cadastro é do admin.</p>
      </div>
      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : lista.length === 0 ? (
        <Vazio>{construtora ? `Nenhum empreendimento da ${construtora.nome} cadastrado ainda.` : MSG_SEM_CONSTRUTORA}</Vazio>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{lista.map((p, i) => <Cartao key={p.id} p={p} indice={i} onMudar={mudar} onEditarPreco={setEditando} />)}</ul>
      )}

      {editando && <EditarPreco key={editando.id} produto={editando} onClose={() => setEditando(null)} onSalvo={(novo) => { setLista((l) => l.map((p) => (p.id === novo.id ? novo : p))); setEditando(null); }} />}
    </div>
  );
}