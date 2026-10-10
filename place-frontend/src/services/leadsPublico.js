const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @param {{ nome: string, email: string, telefone: string, empreendimento?: { id: string|number, title: string } | null }} dados
 */
export async function enviarLead({ nome, email, telefone, empreendimento }) {
  const corpo = {
    nome,
    email,
    telefone,
    mensagem: empreendimento ? `Interesse em: ${empreendimento.title}` : "Interesse geral (ainda não escolheu um empreendimento)",
  };
  if (empreendimento && UUID.test(String(empreendimento.id))) corpo.empreendimentoId = empreendimento.id;

  const res = await fetch(`${BASE_URL}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const erro = data.error ?? data;
    throw Object.assign(new Error(erro.message ?? "Não foi possível enviar agora. Tente novamente."), {
      fieldErrors: erro.fieldErrors ?? {},
    });
  }
  return data.lead;
}