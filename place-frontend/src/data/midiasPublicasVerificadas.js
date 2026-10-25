import engenhoFachada from "@/assets/empreendimentos/engenho-paulista/fachada.webp";
import engenhoPiscina from "@/assets/empreendimentos/engenho-paulista/piscina.webp";
import engenhoRooftop from "@/assets/empreendimentos/engenho-paulista/rooftop.webp";
import engenhoCozinha from "@/assets/empreendimentos/engenho-paulista/cozinha.webp";
import engenhoCoworking from "@/assets/empreendimentos/engenho-paulista/coworking.webp";
import engenhoPetPlace from "@/assets/empreendimentos/engenho-paulista/pet-place.webp";
import carneirosFachada from "@/assets/empreendimentos/carneiros-park/fachada.webp";
import carneirosRooftop from "@/assets/empreendimentos/carneiros-park/rooftop.webp";
import carneirosApartamento from "@/assets/empreendimentos/carneiros-park/apartamento.webp";
import carneirosQuarto from "@/assets/empreendimentos/carneiros-park/quarto.webp";
import carneirosRecepcao from "@/assets/empreendimentos/carneiros-park/recepcao.webp";
import portoFachada from "@/assets/empreendimentos/porto-carolina/fachada.webp";
import portoPiscina from "@/assets/empreendimentos/porto-carolina/piscina.webp";
import portoAreaSocial from "@/assets/empreendimentos/porto-carolina/area-social.webp";
import portoDeck from "@/assets/empreendimentos/porto-carolina/deck.webp";
import portoGarden from "@/assets/empreendimentos/porto-carolina/garden.webp";
import portoImplantacao from "@/assets/empreendimentos/porto-carolina/implantacao.webp";
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

const ENGENHO_PAULISTA = [
  { src: engenhoFachada, alt: "Engenho Paulista — perspectiva ilustrada da fachada" },
  { src: engenhoPiscina, alt: "Engenho Paulista — perspectiva ilustrada da piscina e deck" },
  { src: engenhoRooftop, alt: "Engenho Paulista — perspectiva ilustrada do rooftop" },
  { src: engenhoCozinha, alt: "Engenho Paulista — perspectiva ilustrada da cozinha de uma das tipologias" },
  { src: engenhoCoworking, alt: "Engenho Paulista — perspectiva ilustrada do coworking" },
  { src: engenhoPetPlace, alt: "Engenho Paulista — perspectiva ilustrada do pet place" },
];
const CARNEIROS_PARK = [
  { src: carneirosFachada, alt: "Carneiros Park — perspectiva ilustrada da fachada" },
  { src: carneirosRooftop, alt: "Carneiros Park — perspectiva ilustrada do rooftop e área de lazer" },
  { src: carneirosApartamento, alt: "Carneiros Park — perspectiva ilustrada do ambiente integrado de um studio" },
  { src: carneirosQuarto, alt: "Carneiros Park — perspectiva ilustrada do quarto de uma das unidades" },
  { src: carneirosRecepcao, alt: "Carneiros Park — perspectiva ilustrada da área interna de circulação" },
];
const PORTO_CAROLINA = [
  { src: portoFachada, alt: "Porto Carolina — perspectiva ilustrada da fachada e implantação" },
  { src: portoPiscina, alt: "Porto Carolina — perspectiva ilustrada da piscina e área de lazer" },
  { src: portoAreaSocial, alt: "Porto Carolina — perspectiva ilustrada da área social junto à piscina" },
  { src: portoDeck, alt: "Porto Carolina — perspectiva ilustrada do deck da área de lazer" },
  { src: portoGarden, alt: "Porto Carolina — perspectiva ilustrada do garden de uma das unidades" },
  { src: portoImplantacao, alt: "Porto Carolina — perspectiva ilustrada da área central entre os blocos" },
];

const ACERVOS = new Map([
  ["brisa do mar", BRISA_DO_MAR],
  ["engenho paulista", ENGENHO_PAULISTA],
  ["carneiros park", CARNEIROS_PARK],
  ["porto carolina", PORTO_CAROLINA],
]);

export function obterMidiasPublicasVerificadas(nome) {
  const chave = String(nome ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");
  return ACERVOS.get(chave) ?? [];
}
