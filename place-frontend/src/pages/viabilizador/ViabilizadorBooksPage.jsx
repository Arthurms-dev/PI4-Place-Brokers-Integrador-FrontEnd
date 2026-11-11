import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { urlDoDocumento } from "@/services/empreendimentos";
import { MSG_SEM_CONSTRUTORA, enviarDocumento, getProdutos } from "@/services/viabilizador";

const MAX = 15 * 1024 * 1024;
const dataCurta = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

function Documento({ produto, tipo, rotulo, tem, onAtualizado }) {
  const entrada = useRef(null);
  const [estado, setEstado] = useState("parado");
  const [erro, setErro] = useState("");
  const desatualizado = tem && produto.pendencias.includes("documentos_desatualizados");

  async function enviar(arquivo) {
    if (!arquivo) return;
    setErro("");
    if (arquivo.type !== "application/pdf") return setErro("Envie um arquivo PDF.");
    if (arquivo.size > MAX) return setErro("O arquivo passa de 15 MB.");
    setEstado("enviando");
    try {
      onAtualizado(await enviarDocumento(produto.id, tipo, arquivo));
    } catch (e) {
      setErro(e.fieldErrors?.arquivo ?? e.message);
    } finally {
      setEstado("parado");
    }
  }

  async function abrir() {
    setErro("");
    const janela = window.open("", "_blank");
    setEstado("abrindo");
    try {
      const url = await urlDoDocumento(produto.id, tipo);
      if (janela) {
        janela.opener = null;
        janela.location.href = url;
      } else window.location.href = url;
    } catch (e) {
      janela?.close();
      setErro(e.message);
    } finally {
      setEstado("parado");
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-line-soft bg-card-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{rotulo}</span>
        {!tem ? <Selo tom="perigo">Falta enviar</Selo> : desatualizado ? <Selo tom="alerta">Desatualizado</Selo> : <Selo tom="ok">Em dia</Selo>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={!tem || estado !== "parado"} onClick={abrir} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40">
          <Icon name="book" className="size-4" /> {estado === "abrindo" ? "Abrindo..." : "Abrir"}
        </button>
        <button type="button" disabled={estado !== "parado"} onClick={() => entrada.current?.click()} className="h-11 rounded-xl bg-gold-gradient text-[13px] font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
          {estado === "enviando" ? "Enviando..." : tem ? "Substituir PDF" : "Enviar PDF"}
        </button>
      </div>
      <input ref={entrada} type="file" accept="application/pdf" className="hidden" onChange={(e) => { enviar(e.target.files?.[0]); e.target.value = ""; }} />
      {erro && <p role="alert" className="text-[12px] text-danger">{erro}</p>}
    </div>
  );
}

export default function ViabilizadorBooksPage() {
  usePageTitle("Books e tabelas");
  const [lista, setLista] = useState([]);
  const [construtora, setConstrutora] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    getProdutos().then((d) => ativo && (setLista(d.produtos), setConstrutora(d.construtora))).catch((e) => ativo && setErro(e.message)).finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const trocar = (novo) => setLista((l) => l.map((p) => (p.id === novo.id ? novo : p)));

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <p className="pb-eyebrow">Materiais de apoio</p>
        <h1 className="text-xl font-semibold">Books e tabelas</h1>
        <p className="text-[13px] text-ink-2">Envie o PDF atual de cada produto. O novo arquivo substitui o anterior na hora para todos os corretores.</p>
      </div>
      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      {carregando ? (
        <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : lista.length === 0 ? (
        <Vazio>{construtora ? `Nenhum empreendimento da ${construtora.nome} cadastrado ainda.` : MSG_SEM_CONSTRUTORA}</Vazio>
      ) : (
        <ul className="space-y-3">
          {lista.map((p, i) => (
            <li key={p.id} style={{ animationDelay: `${Math.min(i, 6) * 55}ms` }} className="animate-fade-up space-y-3 rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{p.nome}</h3>
                  <p className="truncate text-[13px] text-ink-2">{p.bairro} · {p.cidade}/{p.uf}</p>
                </div>
                <span className="text-[12px] text-ink-3">{p.documentosAtualizadosEm ? `Documentos atualizados em ${dataCurta(p.documentosAtualizadosEm)}` : "Documentos nunca atualizados por aqui"}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Documento produto={p} tipo="book" rotulo="Book" tem={p.temBook} onAtualizado={trocar} />
                <Documento produto={p} tipo="tabela" rotulo="Tabela de preços" tem={p.temTabela} onAtualizado={trocar} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}