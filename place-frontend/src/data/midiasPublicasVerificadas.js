import fachada from "@/assets/empreendimentos/brisa-do-mar/fachada.webp";
import piscina from "@/assets/empreendimentos/brisa-do-mar/piscina.webp";
import sala from "@/assets/empreendimentos/brisa-do-mar/sala.webp";
import suite from "@/assets/empreendimentos/brisa-do-mar/suite.webp";
import varanda from "@/assets/empreendimentos/brisa-do-mar/varanda.webp";

const BRISA_DO_MAR = [
  { src: fachada, alt: "Brisa do Mar — perspectiva ilustrada da fachada" },
  { src: piscina, alt: "Brisa do Mar — perspectiva ilustrada da piscina e deck" },
  { src: sala, alt: "Brisa do Mar — perspectiva ilustrada da sala integrada" },
  { src: suite, alt: "Brisa do Mar — perspectiva ilustrada da suíte de uma das tipologias" },
  { src: varanda, alt: "Brisa do Mar — perspectiva ilustrada da varanda gourmet" },
];

export function obterMidiasPublicasVerificadas(nome) {
  const chave = String(nome ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");
  return chave === "brisa do mar" ? BRISA_DO_MAR : [];
}
