import { describe, expect, it } from 'vitest';
import { obterFichaPublicaVerificada } from './fichasPublicasVerificadas';
import { normalizarApi } from './empreendimentosPublicos';

describe('fichas auditadas do catálogo público', () => {
  it('não perde a informação de suíte do Candeias Life Club', () => {
    expect(obterFichaPublicaVerificada('Candeias Life Club')?.suitesTexto).toMatch(/1 suíte/);
  });
  it('não generaliza suíte para todas as unidades do Brisa do Mar', () => {
    expect(obterFichaPublicaVerificada('Brisa do Mar')?.suitesTexto).toBe('Opções com suíte');
  });
  it('exibe suíte no cadastro normalizado do Candeias Life Club', () => {
    const item = normalizarApi({ id: 5, nome: 'Candeias Life Club', quartos_min: 2, quartos_max: 2, cidade: 'Jaboatão dos Guararapes', uf: 'PE' });
    expect(item.quartosTexto).toBe('2 quartos');
    expect(item.suitesTexto).toMatch(/1 suíte/);
  });
  it('usa a galeria real recebida no detalhe, sem inventar URLs', () => {
    const item = normalizarApi({ id: 7, nome: 'Empreendimento sem ficha', quartos_min: 2, cidade: 'Recife', uf: 'PE', imagens: [{ url: 'https://example.test/b.jpg', ordem: 2 }, { url: 'https://example.test/a.jpg', ordem: 1 }] });
    expect(item.galeria).toEqual(['https://example.test/a.jpg', 'https://example.test/b.jpg']);
  });
  it('usa fonte neutra quando o empreendimento não foi confirmado', () => {
    expect(obterFichaPublicaVerificada('Empreendimento desconhecido')).toBeNull();
  });
});
