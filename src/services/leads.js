import { supabase } from "@/lib/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONE_REGEX = /^\D*\d{10,11}\D*$/;

export function validarLead({ nome, email, telefone } = {}) {
  const erros = {};
  if (!nome?.trim()) erros.nome = "Informe o nome.";
  if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) erros.email = "E-mail inválido.";
  if (!telefone?.trim() || !TELEFONE_REGEX.test(telefone)) erros.telefone = "Telefone inválido.";
  return erros;
}

/**
 * @param {{ nome: string, email: string, telefone: string, empreendimentoId?: string, mensagem?: string }} dados
 */
export async function criarLead({ nome, email, telefone, empreendimentoId, mensagem }) {
  const erros = validarLead({ nome, email, telefone });
  if (Object.keys(erros).length) {
    const err = new Error("Verifique os campos destacados.");
    err.fieldErrors = erros;
    throw err;
  }

  const { error } = await supabase.from("leads").insert({
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone.trim(),
    empreendimento_id: empreendimentoId ?? null,
    mensagem: mensagem?.trim() || null,
    origem: "site",
  });

  if (error) throw new Error("Não foi possível enviar seus dados. Tente novamente.");
}