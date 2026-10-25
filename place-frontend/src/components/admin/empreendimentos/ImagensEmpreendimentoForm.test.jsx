import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImagensEmpreendimentoForm from './ImagensEmpreendimentoForm';
import { buscarEmpreendimentoPorId } from '@/services/empreendimentos';
import { adicionarFotosEmpreendimento, trocarCapaEmpreendimento, removerFotoEmpreendimento } from '@/services/imagensEmpreendimento';
import { carregarFotoDoAcervo } from '@/services/acervoImagens';

vi.mock('@/services/empreendimentos', () => ({ buscarEmpreendimentoPorId: vi.fn() }));
vi.mock('@/services/imagensEmpreendimento', () => ({ adicionarFotosEmpreendimento: vi.fn(), trocarCapaEmpreendimento: vi.fn(), removerFotoEmpreendimento: vi.fn() }));
vi.mock('@/services/acervoImagens', async (original) => ({ ...await original(), carregarFotoDoAcervo: vi.fn() }));
const inicial = { capa_url: '/capa-antiga.webp', imagens: [{ id: 'foto-antiga', url: '/foto-antiga.webp' }] };
beforeEach(() => {
  vi.resetAllMocks(); buscarEmpreendimentoPorId.mockResolvedValue(inicial);
  carregarFotoDoAcervo.mockResolvedValue(new File(['foto'], 'acervo.webp', { type: 'image/webp' }));
  adicionarFotosEmpreendimento.mockResolvedValue({ imagens: [] });
  trocarCapaEmpreendimento.mockResolvedValue({ capa_url: '/capa-nova.webp' });
});
function tela() { return render(<ImagensEmpreendimentoForm empreendimentoId="emp-1" nomeEmpreendimento="Engenho Paulista" />); }
async function abrir(user) { await user.click(await screen.findByRole('button', { name: 'Escolher fotos do acervo Place' })); }

describe('upload de acervo no cadastro de imagens', () => {
  it('usa upload autenticado existente e não remove as fotos anteriores', async () => {
    const user = userEvent.setup(); tela(); await abrir(user);
    await user.click(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar 1 foto(s) selecionada(s)' }));
    await screen.findByText(/foto\(s\) do acervo adicionada/);
    expect(adicionarFotosEmpreendimento).toHaveBeenCalledWith('emp-1', [expect.any(File)]);
    expect(removerFotoEmpreendimento).not.toHaveBeenCalled();
    expect(trocarCapaEmpreendimento).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Remover foto 1' })).toBeInTheDocument();
  });
  it('atualiza a capa sem enviar as outras imagens', async () => {
    const user = userEvent.setup(); const atualizada = vi.fn();
    render(<ImagensEmpreendimentoForm empreendimentoId="emp-1" nomeEmpreendimento="Engenho Paulista" onCapaAtualizada={atualizada} />);
    await abrir(user); await user.click(screen.getByRole('button', { name: 'Usar foto 1 como capa' }));
    await screen.findByText('Capa do acervo salva no cadastro do empreendimento.');
    expect(trocarCapaEmpreendimento).toHaveBeenCalledWith('emp-1', expect.any(File));
    expect(atualizada).toHaveBeenCalledWith('/capa-nova.webp');
    expect(adicionarFotosEmpreendimento).not.toHaveBeenCalled();
  });
  it('não inicia upload se uma imagem do lote não puder ser carregada', async () => {
    const user = userEvent.setup();
    carregarFotoDoAcervo.mockRejectedValue(new Error('Foto indisponível.'));
    tela(); await abrir(user);
    await user.click(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar 1 foto(s) selecionada(s)' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Foto indisponível');
    expect(adicionarFotosEmpreendimento).not.toHaveBeenCalled();
  });
  it('não repete upload salvo quando só a atualização da lista falha', async () => {
    const user = userEvent.setup();
    buscarEmpreendimentoPorId.mockResolvedValueOnce(inicial).mockRejectedValueOnce(new Error('Sem conexão.')).mockResolvedValue(inicial);
    tela(); await abrir(user);
    await user.click(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar 1 foto(s) selecionada(s)' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('As imagens foram salvas');
    await user.click(screen.getByRole('button', { name: 'Recarregar fotos' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Recarregar fotos' })).not.toBeInTheDocument());
    expect(adicionarFotosEmpreendimento).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' })).toBeDisabled();
  });
});
