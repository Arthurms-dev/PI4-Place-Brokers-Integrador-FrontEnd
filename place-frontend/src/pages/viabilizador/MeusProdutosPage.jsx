import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CAMPO, Campo, Folha, Vazio } from "@/components/admin/equipe/ui";
import { Confirmar } from "@/components/viabilizador/Confirmar";
import { Pendencias } from "@/components/viabilizador/Pendencias";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MSG_SEM_CONSTRUTORA, atualizarProduto, getProdutos } from "@/services/viabilizador";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const soDigitos = (s) => s.replace(/\D/g, "");
const moeda = (d) => (d ? (Number(d) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "");
const paraCentavos = (n) => (n == null ? "" : String(Math.round(Number(n) * 100)));

function EditarPreco({ produto, onClose, onSalvo }) {
  const [min, setMin] = useState(paraCentavos(produto.precoMin));
  const [max, setMax] = useState(paraCentavos(produto.precoMax));
  const [parcela, setParcela] = useState(paraCentavos(produto.parcelaMin));
  const mcmv = produto.segmento === "mcmv";
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function enviar(ev) {
    ev.preventDefault();
    setSalvando(true);
    setErros({});
    setErroGeral("");
    try {
      const reais = (c) => (c ? Number(c) / 100 : null);
      onSalvo(await atualizarProduto(produto.id, { precoMin: reais(min), precoMax: reais(max), ...(mcmv ? { parcelaMin: reais(parcela) } : {}) }));
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
        {mcmv && (
          <Campo rotulo="Parcelas a partir de (por mês)" erro={erros.parcelaMin}>
            <input inputMode="numeric" placeholder="R$ 0,00" value={moeda(parcela)} onChange={(e) => setParcela(soDigitos(e.target.value).slice(0, 9))} className={`${CAMPO} ${borda("parcelaMin")}`} />
            <span className="mt-1 block text-xs text-ink-3">No Minha Casa Minha Vida, é este valor que aparece no site.</span>
          </Campo>
        )}
        {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
        <button type="submit" disabled={salvando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">{salvando ? "Salvando..." : mcmv ? "Salvar preço e parcela" : "Salvar preço"}</button>
      </form>
    </Folha>
  );
}

function Cartao({ p, indice, onMudar, onEditarPreco }) {
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  async function alternar() {
    setOcupado(true);
    try {
      await onMudar(p.id, { disponivel: !p.disponivel });
      setConfirmando(false);
    } catch {
      setConfirmando(false);
    } finally {
      setOcupado(false);
    }
  }
  const mcmv = p.segmento === "mcmv";
  return (
    <li style={{ animationDelay: `${Math.min(indice, 6) * 55}ms` }} className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-card">
      <div className="relative aspect-16/9 bg-card-2">
        {p.capaUrl ? <img src={p.capaUrl} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-gold/60"><Icon name="building" className="size-10" /></div>}
        {/* Fundo sólido: o selo precisa ser lido também sobre fotos claras. */}
        <div className="absolute right-3 top-3 flex gap-1.5">
          {!p.disponivel && <span className="rounded-full bg-danger px-2.5 py-0.5 text-xs font-medium text-white shadow">Esgotado</span>}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium shadow ${p.publicado ? "bg-emerald-600 text-white" : "bg-amber-400 text-[#1a1408]"}`}>{p.publicado ? "Publicado" : "Rascunho"}</span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="truncate font-semibold">{p.nome}</h3>
          <p className="truncate text-[13px] text-ink-2">{p.bairro} · {p.cidade}/{p.uf}</p>
        </div>
        <div className="space-y-0.5 text-sm">
          <p>
            <span className="text-ink-3">Preço: </span>
            {p.precoMin != null ? <strong className="text-gold">{brl(p.precoMin)}{p.precoMax != null ? ` a ${brl(p.precoMax)}` : ""}</strong> : <span className="text-amber-300">não informado</span>}
          </p>
          {mcmv && (
            <p>
              <span className="text-ink-3">Parcelas a partir de: </span>
              {p.parcelaMin != null ? <strong className="text-gold">{brl(p.parcelaMin)}/mês</strong> : <span className="text-amber-300">não informado</span>}
            </p>
          )}
        </div>
        <Pendencias lista={p.pendencias} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setConfirmando(true)}
            className={`h-11 rounded-xl border text-[13px] transition-colors ${p.disponivel ? "border-line text-ink-2 hover:border-danger/60 hover:text-ink" : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"}`}>
            {p.disponivel ? "Marcar como esgotado" : "Voltar a vender"}
          </button>
          <button type="button" onClick={() => onEditarPreco(p)} className="h-11 rounded-xl border border-line text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink">{mcmv ? "Editar preço e parcela" : "Editar preço"}</button>
        </div>
      </div>
      {confirmando && (
        <Confirmar
          titulo={p.disponivel ? `Marcar ${p.nome} como esgotado?` : `Voltar a vender ${p.nome}?`}
          rotulo={p.disponivel ? "Marcar como esgotado" : "Voltar a vender"}
          perigo={p.disponivel}
          ocupado={ocupado}
          onConfirmar={alternar}
          onClose={() => !ocupado && setConfirmando(false)}
        >
          {p.disponivel ? (
            <>
              <p>O produto continua no site, mas com o selo <b className="text-ink">Esgotado</b>.</p>
              <p>Para os corretores, ele aparece como esgotado e sai do filtro &ldquo;Só disponíveis&rdquo; na hora.</p>
            </>
          ) : (
            <p>O selo Esgotado sai do site e o produto volta ao filtro &ldquo;Só disponíveis&rdquo; dos corretores na hora.</p>
          )}
        </Confirmar>
      )}
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
        <p className="pb-eyebrow">Portfólio</p>
        <h1 className="text-xl font-semibold">Meus produtos</h1>
        <p className="text-[13px] text-ink-2">{construtora ? `Produtos da ${construtora.nome}. ` : ""}Marque como esgotado quando as unidades acabarem e mantenha o preço em dia. O restante do cadastro é do admin.</p>
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