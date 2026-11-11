// Consentimento do formulário de contato (LGPD).
// A data da versão vai junto com o lead, para saber com qual texto a pessoa concordou.
export const VERSAO_POLITICA = "2026-11-02";

/** Linha que vai no fim da mensagem do lead (o corretor vê se a pessoa quer receber lançamentos). */
export function textoDoConsentimento({ novidades = false } = {}) {
  const data = VERSAO_POLITICA.split("-").reverse().join("/");
  return `Autorizou o contato (política de privacidade de ${data})${novidades ? " · Quer receber avisos de lançamentos" : " · Não quer avisos de lançamentos"}`;
}
