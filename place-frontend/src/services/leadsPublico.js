import { api } from "@/lib/apiClient";
import { textoDoConsentimento } from "@/lib/consentimento";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** @param {{ nome: string, email: string, telefone: string, empreendimento?: { id: string|number, title: string } | null }} dados */
export async function enviarLead({ nome, email, telefone, empreendimento, website = "", canal = "", consentimento = null }) {
  const corpo = {
    nome, email, telefone, website,
    mensagem: (empreendimento ? `Interesse em: ${empreendimento.title}` : "Interesse geral (ainda não escolheu um empreendimento)")
      + (canal ? ` — via ${canal}` : "")
      + (consentimento ? `\n${textoDoConsentimento(consentimento)}` : ""),
  };
  if (empreendimento && UUID.test(String(empreendimento.id))) corpo.empreendimentoId = empreendimento.id;
  return (await api.post("/leads", corpo, { auth: false })).lead;
}
