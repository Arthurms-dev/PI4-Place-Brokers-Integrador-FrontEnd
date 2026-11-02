import { api } from "@/lib/apiClient";
import { textoDoConsentimento } from "@/lib/consentimento";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** @param {{ nome: string, email: string, telefone: string, empreendimento?: { id: string|number, title: string } | null }} dados */
export async function enviarLead({ nome, email, telefone, empreendimento, website = "", canal = "", consentimento = null, preferencia = "" }) {
  const corpo = {
    nome, email, telefone, website,
    mensagem: (empreendimento ? `Interesse em: ${empreendimento.title}` : "Interesse geral (ainda não escolheu um empreendimento)")
      + (canal ? ` — via ${canal}` : "")
      // O corretor sabe se o cliente quer reunião ou fechar online (aí manda valores e tabela direto).
      + (preferencia === "online" ? "\nPrefere receber os valores e resolver online" : preferencia === "conversar" ? "\nPrefere conversar com um especialista" : "")
      + (consentimento ? `\n${textoDoConsentimento(consentimento)}` : ""),
  };
  if (empreendimento && UUID.test(String(empreendimento.id))) corpo.empreendimentoId = empreendimento.id;
  return (await api.post("/leads", corpo, { auth: false })).lead;
}
