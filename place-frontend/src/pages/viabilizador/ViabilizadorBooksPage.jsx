import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { urlDoDocumento } from "@/services/empreendimentos";
import { Confirmar } from "@/components/viabilizador/Confirmar";
import { MSG_SEM_CONSTRUTORA, desatualizado as estaVelho, enviarDocumento, getProdutos } from "@/services/viabilizador";

const MAX = 15 * 1024 * 1024;
const tamanho = (bytes) => `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
const dataCurta = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

function Documento({ produto, tipo, rotulo, tem, onAtualizado }) {
  const entrada = useRef(null);
  const [estado, setEstado] = useState("parado");
  const [erro, setErro] = useState("");
  const [escolhido, setEscolhido] = useState(null);
  const enviadoEm = tipo === "book" ? produto.bookAtualizadoEm : produto.tabelaAtualizadoEm;
  const desatualizado = tem && estaVelho(enviadoEm);

  // Arquivo novo vai direto; substituir pede confirmação, porque troca o PDF de todos os corretores na hora.
  function escolher(arquivo) {
    if (!arquivo) return;
    setErro("");
    if (arquivo.type !== "application/pdf") return setErro("Envie um arquivo PDF.");
    if (arquivo.size > MAX) return setErro("O arquivo passa de 15 MB.");
    if (tem) setEscolhido(arquivo);
    else enviar(arquivo);
  }

  async function enviar(arquivo) {
    setEstado("enviando");
    try {
      onAtualizado(await enviarDocumento(produto.id, tipo, arquivo));
    } catch (e) {
      setErro(e.fieldErrors?.arquivo ?? e.message);
    } finally {
      setEstado("parado");
      setEscolhido(null);
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
      {tem && <p className="text-xs text-ink-3">{enviadoEm ? `Enviado em ${dataCurta(enviadoEm)}` : "Sem data de envio"}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={!tem || estado !== "parado"} onClick={abrir} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40">
          <Icon name="book" className="size-4" /> {estado === "abrindo" ? "Abrindo..." : "Abrir"}
        </button>
        <button type="button" disabled={estado !== "parado"} onClick={() => entrada.current?.click()} className="h-11 rounded-xl bg-gold-gradient text-[13px] font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
          {estado === "enviando" ? "Enviando..." : tem ? "Substituir PDF" : "Enviar PDF"}
        </button>
      </div>
      <input ref={entrada} type="file" accept="application/pdf" className="hidden" onChange={(e) => { escolher(e.target.files?.[0]); e.target.value = ""; }} />
      {erro && <p role="alert" className="text-[12px] text-danger">{erro}</p>}
      {escolhido && (
        <Confirmar
          titulo={`Substituir ${rotulo.toLowerCase()} do ${produto.nome}?`}
          rotulo="Substituir"
          ocupado={estado === "enviando"}
          onConfirmar={() => enviar(escolhido)}
          onClose={() => estado !== "enviando" && setEscolhido(null)}
        >
          <p>O arquivo <b className="break-all text-ink">{escolhido.name}</b> ({tamanho(escolhido.size)}) vai substituir o atual.</p>
          <p>Todos os corretores passam a ver o novo PDF na hora.</p>
        </Confirmar>
      )}
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
                <span className="text-[12px] text-ink-3">{p.documentosAtualizadosEm ? `Última atualização em ${dataCurta(p.documentosAtualizadosEm)}` : p.temBook || p.temTabela ? "Sem data de envio" : "Nenhum documento enviado ainda"}</span>
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