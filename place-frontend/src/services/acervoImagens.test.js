import { afterEach, describe, expect, it, vi } from 'vitest';
import { carregarFotoDoAcervo, listarAcervoCadastro } from './acervoImagens';

afterEach(() => vi.unstubAllGlobals());
describe('arquivos do acervo para cadastro', () => {
  it('reconhece apenas nomes exatos dos três empreendimentos conferidos', () => {
    expect(listarAcervoCadastro(' ENGENHO PAULISTA ')).toHaveLength(6);
    expect(listarAcervoCadastro('Carneiros Park')).toHaveLength(5);
    expect(listarAcervoCadastro('Porto Carolina')).toHaveLength(6);
    expect(listarAcervoCadastro('Porto Carolina II')).toEqual([]);
    expect(listarAcervoCadastro('Brisa do Mar')).toEqual([]);
  });
  it('não solicita arquivos arbitrários nem de outro empreendimento', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const outro = listarAcervoCadastro('Porto Carolina')[0].src;
    await expect(carregarFotoDoAcervo('Engenho Paulista', outro)).rejects.toThrow('não pertence');
    await expect(carregarFotoDoAcervo('Engenho Paulista', 'https://externo.test/imagem.webp')).rejects.toThrow('não pertence');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('transforma a imagem conferida em arquivo para o upload existente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['imagem'], { type: 'image/webp' }) }));
    const foto = listarAcervoCadastro('Engenho Paulista')[0];
    const arquivo = await carregarFotoDoAcervo('Engenho Paulista', foto.src);
    expect(arquivo).toBeInstanceOf(File);
    expect(arquivo.name).toBe('engenho-paulista-01.webp');
    expect(arquivo.type).toBe('image/webp');
    expect(arquivo.size).toBe(6);
  });
  it.each([
    { ok: false },
    { ok: true, blob: async () => new Blob(['<html>'], { type: 'text/html' }) },
    { ok: true, blob: async () => new Blob([], { type: 'image/webp' }) },
  ])('rejeita falha de arquivo, página HTML e resposta vazia', async (resposta) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resposta));
    await expect(carregarFotoDoAcervo('Engenho Paulista', listarAcervoCadastro('Engenho Paulista')[0].src)).rejects.toThrow();
  });
});
