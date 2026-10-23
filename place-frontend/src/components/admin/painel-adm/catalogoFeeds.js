// Feed derivado exclusivamente dos empreendimentos retornados pela API.
// Nao confundir atualizado_em com auditoria: o campo nao identifica autor ou alteracao.
const dataValida = (valor) => typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}/.test(valor);
const dataDe = (imovel) => dataValida(imovel.atualizado_em)
  ? imovel.atualizado_em.slice(0, 10)
  : dataValida(imovel.criado_em) ? imovel.criado_em.slice(0, 10) : null;

export function criarFeedsDoCatalogo({ data, loading, error }) {
  const estado = { loading, error };
  if (!Array.isArray(data)) return {
    pendencias: { ...estado, data: [] },
    atualizacoes: { ...estado, data: [] },
  };

  const pendencias = data
    .filter((e) => e.publicado === true)
    .map((e) => {
      const faltas = [];
      if (!e.tem_book) faltas.push('book');
      if (!e.tem_tabela) faltas.push('tabela de preços');
      if (!e.capa_url) faltas.push('foto de capa');
      if (e.latitude == null || e.longitude == null) faltas.push('coordenadas do mapa');
      return { e, faltas };
    })
    .filter(({ faltas, e }) => faltas.length > 0 && dataDe(e))
    .sort((a, b) => b.faltas.length - a.faltas.length || (dataDe(b.e) ?? '').localeCompare(dataDe(a.e) ?? ''))
    .slice(0, 6)
    .map(({ e, faltas }) => ({
      id: `pendencia-${e.id}`,
      title: e.nome,
      description: `Faltando: ${faltas.join(', ')}.`,
      date: dataDe(e),
      tagLabel: `${faltas.length} ${faltas.length === 1 ? 'item' : 'itens'}`,
      tagTone: 'gold',
    }));

  const atualizacoes = data
    .filter((e) => dataDe(e))
    .sort((a, b) => (b.atualizado_em ?? b.criado_em ?? '').localeCompare(a.atualizado_em ?? a.criado_em ?? ''))
    .slice(0, 6)
    .map((e) => ({
      id: `atualizacao-${e.id}`,
      title: e.nome,
      description: `${e.cidade ?? 'Localidade não informada'}/${e.uf ?? '—'} · ${e.publicado ? 'Publicado' : 'Rascunho'}. Última alteração cadastral registrada.`,
      date: dataDe(e),
      tagLabel: e.publicado ? 'Publicado' : 'Rascunho',
      tagTone: e.publicado ? 'ok' : 'neutral',
    }));

  return {
    pendencias: { ...estado, data: pendencias },
    atualizacoes: { ...estado, data: atualizacoes },
  };
}
