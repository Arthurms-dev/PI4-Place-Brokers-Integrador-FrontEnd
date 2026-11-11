import { describe, expect, it } from 'vitest';
import { textoMotivo, dataPendencia } from './pendenciasDrive';

describe('exibição de pendências do Drive', () => {
  it('descreve arquivo modificado', () => {
    expect(textoMotivo('ARQUIVO_MODIFICADO')).toBe('Arquivo do Drive modificado');
  });
  it('não inventa classificação para motivo desconhecido', () => {
    expect(textoMotivo('MOTIVO_FUTURO')).toBe('Revisão necessária');
  });
  it('exibe data desconhecida com texto neutro', () => {
    expect(dataPendencia(null)).toBe('Não informada');
    expect(dataPendencia('invalida')).toBe('Não informada');
  });
  it('formata data para o calendário brasileiro', () => {
    expect(dataPendencia('2026-10-24T15:00:00Z')).toBe('24/10/2026');
  });
});
