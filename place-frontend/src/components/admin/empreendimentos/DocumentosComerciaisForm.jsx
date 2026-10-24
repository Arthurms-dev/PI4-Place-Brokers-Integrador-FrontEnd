import { useCallback, useEffect, useState } from "react";
import { CAMPO, Campo } from "@/components/admin/equipe/ui";
import {
  listarDocumentosAdmin,
  criarDocumentoAdmin,
  atualizarDocumentoAdmin,
} from "@/services/documentosComerciaisAdmin";

const VAZIO = { tipo: "tabela", titulo: "", fase: "", driveUrl: "", validadeAte: "" };

function linha(doc) {
  return {
    tipo: doc.tipo,
    titulo: doc.titulo,
    fase: doc.fase ?? "",
    driveUrl: doc.driveUrl ?? "",
    validadeAte: doc.validade_ate ?? "",
  };
}

function situacao(doc) {
  const expirado = doc.validade_ate && doc.validade_ate < new Date().toISOString().slice(0, 10);
  return expirado ? "Vencido" : doc.status === "aprovado" ? "Aprovado" : doc.status;
}

export default function DocumentosComerciaisForm({ empreendimentoId, temBookLegado, temTabelaLegada, onAtualizados }) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const [campos, setCampos] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");

  const carregar = useCallback(async () => {
    const documentos = await listarDocumentosAdmin(empreendimentoId);
    setDocs(documentos);
    return documentos;
  }, [empreendimentoId]);

  useEffect(() => {
    let ativo = true;
    listarDocumentosAdmin(empreendimentoId)
      .then((dados) => { if (ativo) setDocs(dados); })
      .catch((err) => { if (ativo) setErro(err.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [empreendimentoId]);

  function iniciarNovo() {
    setEditando("novo");
    setCampos({ ...VAZIO });
    setErros({});
    setErro("");
    setSucesso("");
  }
  function iniciarEdicao(doc) {
    setEditando(doc.id);
    setCampos(linha(doc));
    setErros({});
    setErro("");
    setSucesso("");
  }
  function cancelar() { setEditando(null); setCampos({ ...VAZIO }); setErros({}); setErro(""); }
  function alterar(chave, valor) {
    setCampos((c) => ({ ...c, [chave]: valor }));
    setErros((e) => ({ ...e, [chave]: undefined }));
  }

  async function salvar() {
    setErro("");
    setErros({});
    setSalvando(true);
    try {
      if (editando === "novo") await criarDocumentoAdmin(empreendimentoId, campos);
      else await atualizarDocumentoAdmin(empreendimentoId, editando, campos);
      const documentos = await carregar();
      onAtualizados?.(documentos);
      setEditando(null);
      setCampos({ ...VAZIO });
      setSucesso("Documento salvo. Confira a permissão do arquivo no Drive antes de distribuí-lo aos corretores.");
    } catch (err) {
      setErro(err.message);
      setErros(err.fieldErrors ?? {});
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="space-y-4 border-t border-line-soft pt-5" aria-label="Documentos comerciais do empreendimento"
      onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault(); }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gold">Books e tabelas comerciais</h3>
          <p className="mt-1 text-xs text-ink-3">Gerencie links do Google Drive por fase, sem apagar os arquivos originais.</p>
        </div>
        {editando === null && !carregando && (
          <button type="button" onClick={iniciarNovo}
            className="h-10 rounded-xl border border-gold/50 px-4 text-xs font-semibold text-gold hover:bg-gold/10">
            Adicionar documento
          </button>
        )}
      </div>

      {(temBookLegado || temTabelaLegada) && (
        <p className="rounded-xl border border-line bg-card-2 px-3 py-2 text-xs text-ink-2">
          Links anteriores preservados: {[
            temBookLegado && "book", temTabelaLegada && "tabela",
          ].filter(Boolean).join(" e ")}. Eles não são excluídos ao cadastrar documentos comerciais.
        </p>
      )}

      {carregando && <p className="text-xs text-ink-3">Consultando documentos...</p>}
      {!carregando && docs.length === 0 && <p className="text-xs text-ink-3">Nenhum documento comercial estruturado cadastrado.</p>}
      {!carregando && docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li key={doc.id} className="rounded-xl border border-line bg-card-2 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold">{doc.titulo}</p>
                  <p className="text-xs text-ink-3">
                    {doc.tipo === "book" ? "Book" : "Tabela"} · {doc.fase || "Sem fase"} · {situacao(doc)}
                    {doc.validade_ate ? ` · Validade: ${doc.validade_ate}` : " · Sem validade definida"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {doc.driveUrl && (
                    <a href={doc.driveUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex h-10 items-center rounded-lg border border-line px-3 text-xs hover:border-gold">
                      Abrir no Drive
                    </a>
                  )}
                  <button type="button" onClick={() => iniciarEdicao(doc)} disabled={editando !== null}
                    className="h-10 rounded-lg border border-line px-4 text-xs hover:border-gold disabled:opacity-40">Editar vínculo</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editando !== null && (
        <div className="space-y-3 rounded-xl border border-gold/30 bg-card-2 p-4">
          <h4 className="text-sm font-semibold">{editando === "novo" ? "Novo documento comercial" : "Atualizar documento existente"}</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Tipo" erro={erros.tipo}>
              <select value={campos.tipo} onChange={(e) => alterar("tipo", e.target.value)} className={`${CAMPO} border-line`}>
                <option value="tabela">Tabela de preços</option>
                <option value="book">Book</option>
              </select>
            </Campo>
            <Campo rotulo="Fase (opcional)" erro={erros.fase}>
              <input className={`${CAMPO} border-line`} value={campos.fase} maxLength={80}
                placeholder="Ex.: Fase 1" onChange={(e) => alterar("fase", e.target.value)} />
            </Campo>
          </div>
          <Campo rotulo="Título" erro={erros.titulo}>
            <input className={`${CAMPO} border-line`} value={campos.titulo} maxLength={150}
              placeholder="Ex.: Tabela Fase 1 — novembro/2026" onChange={(e) => alterar("titulo", e.target.value)} />
          </Campo>
          <Campo rotulo="Link do arquivo no Google Drive" erro={erros.driveUrl}>
            <input type="url" className={`${CAMPO} border-line`} value={campos.driveUrl}
              placeholder="https://drive.google.com/file/d/.../view"
              onChange={(e) => alterar("driveUrl", e.target.value)} />
          </Campo>
          <Campo rotulo="Validade até (opcional)" erro={erros.validadeAte}>
            <input type="date" className={`${CAMPO} border-line`} value={campos.validadeAte}
              onChange={(e) => alterar("validadeAte", e.target.value)} />
          </Campo>
          <p className="text-xs text-ink-3">Novo documento: aprovado pelo ADM. Para a mesma fase, edite o registro existente em vez de criar outro. O acesso continua sujeito às permissões do Drive.</p>
          <div className="flex gap-2">
            <button type="button" onClick={cancelar} disabled={salvando} className="h-11 flex-1 rounded-xl border border-line text-sm disabled:opacity-50">Cancelar</button>
            <button type="button" onClick={salvar} disabled={salvando} className="h-11 flex-1 rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] disabled:opacity-50">
              {salvando ? "Salvando..." : "Salvar documento"}
            </button>
          </div>
        </div>
      )}
      {erro && <p role="alert" className="text-xs text-danger">{erro}</p>}
      {sucesso && <p role="status" className="text-xs text-emerald-400">{sucesso}</p>}
    </section>
  );
}
