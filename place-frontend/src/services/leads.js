import { api } from "@/lib/apiClient";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONE_REGEX = /^\D*\d{10,11}\D*$/;

export function validarLead({ nome, email, telefone } = {}) {
  const erros = {};
  if (!nome?.trim()) erros.nome = "Informe o nome.";
  if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) erros.email = "E-mail inválido.";
  if (!telefone?.trim() || !TELEFONE_REGEX.test(telefone)) erros.telefone = "Telefone inválido.";
  return erros;
}

/** Envia leads para a API, não diretamente ao Supabase (regras e roleta vivem no back). */
export async function criarLead({ nome, email, telefone, empreendimentoId, mensagem }) {
  const erros = validarLead({ nome, email, telefone });
  if (Object.keys(erros).length) {
    const err = new Error("Verifique os campos destacados.");
    err.fieldErrors = erros;
    throw err;
  }
  await api.post("/leads", {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone.trim(),
    empreendimentoId: empreendimentoId ?? null,
    mensagem: mensagem?.trim() || null,
  }, { auth: false });
}
