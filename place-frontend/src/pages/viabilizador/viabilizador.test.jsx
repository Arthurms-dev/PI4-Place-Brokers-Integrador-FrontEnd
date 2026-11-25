import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MeusProdutosPage from "./MeusProdutosPage";
import ViabilizadorBooksPage from "./ViabilizadorBooksPage";
import { atualizarProduto, enviarDocumento, getProdutos } from "@/services/viabilizador";

vi.mock("@/services/viabilizador", async (original) => ({
  ...(await original()),
  getProdutos: vi.fn(),
  atualizarProduto: vi.fn(),
  enviarDocumento: vi.fn(),
}));
vi.mock("@/services/empreendimentos", () => ({ urlDoDocumento: vi.fn() }));

const hoje = new Date().toISOString();
const produto = (extra = {}) => ({
  id: "p1", nome: "Vila Alta Vista", bairro: "Janga", cidade: "Paulista", uf: "PE", capaUrl: null,
  disponivel: true, publicado: true, segmento: "mcmv", precoMin: 247456, precoMax: 303463, parcelaMin: 699,
  temBook: true, temTabela: false, bookAtualizadoEm: hoje, tabelaAtualizadoEm: null, documentosAtualizadosEm: hoje,
  pendencias: ["sem_tabela"], ...extra,
});

function abrir(Pagina) {
  render(<MemoryRouter><Pagina /></MemoryRouter>);
  return userEvent.setup();
}

describe("Meus produtos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marcar como esgotado pede confirmação e explica o efeito", async () => {
    getProdutos.mockResolvedValue({ construtora: { nome: "VL" }, produtos: [produto()] });
    atualizarProduto.mockResolvedValue(produto({ disponivel: false }));
    const user = abrir(MeusProdutosPage);

    await user.click(await screen.findByRole("button", { name: "Marcar como esgotado" }));
    const dialogo = screen.getByRole("dialog");
    expect(dialogo).toHaveTextContent("selo Esgotado");
    expect(atualizarProduto).not.toHaveBeenCalled();

    await user.click(within(dialogo).getByRole("button", { name: "Marcar como esgotado" }));
    expect(atualizarProduto).toHaveBeenCalledWith("p1", { disponivel: false });
    expect(await screen.findByRole("button", { name: "Voltar a vender" })).toBeInTheDocument();
  });

  it("no MCMV mostra e edita a parcela; pendência leva à tela certa", async () => {
    getProdutos.mockResolvedValue({ construtora: { nome: "VL" }, produtos: [produto()] });
    atualizarProduto.mockResolvedValue(produto({ parcelaMin: 650 }));
    const user = abrir(MeusProdutosPage);

    expect(await screen.findByText("R$ 699/mês")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sem tabela de preços/ })).toHaveAttribute("href", "/viabilizador/books");

    await user.click(screen.getByRole("button", { name: "Editar preço e parcela" }));
    const parcela = screen.getByLabelText(/Parcelas a partir de/);
    await user.clear(parcela);
    await user.type(parcela, "65000");
    await user.click(screen.getByRole("button", { name: "Salvar preço e parcela" }));
    expect(atualizarProduto).toHaveBeenCalledWith("p1", expect.objectContaining({ parcelaMin: 650 }));
  });
});

describe("Books e tabelas", () => {
  beforeEach(() => vi.clearAllMocks());

  it("substituir o PDF pede confirmação com o nome do arquivo", async () => {
    getProdutos.mockResolvedValue({ construtora: { nome: "VL" }, produtos: [produto()] });
    enviarDocumento.mockResolvedValue(produto());
    const user = abrir(ViabilizadorBooksPage);

    await screen.findByText("Vila Alta Vista");
    const arquivo = new File(["%PDF"], "book-novo.pdf", { type: "application/pdf" });
    const [entradaBook] = document.querySelectorAll('input[type="file"]');
    await user.upload(entradaBook, arquivo);

    const dialogo = screen.getByRole("dialog");
    expect(dialogo).toHaveTextContent("book-novo.pdf");
    expect(enviarDocumento).not.toHaveBeenCalled();
    await user.click(within(dialogo).getByRole("button", { name: "Substituir" }));
    expect(enviarDocumento).toHaveBeenCalledWith("p1", "book", arquivo);
  });

  it("produto sem documento não mostra data de atualização", async () => {
    getProdutos.mockResolvedValue({ construtora: { nome: "VL" }, produtos: [produto({ temBook: false, bookAtualizadoEm: null, documentosAtualizadosEm: null })] });
    abrir(ViabilizadorBooksPage);

    expect(await screen.findByText("Nenhum documento enviado ainda")).toBeInTheDocument();
    expect(screen.queryByText(/Última atualização/)).not.toBeInTheDocument();
  });
});
