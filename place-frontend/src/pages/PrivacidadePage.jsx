import { Link } from "react-router-dom";
import { CONTATO } from "@/components/site/SiteFooter";
import { usePageTitle } from "@/hooks/usePageTitle";
import { VERSAO_POLITICA } from "@/lib/consentimento";

// Texto-base da política de privacidade (LGPD, Lei 13.709/2018).
// Antes de ir para o domínio oficial, a Place deve revisar com o jurídico e preencher o encarregado (DPO).
const SECOES = [
  ["Quem somos", [
    "A Place Brokers Negócios Imobiliários (CRECI 18303-J), com escritório na R. Bruno Veloso, 333A, Boa Viagem, Recife/PE, é a controladora dos dados pessoais coletados neste site.",
  ]],
  ["Quais dados coletamos", [
    "Quando você preenche um formulário: nome, telefone (WhatsApp), e-mail e o empreendimento de interesse.",
    "Quando você navega: páginas e empreendimentos visitados, de forma agregada, para saber quais imóveis interessam mais. Não usamos cookies de publicidade.",
  ]],
  ["Para que usamos", [
    "Para um corretor da Place falar com você sobre o empreendimento que você escolheu, tirar dúvidas e agendar visitas ou reuniões.",
    "Para liberar o material completo dos empreendimentos (galeria, plantas e condições) depois do cadastro.",
    "Para mandar avisos de lançamentos com o seu perfil, só se você marcar essa opção. Você pode pedir para parar a qualquer momento.",
  ]],
  ["Base legal", [
    "Contato sobre o imóvel e avisos de lançamento: o seu consentimento, dado ao marcar a caixa do formulário.",
    "Segurança do site e prevenção de fraudes (por exemplo, bloqueio de robôs): legítimo interesse da Place.",
  ]],
  ["Com quem compartilhamos", [
    "Com o corretor e o gerente da Place responsáveis pelo seu atendimento.",
    "Com a construtora do empreendimento, só quando você avançar para proposta ou análise de crédito.",
    "Com os serviços que hospedam o site e o banco de dados, que só guardam os dados para a Place. Não vendemos nem alugamos seus dados.",
  ]],
  ["Por quanto tempo guardamos", [
    "Enquanto durar o atendimento e por até 2 anos depois do último contato, ou pelo prazo que a lei exigir em caso de compra.",
  ]],
  ["Seus direitos", [
    "Você pode pedir a qualquer momento: confirmação de que tratamos seus dados, acesso, correção, anonimização ou exclusão, portabilidade, informação sobre com quem compartilhamos e a revogação do consentimento (art. 18 da LGPD).",
    "Também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).",
  ]],
  ["Segurança", [
    "O acesso aos dados é restrito à equipe que precisa deles, com login, senha e registro de tentativas suspeitas. O site usa conexão segura (HTTPS).",
  ]],
];

export default function PrivacidadePage() {
  usePageTitle("Política de privacidade");
  return (
    <main className="pb-editorial-page mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold">LGPD</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Política de privacidade</h1>
      <p className="mt-3 text-[14px] text-ink-3">Versão de {VERSAO_POLITICA.split("-").reverse().join("/")}</p>

      <div className="mt-10 space-y-8">
        {SECOES.map(([titulo, paragrafos]) => (
          <section key={titulo}>
            <h2 className="text-lg font-semibold">{titulo}</h2>
            {paragrafos.map((p) => <p key={p} className="mt-2 text-[15px] leading-relaxed text-ink-2">{p}</p>)}
          </section>
        ))}
        <section>
          <h2 className="text-lg font-semibold">Como falar com a gente</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            Para exercer seus direitos ou tirar dúvidas sobre seus dados, escreva para{" "}
            <a href={`mailto:${CONTATO.email}`} className="text-gold hover:underline">{CONTATO.email}</a>{" "}
            ou fale pelo <Link to="/contato" className="text-gold hover:underline">contato</Link>. Respondemos em até 15 dias.
          </p>
        </section>
      </div>
    </main>
  );
}
