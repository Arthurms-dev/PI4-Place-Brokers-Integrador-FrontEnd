export function filtrarClientes(clientes, { busca = "", corretorId = "" } = {}) {
  const termo = busca.trim().toLowerCase();

  return clientes.filter((cliente) => {
    const bateBusca =
      !termo ||
      cliente.nome?.toLowerCase().includes(termo) ||
      cliente.email?.toLowerCase().includes(termo) ||
      cliente.telefone?.includes(termo);

    const bateCorretor = !corretorId || cliente.corretor?.id === corretorId;

    return bateBusca && bateCorretor;
  });
}

export function formatarTelefone(telefone) {
  if (!telefone) return "—";
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return telefone;
}

export function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}