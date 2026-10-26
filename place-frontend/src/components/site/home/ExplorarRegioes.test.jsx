import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExplorarRegioes, { montarColecoes } from './ExplorarRegioes';

const itens = [
  { id: 'a', title: 'Imóvel A', image: '/a.webp', precoMin: 300000, quartosMax: 2, tag: 'Lançamento' },
  { id: 'b', title: 'Imóvel B', image: '/b.webp', precoMin: 400000, quartosMax: 3, tag: 'Em obras' },
  { id: 'c', title: 'Imóvel C', image: '/c.webp', precoMin: 500000, quartosMax: 1, tag: 'Lançamento' },
];

afterEach(cleanup);

describe('coleções da home com exemplos do catálogo', () => {
  it('varia imóveis e capas quando existem alternativas compatíveis', () => {
    const colecoes = montarColecoes(itens);
    expect(colecoes.map((c) => c.exemplo.id)).toEqual(['a', 'b', 'c']);
    expect(colecoes.map((c) => c.quantidade)).toEqual([1, 2, 2]);
    for (const colecao of colecoes) expect(colecao.incluir(colecao.exemplo)).toBe(true);
    expect(itens.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('evita também a mesma URL de capa em cadastros diferentes', () => {
    const colecoes = montarColecoes([itens[0], { ...itens[1], image: '/a.webp' },
      { ...itens[2], quartosMax: 2 }]);
    expect(colecoes[1].exemplo.id).toBe('c');
  });

  it('repete o único exemplo verdadeiro em vez de associar foto de outra categoria', () => {
    const colecoes = montarColecoes([itens[0]]);
    expect(colecoes).toHaveLength(3);
    expect(colecoes.every((c) => c.exemplo.id === 'a')).toBe(true);
  });

  it('mantém categoria sem foto e omite categorias sem imóveis', () => {
    const colecoes = montarColecoes([{ ...itens[0], image: null }]);
    expect(colecoes).toHaveLength(3);
    expect(colecoes.every((c) => !c.exemplo)).toBe(true);
    expect(montarColecoes([])).toEqual([]);
  });

  it('aplica o filtro da categoria ao clicar no exemplo', async () => {
    render(<ExplorarRegioes itens={itens} onEscolher={onEscolher} />);
    await userEvent.click(screen.getByRole('button', { name: /2 quartos ou mais/ }));
    expect(onEscolher).toHaveBeenCalledWith({ quartos: '2' });
  });
});

const onEscolher = vi.fn();
