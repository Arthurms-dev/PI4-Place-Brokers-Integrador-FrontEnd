import { precoDoEmpreendimento, prazoDoEmpreendimento } from "./precoCatalogo";

/** Endereço público do empreendimento (abre a janela dele por cima da home). */
export function linkPublicoDoEmpreendimento(emp, origem = typeof window !== "undefined" ? window.location.origin : "") {
  return `${String(origem).replace(/\/+$/, "")}/imoveis/${encodeURIComponent(emp.id)}`;
}

/**
 * Mensagem curta para o corretor mandar ao cliente.
 * Segue o jeito da Place: apresenta, desperta interesse e chama para conversar,
 * sem despejar todo o material (book e tabela ficam para a reunião).
 */
export function mensagemDoEmpreendimento(emp, { link, primeiroNomeCliente = "" } = {}) {
  const local = [emp.bairro && emp.bairro !== "A confirmar" ? emp.bairro : null, emp.cidade].filter(Boolean).join(", ");
  const preco = precoDoEmpreendimento(emp);
  const prazo = prazoDoEmpreendimento(emp);
  const linhas = [
    primeiroNomeCliente ? `Olá, ${primeiroNomeCliente}! Tudo bem?` : "Olá! Tudo bem?",
    `Separei este empreendimento para você: *${emp.nome}*${local ? ` — ${local}` : ""}.`,
    preco.temValor ? `${preco.rotulo} ${preco.valor}${preco.sufixo}.` : null,
    prazo ? `${prazo}.` : null,
    "",
    `Fotos e localização: ${link}`,
    "",
    "Quando for um bom horário para conversarmos?",
  ];
  return linhas.filter((l) => l !== null).join("\n");
}

/** Abre o WhatsApp com o texto pronto (o corretor escolhe o contato). Com telefone, já abre a conversa. */
export function linkWhatsApp(texto, telefone = "") {
  const digitos = String(telefone).replace(/\D/g, "");
  const numero = digitos ? (digitos.startsWith("55") ? digitos : `55${digitos}`) : "";
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
