import { useEffect, useState } from 'react';
import { CAMPO, Campo } from '@/components/admin/equipe/ui';
import { listarDocumentosAdmin } from '@/services/documentosComerciaisAdmin';
import { revisarPendenciaDrive } from '@/services/pendenciasDrive';

const BOTAO = 'min-h-11 rounded-xl border border-line px-4 py-2 text-sm disabled:opacity-50';

export default function RevisaoPendenciaDrive({ item, empreendimentos, onAtualizar, onFechar, onRevisada }) {
  const [campos, setCampos] = useState({
    empreendimentoId: item.empreendimentoId ?? '', documentoId: item.documentoId ?? '',
    tipo: item.tipo ?? '', fase: item.fase ?? '', titulo: item.tituloRevisado ?? item.arquivoNome.slice(0, 150),
    validadeAte: item.validadeRevisada ?? '',
  });
  const [docs, setDocs] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [falhaDocs, setFalhaDocs] = useState('');
  const [motivo, setMotivo] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const [alterado, setAlterado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [erros, setErros] = useState({});
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    let ativo = true;
    setDocs([]);
    setFalhaDocs('');
    if (!campos.empreendimentoId) { setBuscando(false); return () => { ativo = false; }; }
    setBuscando(true);
    listarDocumentosAdmin(campos.empreendimentoId)
      .then((dados) => { if (ativo) setDocs(dados); })
      .catch((e) => { if (ativo) setFalhaDocs(e.message); })
      .finally(() => { if (ativo) setBuscando(false); });
    return () => { ativo = false; };
  }, [campos.empreendimentoId]);

  function alterar(nome, valor) {
    setCampos((anterior) => ({ ...anterior, [nome]: valor,
      ...(nome === 'empreendimentoId' ? { documentoId: '' } : {}),
    }));
    setAlterado(true); setConfirmado(false); setSucesso('');
    setErros((anteriores) => ({ ...anteriores, [nome]: undefined }));
  }

  async function executar(acao) {
    setOcupado(true); setErro(''); setErros({}); setSucesso('');
    try {
      const resultado = await revisarPendenciaDrive(item.id, {
        acao, revisao: item.revisao,
        ...(acao === 'vincular' ? campos : { motivo, confirmarAprovacao: confirmado }),
      });
      // A mudança já foi salva. Uma falha ao atualizar a lista não deve levar
      // o ADM a repetir a gravação com a revisão antiga.
      await onAtualizar(resultado);
      if (acao === 'vincular') {
        setAlterado(false); setConfirmado(false);
        setSucesso('Vínculo salvo em revisão. O documento comercial ainda não foi alterado.');
      } else {
        onRevisada?.(item.empreendimentoId);
        onFechar();
      }
    } catch (e) {
      setErro(e.message); setErros(e.fieldErrors ?? {});
    } finally { setOcupado(false); }
  }

  const alvo = docs.find((doc) => doc.id === campos.documentoId);
  const podeConcluir = !alterado && Boolean(item.tituloRevisado && item.empreendimentoId && item.tipo);

  return (
    <div className="mt-3 space-y-4 border-t border-line pt-4" aria-label={`Revisar ${item.arquivoNome}`}>
      <p className="text-xs text-ink-3">Escolha o empreendimento e confira o PDF antes de aprovar. Salvar o vínculo mantém a pendência em revisão.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Empreendimento" erro={erros.empreendimentoId}>
          <select className={CAMPO} value={campos.empreendimentoId} disabled={ocupado}
            onChange={(e) => alterar('empreendimentoId', e.target.value)}>
            <option value="">Selecione</option>
            {empreendimentos.map((emp) => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Tipo de documento" erro={erros.tipo}>
          <select className={CAMPO} value={campos.tipo} disabled={ocupado} onChange={(e) => alterar('tipo', e.target.value)}>
            <option value="">Selecione</option><option value="book">Book</option><option value="tabela">Tabela</option>
          </select>
        </Campo>
        <Campo rotulo="Título" erro={erros.titulo}>
          <input className={CAMPO} value={campos.titulo} maxLength={150} disabled={ocupado} onChange={(e) => alterar('titulo', e.target.value)} />
        </Campo>
        <Campo rotulo="Fase (opcional)" erro={erros.fase}>
          <input className={CAMPO} value={campos.fase} maxLength={80} disabled={ocupado} onChange={(e) => alterar('fase', e.target.value)} />
        </Campo>
        <Campo rotulo="Validade até (opcional)" erro={erros.validadeAte}>
          <input type="date" className={CAMPO} value={campos.validadeAte} disabled={ocupado} onChange={(e) => alterar('validadeAte', e.target.value)} />
        </Campo>
        <Campo rotulo="Documento a atualizar" erro={erros.documentoId}>
          <select className={CAMPO} value={campos.documentoId} disabled={ocupado || buscando || Boolean(falhaDocs)}
            onChange={(e) => alterar('documentoId', e.target.value)}>
            <option value="">Criar novo documento</option>
            {docs.map((doc) => <option key={doc.id} value={doc.id}>{doc.titulo} · {doc.fase || 'Sem fase'} · {doc.status}</option>)}
          </select>
        </Campo>
      </div>
      {buscando && <p role="status" className="text-xs text-ink-3">Consultando documentos do empreendimento...</p>}
      {falhaDocs && <p role="alert" className="text-xs text-danger">{falhaDocs} Feche e reabra a revisão para tentar novamente.</p>}
      {alvo && (
        <div className="rounded-xl border border-gold/30 p-3 text-xs text-ink-2">
          <p>A aprovação atualizará este registro: <strong>{alvo.titulo}</strong> · {alvo.fase || 'Sem fase'} · {alvo.status}.</p>
          {alvo.driveUrl && <a className="mt-2 inline-block underline" href={alvo.driveUrl} target="_blank" rel="noopener noreferrer">Abrir documento atual para comparar</a>}
        </div>
      )}
      <button type="button" className={BOTAO} disabled={ocupado || buscando || Boolean(falhaDocs)} onClick={() => executar('vincular')}>
        Salvar vínculo em revisão
      </button>
      {!podeConcluir && <p className="text-xs text-ink-3">Salve o vínculo antes de aprovar e concluir.</p>}
      <Campo rotulo="Motivo da decisão" erro={erros.motivo}>
        <textarea className={`${CAMPO} min-h-24 py-3`} value={motivo} maxLength={500} disabled={ocupado}
          placeholder="Registre o que conferiu ou por que o arquivo deve ser ignorado."
          onChange={(e) => setMotivo(e.target.value)} />
      </Campo>
      <label className="flex items-start gap-3 text-xs text-ink-2">
        <input type="checkbox" checked={confirmado} disabled={!podeConcluir || ocupado}
          onChange={(e) => setConfirmado(e.target.checked)} />
        Conferi o conteúdo, o empreendimento, a fase e a validade. Autorizo disponibilizar este documento aos usuários internos habilitados.
      </label>
      {erros.confirmarAprovacao && <p role="alert" className="text-xs text-danger">{erros.confirmarAprovacao}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${BOTAO} border-gold/50 text-gold`}
          disabled={ocupado || buscando || Boolean(falhaDocs) || !podeConcluir || !confirmado}
          onClick={() => executar('concluir')}>Aprovar e concluir revisão</button>
        <button type="button" className={BOTAO} disabled={ocupado} onClick={() => executar('ignorar')}>Ignorar com motivo</button>
        <button type="button" className={BOTAO} disabled={ocupado} onClick={onFechar}>Fechar revisão</button>
      </div>
      {ocupado && <p role="status" className="text-xs text-ink-3">Salvando revisão...</p>}
      {erro && <p role="alert" className="text-sm text-danger">{erro}</p>}
      {sucesso && <p role="status" className="text-xs text-emerald-400">{sucesso}</p>}
    </div>
  );
}
