import { useCallback, useEffect, useState } from 'react';
import { listarPendenciasDrive } from '@/services/pendenciasDrive';
import { dataPendencia, textoMotivo } from '@/lib/pendenciasDrive';
import RevisaoPendenciaDrive from './RevisaoPendenciaDrive';

export default function PendenciasDrivePanel({ onAbrirEmpreendimento, empreendimentos = [], onRevisada }) {
  const [dados, setDados] = useState({ itens: [], haMais: false });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [status, setStatus] = useState('pendente');
  const [revisando, setRevisando] = useState(null);
  const [sucesso, setSucesso] = useState('');

  const consultar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const resultado = await listarPendenciasDrive(status);
      setDados(resultado);
      setRevisando(null);
    } catch (falha) {
      setErro(falha.message ?? 'Não foi possível consultar as pendências.');
    } finally {
      setCarregando(false);
    }
  }, [status]);

  useEffect(() => { consultar(); }, [consultar]);

  return (
    <section className="rounded-2xl border border-line bg-card p-4 sm:p-5" aria-label="Pendências do Google Drive">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Pendências do Google Drive</h2>
          <p className="mt-1 text-xs text-ink-3">
            Confira PDFs, salve vínculos em revisão e aprove somente após verificar conteúdo, fase e validade.
          </p>
        </div>
        <button type="button" onClick={consultar} disabled={carregando || revisando !== null}
          className="h-10 rounded-xl border border-line px-4 text-xs hover:border-gold disabled:opacity-50">
          {carregando ? 'Consultando...' : 'Atualizar lista'}
        </button>
      </div>

      <label className="mt-4 block max-w-xs text-xs text-ink-3">
        Situação das pendências
        <select className="mt-1 h-11 w-full rounded-xl border border-line bg-card-2 px-3 text-sm text-ink"
          value={status} disabled={revisando !== null || carregando}
          onChange={(e) => { setSucesso(''); setDados({ itens: [], haMais: false }); setRevisando(null); setStatus(e.target.value); }}>
          <option value="pendente">Aguardando revisão</option>
          <option value="resolvido">Concluídas</option>
          <option value="ignorado">Ignoradas</option>
        </select>
      </label>
      {sucesso && <p role="status" className="mt-3 text-xs text-emerald-400">{sucesso}</p>}

      {erro && <p role="alert" className="mt-3 rounded-xl border border-danger/30 p-3 text-xs text-danger">{erro}</p>}
      {carregando && <p className="mt-3 text-sm text-ink-3">Carregando pendências...</p>}
      {!carregando && !erro && dados.itens.length === 0 && (
        <p role="status" className="mt-3 rounded-xl bg-card-2 p-3 text-sm text-ink-2">
          Nenhum item nesta situação. A leitura do Drive é executada pelo script no Back-end.
        </p>
      )}
      {!carregando && !erro && dados.itens.length > 0 && (
        <>
          <p className="mt-3 text-xs text-ink-3">{dados.itens.length} documento(s) nesta situação</p>
          <ul className="mt-3 space-y-2">
            {dados.itens.map((item) => (
              <li key={item.id} className="rounded-xl border border-line bg-card-2 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="break-words text-sm font-medium">{item.arquivoNome}</p>
                    <p className="text-xs text-ink-2">{textoMotivo(item.motivo)}</p>
                    <p className="text-xs text-ink-3">
                      {item.empreendimentoNome ?? 'Empreendimento ainda não identificado'}
                      {item.tipo ? ` · ${item.tipo === 'book' ? 'Book' : 'Tabela'}` : ''}
                      {item.fase ? ` · ${item.fase}` : ''}
                      {' · '}Modificado: {dataPendencia(item.modificadoEm)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status === 'pendente' && <button type="button" onClick={() => { setRevisando(item.id); setSucesso(''); }}
                      disabled={revisando !== null}
                      className="h-10 rounded-lg border border-gold/50 px-3 text-xs text-gold disabled:opacity-40">Revisar pendência</button>}
                    {item.driveUrl && (
                      <a href={item.driveUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-10 items-center rounded-lg border border-line px-3 text-xs hover:border-gold">
                        Abrir no Drive
                      </a>
                    )}
                    {item.empreendimentoId && onAbrirEmpreendimento && (
                      <button type="button" onClick={() => onAbrirEmpreendimento(item.empreendimentoId)}
                        className="h-10 rounded-lg border border-line px-3 text-xs hover:border-gold">
                        Ver empreendimento
                      </button>
                    )}
                  </div>
                </div>
                {item.motivoRevisao && <p className="mt-2 break-words text-xs text-ink-2">Decisão: {item.motivoRevisao} · {dataPendencia(item.revisadoEm)}</p>}
                {revisando === item.id && <RevisaoPendenciaDrive key={item.id}
                  item={item} empreendimentos={empreendimentos}
                  onFechar={() => { setRevisando(null); consultar(); }} onRevisada={onRevisada}
                  onAtualizar={(resultado) => {
                    const atualizado = { ...item, ...resultado,
                      empreendimentoNome: empreendimentos.find((e) => e.id === resultado.empreendimentoId)?.nome ?? null,
                    };
                    setDados((anterior) => ({ ...anterior, itens: anterior.itens.map((p) => p.id === item.id ? atualizado : p)
                      .filter((p) => p.status === status) }));
                    if (resultado.status !== 'pendente') setSucesso(resultado.status === 'resolvido'
                      ? 'Documento aprovado e revisão concluída.' : 'Pendência ignorada. O documento comercial não foi alterado.');
                  }} />}
              </li>
            ))}
          </ul>
          {dados.haMais && <p className="mt-3 text-xs text-amber-300">Existem mais pendências. Esta listagem mostra somente as 100 mais recentes.</p>}
        </>
      )}
    </section>
  );
}
