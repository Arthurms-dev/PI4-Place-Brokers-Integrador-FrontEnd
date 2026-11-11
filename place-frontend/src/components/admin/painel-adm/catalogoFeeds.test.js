import { describe, expect, it } from 'vitest';
import { criarFeedsDoCatalogo } from './catalogoFeeds';

const item = (overrides = {}) => ({
  id: 'abc', nome: 'Empreendimento', cidade: 'Recife', uf: 'PE', publicado: true,
  tem_book: true, tem_tabela: true, capa_url: 'https://exemplo.test/capa.webp',
  latitude: -8.01, longitude: -34.9, atualizado_em: '2026-10-22T15:10:00Z',
  ...overrides,
});

describe('criarFeedsDoCatalogo', () => {
  it('não fabrica registros durante carregamento ou erro', () => {
    expect(criarFeedsDoCatalogo({ data: null, loading: true, error: null }).pendencias.data).toEqual([]);
    const error = new Error('API indisponível');
    expect(criarFeedsDoCatalogo({ data: null, loading: false, error }).atualizacoes.error).toBe(error);
  });
  it('identifica pendências somente em empreendimentos publicados', () => {
    const data = [item({ id: '1', tem_tabela: false }), item({ id: '2', publicado: false, tem_book: false })];
    const { pendencias } = criarFeedsDoCatalogo({ data, loading: false, error: null });
    expect(pendencias.data).toHaveLength(1);
    expect(pendencias.data[0].title).toBe('Empreendimento');
    expect(pendencias.data[0].description).toContain('tabela de preços');
  });
  it('mostra vazio quando todos os dados essenciais estão presentes', () => {
    const { pendencias } = criarFeedsDoCatalogo({ data: [item()], loading: false, error: null });
    expect(pendencias.data).toHaveLength(0);
  });
  it('mostra atualização cadastral sem alegar histórico de auditoria', () => {
    const { atualizacoes } = criarFeedsDoCatalogo({ data: [item()], loading: false, error: null });
    expect(atualizacoes.data[0].date).toBe('2026-10-22');
    expect(atualizacoes.data[0].description).toContain('alteração cadastral');
  });
});
