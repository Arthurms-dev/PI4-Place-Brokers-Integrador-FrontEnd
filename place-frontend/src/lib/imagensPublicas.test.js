import { describe, expect, it } from 'vitest';
import { prepararImagensPublicas } from './imagensPublicas';

describe('galeria pública segura de empreendimentos', () => {
  it('mantém foto principal e ordena fotos reais do detalhe', () => {
    const r = prepararImagensPublicas({
      titulo: 'Candeias Life Club',
      capa: 'https://img.example/capa.webp',
      imagens: [
        { url: 'https://img.example/lazer.webp', ordem: 2, alt: 'Área de lazer' },
        { url: 'https://img.example/fachada.webp', ordem: 1, alt: 'Fachada' },
      ],
    });
    expect(r.map((i) => i.src)).toEqual([
      'https://img.example/capa.webp',
      'https://img.example/fachada.webp',
      'https://img.example/lazer.webp',
    ]);
  });
  it('não expõe plantas, books, tabelas e documentos', () => {
    const r = prepararImagensPublicas({ imagens: [
      { url: 'https://img.example/04-planta.webp', alt: 'Planta baixa' },
      { url: 'https://img.example/foto.webp', tipo: 'tabela', alt: 'Arquivo de valores' },
      { url: 'https://drive.google.com/file/d/abc/view', alt: 'Book' },
      { url: 'https://img.example/apresentacao.pdf', alt: 'Documento' },
      { url: 'https://img.example/piscina.webp', alt: 'Piscina' },
    ] });
    expect(r).toEqual([{ src: 'https://img.example/piscina.webp', alt: 'Piscina' }]);
  });
  it('não duplica a capa quando reaparece na galeria', () => {
    const r = prepararImagensPublicas({ capa: '/assets/capa.webp', galeria: ['/assets/capa.webp', '/assets/lazer.webp'] });
    expect(r).toHaveLength(2);
  });
  it('recusa URLs inseguras e não aceita dados inválidos', () => {
    const r = prepararImagensPublicas({ galeria: ['javascript:alert(1)', 'data:image/svg+xml,<svg>', '//outro-site/img.jpg', '', '/assets/fachada.webp', null] });
    expect(r.map((i) => i.src)).toEqual(['/assets/fachada.webp']);
  });
  it('não cria imagens de exemplo quando o cadastro está vazio', () => {
    expect(prepararImagensPublicas({ imagens: [], titulo: 'Sem fotos' })).toEqual([]);
  });
});
