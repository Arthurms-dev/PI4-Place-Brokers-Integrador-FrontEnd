import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Banner institucional. TODO: definir destino do botão "Conheça mais". */
export function PromoBanner() {
  return (
    <Card className="relative flex flex-col justify-end overflow-hidden bg-linear-to-b from-[#16305a] to-card-2 p-4">
      <div
        aria-hidden="true"
        className="absolute inset-x-3 top-4 h-32 overflow-hidden rounded-lg bg-linear-to-b from-[#2a3f66] via-[#d58a4a] to-[#f2b26b]"
      >
        <svg viewBox="0 0 200 128" preserveAspectRatio="xMidYMax slice" className="size-full">
          <g fill="#1d2f52">
            <rect x="10" y="30" width="44" height="98" />
            <rect x="60" y="12" width="40" height="116" />
            <rect x="108" y="40" width="34" height="88" />
            <rect x="150" y="22" width="40" height="106" />
          </g>
          <g fill="#ffd58a" opacity=".8">
            <rect x="16" y="42" width="5" height="7" /><rect x="28" y="60" width="5" height="7" /><rect x="40" y="42" width="5" height="7" />
            <rect x="68" y="28" width="5" height="7" /><rect x="82" y="50" width="5" height="7" /><rect x="68" y="72" width="5" height="7" />
            <rect x="116" y="56" width="5" height="7" /><rect x="128" y="76" width="5" height="7" />
            <rect x="158" y="38" width="5" height="7" /><rect x="172" y="58" width="5" height="7" />
          </g>
        </svg>
      </div>

      <div className="relative mt-32">
        <h4 className="mb-2.5 ml-1 text-[17px] font-bold leading-tight [text-shadow:0_1px_8px_rgba(0,0,0,.6)]">
          Sua imobiliária
          <br />
          mais completa
        </h4>
        <p className="mb-3 ml-1 text-[10px] text-ink-2">
          Tecnologia, agilidade e segurança para conectar pessoas aos seus novos lares.
        </p>
        <ButtonLink to="#" className="ml-1">
          Conheça mais
        </ButtonLink>
      </div>
    </Card>
  );
}
