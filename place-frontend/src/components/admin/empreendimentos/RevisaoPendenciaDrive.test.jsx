import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RevisaoPendenciaDrive from './RevisaoPendenciaDrive';
import PendenciasDrivePanel from './PendenciasDrivePanel';
import { listarDocumentosAdmin } from '@/services/documentosComerciaisAdmin';
import { revisarPendenciaDrive, listarPendenciasDrive } from '@/services/pendenciasDrive';

vi.mock('@/services/documentosComerciaisAdmin', () => ({ listarDocumentosAdmin: vi.fn() }));
vi.mock('@/services/pendenciasDrive', () => ({ revisarPendenciaDrive: vi.fn(), listarPendenciasDrive: vi.fn() }));

const base = { id: 'pendencia-1', revisao: 0, status: 'pendente', arquivoNome: 'Tabela outubro.pdf' };
const empreendimentos = [{ id: 'emp-1', nome: 'Candeias Life Club' }];
const fechar = vi.fn();
function Tela({ inicial = base }) {
  const [item, setItem] = useState(inicial);
  return <RevisaoPendenciaDrive item={item} empreendimentos={empreendimentos} onFechar={fechar}
    onAtualizar={(resultado) => setItem((anterior) => ({ ...anterior, ...resultado }))} />;
}
beforeEach(() => { vi.resetAllMocks(); listarDocumentosAdmin.mockResolvedValue([]); });

describe('revisão explícita de documentos do Drive', () => {
  it('salva vínculo sem aprovar e exige confirmação para concluir com a nova revisão', async () => {
    const user = userEvent.setup();
    revisarPendenciaDrive.mockResolvedValueOnce({ revisao: 1, empreendimentoId: 'emp-1', tipo: 'tabela', tituloRevisado: 'Tabela outubro.pdf' })
      .mockResolvedValueOnce({ status: 'resolvido', revisao: 2 });
    render(<Tela />);
    const aprovar = screen.getByRole('button', { name: 'Aprovar e concluir revisão' });
    expect(aprovar).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Empreendimento'), 'emp-1');
    await user.selectOptions(screen.getByLabelText('Tipo de documento'), 'tabela');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar vínculo em revisão' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Salvar vínculo em revisão' }));
    await screen.findByText(/Vínculo salvo em revisão/);
    expect(revisarPendenciaDrive).toHaveBeenCalledTimes(1);
    expect(revisarPendenciaDrive.mock.calls[0][1]).toMatchObject({ acao: 'vincular', revisao: 0, empreendimentoId: 'emp-1', tipo: 'tabela' });
    expect(aprovar).toBeDisabled();
    await user.type(screen.getByLabelText('Motivo da decisão'), 'Conferi o documento com a construtora.');
    await user.click(screen.getByRole('checkbox'));
    await user.click(aprovar);
    await waitFor(() => expect(fechar).toHaveBeenCalledOnce());
    expect(revisarPendenciaDrive.mock.calls[1][1]).toMatchObject({ acao: 'concluir', revisao: 1, confirmarAprovacao: true });
  });

  it('permite ignorar com motivo sem associar um imóvel por palpite', async () => {
    const user = userEvent.setup();
    revisarPendenciaDrive.mockResolvedValue({ status: 'ignorado', revisao: 1 });
    render(<Tela />);
    await user.type(screen.getByLabelText('Motivo da decisão'), 'Documento jurídico, fora do catálogo comercial.');
    await user.click(screen.getByRole('button', { name: 'Ignorar com motivo' }));
    await waitFor(() => expect(fechar).toHaveBeenCalledOnce());
    expect(revisarPendenciaDrive.mock.calls[0][1]).toEqual({ acao: 'ignorar', revisao: 0,
      motivo: 'Documento jurídico, fora do catálogo comercial.', confirmarAprovacao: false });
  });

  it('mostra conflito e mantém a revisão aberta sem anunciar sucesso', async () => {
    const user = userEvent.setup();
    revisarPendenciaDrive.mockRejectedValue(new Error('Esta pendência mudou. Atualize a lista.'));
    render(<Tela />);
    await user.type(screen.getByLabelText('Motivo da decisão'), 'Documento institucional.');
    await user.click(screen.getByRole('button', { name: 'Ignorar com motivo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Esta pendência mudou');
    expect(fechar).not.toHaveBeenCalled();
  });

  it('bloqueia aprovação quando os dados foram alterados sem salvar', async () => {
    const user = userEvent.setup();
    render(<Tela inicial={{ ...base, empreendimentoId: 'emp-1', tipo: 'tabela', tituloRevisado: 'Tabela mensal' }} />);
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeEnabled());
    await user.click(screen.getByRole('checkbox'));
    await user.type(screen.getByLabelText('Fase (opcional)'), 'Fase 2');
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Aprovar e concluir revisão' })).toBeDisabled();
  });

  it('não permite salvar ou aprovar quando a consulta dos documentos falha', async () => {
    listarDocumentosAdmin.mockRejectedValue(new Error('Falha ao consultar documentos.'));
    render(<Tela inicial={{ ...base, empreendimentoId: 'emp-1', tipo: 'tabela', tituloRevisado: 'Tabela mensal' }} />);
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Salvar vínculo em revisão' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Aprovar e concluir revisão' })).toBeDisabled();
  });

  it('retira o item ignorado da fila e permite consultar a decisão no histórico', async () => {
    const user = userEvent.setup();
    const ignorado = { ...base, status: 'ignorado', revisao: 1, motivoRevisao: 'Documento institucional.' };
    listarPendenciasDrive.mockResolvedValueOnce({ itens: [base], haMais: false })
      .mockResolvedValueOnce({ itens: [], haMais: false })
      .mockResolvedValueOnce({ itens: [ignorado], haMais: false });
    revisarPendenciaDrive.mockResolvedValue(ignorado);
    render(<PendenciasDrivePanel empreendimentos={empreendimentos} />);
    await user.click(await screen.findByRole('button', { name: 'Revisar pendência' }));
    await user.type(screen.getByLabelText('Motivo da decisão'), 'Documento institucional.');
    await user.click(screen.getByRole('button', { name: 'Ignorar com motivo' }));
    await screen.findByText(/Pendência ignorada/);
    await waitFor(() => expect(screen.getByLabelText('Situação das pendências')).toBeEnabled());
    expect(screen.queryByRole('button', { name: 'Revisar pendência' })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Situação das pendências'), 'ignorado');
    await screen.findByText(/Decisão: Documento institucional/);
    expect(listarPendenciasDrive).toHaveBeenLastCalledWith('ignorado');
    expect(screen.queryByRole('button', { name: 'Revisar pendência' })).not.toBeInTheDocument();
  });
});
