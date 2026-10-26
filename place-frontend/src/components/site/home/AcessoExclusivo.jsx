import { Icon } from "@/components/ui/Icon";
import { useAcessoExclusivo } from "@/hooks/useAcessoExclusivo";
import FormularioContato from "../FormularioContato";
import Reveal from "../Reveal";

const BENEFICIOS = [
  ["book", "Plantas e implantação", "Veja a distribuição de cada apartamento e do condomínio."],
  ["list", "Tabela do mês", "Valores e condições atualizados direto da construtora."],
  ["star", "Galeria completa", "Todas as perspectivas e fotos do decorado."],
  ["bell", "Avisos de lançamento", "Saiba antes quando abrir um empreendimento com o seu perfil."],
];

/** Faixa de captação: o visitante se cadastra para ver o material completo. */
export default function AcessoExclusivo({ opcoes }) {
  const liberado = useAcessoExclusivo();

  return (
    <section id="acesso-exclusivo" aria-labelledby="pb-d-exclusivo" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-20">
      <Reveal>
        <div className="pb-d-exclusivo relative overflow-hidden rounded-[28px] p-6 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-[#e9ad5a]/20 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <p className="pb-d-overline">
                <span className="inline-block h-[2px] w-7 bg-[#e9ad5a]" /> Área do comprador
              </p>
              <h2 id="pb-d-exclusivo" className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
                O material completo fica com quem <span className="text-gold-gradient">se cadastra.</span>
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-7 text-white/75">
                Cadastro rápido e gratuito. Um especialista da Place tira suas dúvidas e você acessa tudo que os portais não mostram.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {BENEFICIOS.map(([icone, titulo, texto]) => (
                  <li key={titulo} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9ad5a]/15 text-[#f3c47a]">
                      <Icon name={icone} className="size-5" />
                    </span>
                    <span>
                      <strong className="block text-[14px]">{titulo}</strong>
                      <span className="text-[12.5px] leading-5 text-white/65">{texto}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pb-d-exclusivo-form rounded-3xl bg-white p-5 text-[#0b203b] shadow-2xl sm:p-7">
              {liberado ? (
                <div className="space-y-3 py-6 text-center" role="status">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#0f8a5f]/12 text-[#0f8a5f]">
                    <Icon name="star" className="size-7" />
                  </span>
                  <h3 className="text-xl font-extrabold">Acesso liberado</h3>
                  <p className="text-sm text-[#516783]">
                    Abra qualquer empreendimento para ver galeria completa, plantas e condições. Um especialista vai falar com você em breve.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-extrabold">Liberar meu acesso</h3>
                  <p className="mb-4 mt-1 text-[13px] text-[#516783]">Leva menos de 1 minuto.</p>
                  <FormularioContato opcoes={opcoes} canal="home - acesso exclusivo" textoBotao="Quero ver o material completo" />
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
