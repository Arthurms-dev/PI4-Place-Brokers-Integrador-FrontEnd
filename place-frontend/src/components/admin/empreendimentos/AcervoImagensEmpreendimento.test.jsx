import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AcervoImagensEmpreendimento from './AcervoImagensEmpreendimento';
import { listarAcervoCadastro } from '@/services/acervoImagens';

describe('seleção de imagens conferidas no ADM', () => {
  it('não grava ao abrir e separa capa de galeria, preservando ordem da curadoria', async () => {
    const user = userEvent.setup();
    const capa = vi.fn().mockResolvedValue(true);
    const adicionar = vi.fn().mockResolvedValue(true);
    function Tela() {
      const [src, setSrc] = useState(null);
      return <AcervoImagensEmpreendimento nome="Engenho Paulista" quantidadeAtual={0} capaDoAcervo={src}
        onUsarCapa={async (foto) => { await capa(foto); setSrc(foto); return true; }} onAdicionar={adicionar} />;
    }
    render(<Tela />);
    await user.click(screen.getByRole('button', { name: 'Escolher fotos do acervo Place' }));
    expect(capa).not.toHaveBeenCalled(); expect(adicionar).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Usar foto 1 como capa' }));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Adicionar foto 1 à galeria' })).toBeDisabled());
    await user.click(screen.getByRole('checkbox', { name: 'Adicionar foto 3 à galeria' }));
    await user.click(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar 2 foto(s) selecionada(s)' }));
    const fotos = listarAcervoCadastro('Engenho Paulista');
    expect(adicionar).toHaveBeenCalledWith([fotos[1].src, fotos[2].src]);
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' })).toBeDisabled());
  });
  it('respeita o espaço restante e o limite de cinco por envio', async () => {
    const user = userEvent.setup();
    render(<AcervoImagensEmpreendimento nome="Engenho Paulista" quantidadeAtual={19} onUsarCapa={vi.fn()} onAdicionar={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Escolher fotos do acervo Place' }));
    await user.click(screen.getByRole('checkbox', { name: 'Adicionar foto 1 à galeria' }));
    await user.click(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' }));
    expect(screen.getByRole('alert')).toHaveTextContent('até 1 foto');
    expect(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' })).not.toBeChecked();
  });
  it('não oferece seleção para nome semelhante, sem acervo conferido', () => {
    render(<AcervoImagensEmpreendimento nome="Engenho Paulista II" quantidadeAtual={0} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('não seleciona a sexta foto no mesmo envio', async () => {
    const user = userEvent.setup();
    render(<AcervoImagensEmpreendimento nome="Engenho Paulista" quantidadeAtual={0} onUsarCapa={vi.fn()} onAdicionar={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Escolher fotos do acervo Place' }));
    for (const checkbox of screen.getAllByRole('checkbox')) await user.click(checkbox);
    expect(screen.getAllByRole('checkbox').filter((input) => input.checked)).toHaveLength(5);
    expect(screen.getByRole('alert')).toHaveTextContent('até 5 foto');
  });
  it('mantém seleção disponível se o envio falhar', async () => {
    const user = userEvent.setup();
    render(<AcervoImagensEmpreendimento nome="Porto Carolina" quantidadeAtual={0} onAdicionar={vi.fn().mockResolvedValue(false)} />);
    await user.click(screen.getByRole('button', { name: 'Escolher fotos do acervo Place' }));
    await user.click(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar 1 foto(s) selecionada(s)' }));
    expect(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Adicionar foto 2 à galeria' })).toBeEnabled();
  });
});
