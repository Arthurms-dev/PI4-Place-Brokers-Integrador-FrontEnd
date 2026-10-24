import { useCallback, useEffect, useState } from 'react';
import { buscarEmpreendimentoPorId } from '@/services/empreendimentos';
import {
  trocarCapaEmpreendimento,
  adicionarFotosEmpreendimento,
  removerFotoEmpreendimento,
} from '@/services/imagensEmpreendimento';

const MAX_BYTES = 15 * 1024 * 1024;
const TIPOS = new Set(['image/jpeg','image/png','image/webp']);

function validar(arquivos) {
  for (const arquivo of arquivos) {
    if (!TIPOS.has(arquivo.type)) return `${arquivo.name}: utilize JPG, PNG ou WebP.`;
    if (arquivo.size > MAX_BYTES) return `${arquivo.name}: limite de 15 MB por foto.`;
  }
  return '';
}

export default function ImagensEmpreendimentoForm({ empreendimentoId, capaInicial, onCapaAtualizada }) {
  const [capa, setCapa] = useState(capaInicial ?? null);
  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregar = useCallback(async () => {
    const atual = await buscarEmpreendimentoPorId(empreendimentoId);
    setCapa(atual.capa_url ?? null);
    setFotos([... (atual.imagens ?? [])].sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
  }, [empreendimentoId]);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    buscarEmpreendimentoPorId(empreendimentoId)
      .then((atual) => {
        if (!vivo) return;
        setCapa(atual.capa_url ?? null);
        setFotos([...(atual.imagens ?? [])].sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
      })
      .catch((falha) => { if (vivo) setErro(falha.message); })
      .finally(() => { if (vivo) setCarregando(false); });
    return () => { vivo = false; };
  }, [empreendimentoId]);

  async function processar(acao, sucesso) {
    setOcupado(true); setErro(''); setMensagem('');
    try {
      await acao();
      await carregar();
      setMensagem(sucesso);
    } catch (falha) { setErro(falha.message ?? 'Falha ao atualizar as imagens.'); }
    finally { setOcupado(false); }
  }

  function selecionarCapa(evento) {
    const imagem = evento.target.files?.[0];
    evento.target.value = '';
    if (!imagem || ocupado) return;
    const problema = validar([imagem]);
    if (problema) { setErro(problema); return; }
    if (!window.confirm(`Trocar a capa pela imagem "${imagem.name}"?`)) return;
    processar(async () => {
      const resultado = await trocarCapaEmpreendimento(empreendimentoId, imagem);
      onCapaAtualizada?.(resultado.capa_url);
    }, 'Capa atualizada. A imagem antiga continua preservada no Storage.');
  }

  function selecionarFotos(evento) {
    const arquivos = [...(evento.target.files ?? [])];
    evento.target.value = '';
    if (!arquivos.length || ocupado) return;
    const problema = validar(arquivos);
    if (problema) { setErro(problema); return; }
    if (arquivos.length > 5) { setErro('Adicione no máximo cinco fotos por envio.'); return; }
    if (fotos.length + arquivos.length > 20) { setErro('A galeria permite no máximo 20 fotos.'); return; }
    processar(() => adicionarFotosEmpreendimento(empreendimentoId, arquivos), `${arquivos.length} foto(s) adicionada(s).`);
  }

  function remover(foto) {
    if (ocupado) return;
    if (!window.confirm('Remover esta foto da galeria? O arquivo original não será apagado do Storage.')) return;
    processar(() => removerFotoEmpreendimento(empreendimentoId, foto.id), 'Foto removida da galeria.');
  }

  return (
    <section className="space-y-3 border-t border-line-soft pt-4" aria-label="Gerenciar imagens do empreendimento">
      <h3 className="text-sm font-semibold text-gold">Capa e galeria de fotos</h3>
      <p className="text-xs text-ink-3">As imagens são salvas separadamente das características do empreendimento. Formatos JPG, PNG e WebP; até 15 MB por foto.</p>
      {carregando && <p className="text-sm text-ink-3">Carregando fotos cadastradas...</p>}
      {!carregando && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card-2 p-3">
            {capa ? <img src={capa} alt="Capa atual" className="h-24 w-36 rounded-lg object-cover" /> : <div className="grid h-24 w-36 place-items-center rounded-lg bg-card text-xs text-ink-3">Sem capa</div>}
            <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line px-4 text-sm hover:border-gold ${ocupado ? 'pointer-events-none opacity-50' : ''}`}>
              Trocar capa
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={ocupado} className="sr-only" onChange={selecionarCapa} />
            </label>
          </div>
          <div className="space-y-3 rounded-xl border border-line bg-card-2 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-medium">Galeria atual ({fotos.length}/20)</h4>
                <p className="text-xs text-ink-3">Adicione até cinco imagens por envio.</p>
              </div>
              <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line px-4 text-sm hover:border-gold ${ocupado || fotos.length >= 20 ? 'pointer-events-none opacity-50' : ''}`}>
                Adicionar fotos
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={ocupado || fotos.length >= 20} className="sr-only" onChange={selecionarFotos} />
              </label>
            </div>
            {fotos.length === 0 && <p className="text-xs text-ink-3">Nenhuma foto cadastrada na galeria.</p>}
            {fotos.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {fotos.map((foto, indice) => (
                  <li key={foto.id ?? `${foto.url}-${indice}`} className="overflow-hidden rounded-xl border border-line bg-card">
                    <img src={foto.url} alt={foto.alt || `Foto ${indice+1} da galeria`} className="aspect-4/3 w-full object-cover" />
                    <button type="button" onClick={() => remover(foto)} disabled={ocupado || !foto.id}
                      className="min-h-11 w-full text-xs text-danger hover:bg-danger/10 disabled:opacity-50">
                      Remover foto {indice+1}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      {ocupado && <p role="status" className="text-xs text-ink-2">Salvando imagens...</p>}
      {erro && <p role="alert" className="rounded-xl border border-danger/30 p-3 text-xs text-danger">{erro}</p>}
      {mensagem && <p role="status" className="text-xs text-emerald-400">{mensagem}</p>}
    </section>
  );
}
