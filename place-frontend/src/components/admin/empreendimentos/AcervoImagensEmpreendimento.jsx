import { useState } from 'react';
import { listarAcervoCadastro } from '@/services/acervoImagens';

export default function AcervoImagensEmpreendimento({ nome, ocupado, bloqueado, quantidadeAtual, capaDoAcervo, onUsarCapa, onAdicionar }) {
  const fotos = listarAcervoCadastro(nome);
  const [aberto, setAberto] = useState(false);
  const [selecionadas, setSelecionadas] = useState([]);
  const [adicionadas, setAdicionadas] = useState([]);
  const [erro, setErro] = useState('');
  const indisponivel = ocupado || bloqueado;
  const limite = Math.max(0, Math.min(5, 20 - quantidadeAtual));
  if (!fotos.length) return null;

  function selecionar(src, marcar) {
    setErro('');
    if (marcar && selecionadas.length >= limite) {
      setErro(`Selecione até ${limite} foto(s) neste envio. A galeria permite 20 fotos no total.`);
      return;
    }
    setSelecionadas((itens) => marcar ? [...itens, src] : itens.filter((item) => item !== src));
  }

  async function usarCapa(foto) {
    if (await onUsarCapa(foto.src)) {
      setSelecionadas((itens) => itens.filter((src) => src !== foto.src));
    }
  }

  async function adicionar() {
    if (!selecionadas.length || selecionadas.length > limite || indisponivel) return;
    // A ordem segue a curadoria, independentemente da ordem dos cliques.
    const fontes = fotos.filter((foto) => selecionadas.includes(foto.src)).map((foto) => foto.src);
    if (await onAdicionar(fontes)) {
      setAdicionadas((anteriores) => [...anteriores, ...fontes]);
      setSelecionadas([]);
    }
  }

  return (
    <div className="rounded-xl border border-gold/30 bg-card-2 p-3">
      <button type="button" aria-expanded={aberto} disabled={ocupado}
        onClick={() => setAberto((valor) => !valor)}
        className="min-h-11 w-full text-left text-sm font-semibold text-gold disabled:opacity-50">
        {aberto ? 'Fechar acervo Place' : 'Escolher fotos do acervo Place'}
      </button>
      {aberto && <div className="mt-3 space-y-3" aria-label={`Acervo Place de ${nome}`}>
        <p className="text-xs text-ink-2">Seleção conferida das pastas de imagens de {nome}, sem arte publicitária sobreposta. Perspectivas ilustradas.</p>
        <p className="text-xs text-ink-3">Escolha uma capa e até cinco fotos por envio. As fotos atuais continuam na galeria; remova as versões antigas que deseja substituir.</p>
        <p className="text-xs text-ink-3">Se o empreendimento estiver publicado, as imagens salvas já poderão aparecer no site.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((foto) => {
            const adicionada = adicionadas.includes(foto.src);
            const usadaNaCapa = capaDoAcervo === foto.src;
            return <div key={foto.src} className="overflow-hidden rounded-xl border border-line bg-card">
              <img src={foto.src} alt={foto.alt} loading="lazy" className="aspect-4/3 w-full object-cover" />
              <p className="px-2 pt-2 text-xs text-ink-2">Foto {foto.numero} · {foto.alt.split(' — ')[1]}</p>
              <button type="button" disabled={indisponivel || usadaNaCapa || adicionada}
                onClick={() => usarCapa(foto)} aria-label={`Usar foto ${foto.numero} como capa`}
                className="min-h-11 w-full px-2 text-xs text-gold disabled:opacity-50">
                {usadaNaCapa ? 'Capa aplicada nesta edição' : adicionada ? 'Adicionada à galeria' : 'Usar como capa'}
              </button>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 border-t border-line px-2 text-xs text-ink-2">
                <input type="checkbox" checked={selecionadas.includes(foto.src)}
                  disabled={indisponivel || adicionada || usadaNaCapa || limite === 0}
                  onChange={(evento) => selecionar(foto.src, evento.target.checked)}
                  aria-label={`Adicionar foto ${foto.numero} à galeria`} />
                {usadaNaCapa ? 'Usada na capa' : adicionada ? 'Adicionada nesta edição' : 'Selecionar para galeria'}
              </label>
            </div>;
          })}
        </div>
        {erro && <p role="alert" className="text-xs text-danger">{erro}</p>}
        <button type="button" disabled={indisponivel || !selecionadas.length || selecionadas.length > limite}
          onClick={adicionar}
          className="min-h-11 w-full rounded-xl border border-gold/50 px-4 text-sm font-semibold text-gold disabled:opacity-50">
          Adicionar {selecionadas.length} foto(s) selecionada(s)
        </button>
      </div>}
    </div>
  );
}
