import pino from "@/assets/logo-pino.webp";
import texto from "@/assets/logo-texto-escuro.webp";

// Logo grande do topo da home (pedido da diretoria): o pino "pousa" no mapa,
// o nome aparece da esquerda para a direita e um brilho dourado passa pelo pino.
// As duas partes vêm do logo original (600 x 258), cortado entre o pino e o texto.
export default function LogoHero({ className = "" }) {
  return (
    <div id="pb-logo-hero" role="img" aria-label="Place Brokers Negócios Imobiliários" className={`pb-logo-hero relative flex aspect-[600/258] w-full ${className}`}>
      <span className="pb-logo-hero-pino relative block w-[36.83%] shrink-0">
        <img src={pino} alt="" width="221" height="258" decoding="async" fetchPriority="high" className="block h-full w-full object-contain" />
        <span aria-hidden="true" className="pb-logo-hero-brilho absolute inset-0" style={{ WebkitMaskImage: `url(${pino})`, maskImage: `url(${pino})` }} />
        <span aria-hidden="true" className="pb-logo-hero-sombra absolute -bottom-[6%] left-[28%] h-[7%] w-[44%] rounded-[50%] bg-[#0b203b]/25 blur-[6px]" />
      </span>
      <img src={texto} alt="" width="379" height="258" decoding="async" className="pb-logo-hero-texto block h-full w-[63.17%] object-contain" />
    </div>
  );
}
