import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { registrarEvento } from "@/services/eventos";
import { enviarLead } from "@/services/leadsPublico";
import { aceitaResolverOnline, liberarAcesso } from "@/lib/catalogoHome";
import { normalizarTelefone } from "@/lib/telefone";
import { LIMITE_DETALHES } from "@/lib/prontosEUsados";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Digitou/colou com 0, 0 + operadora ou +55? Tira antes de aplicar a máscara (DDD nunca começa com 0).
const digitos = (v = "") => {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.length >= 13 ? d.slice(3) : d.slice(1);
  else if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  return d.slice(0, 11);
};
export function mascarar(v) {
  const d = digitos(v);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
export const CAMPO = "h-12 w-full rounded-xl border bg-card-2 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 scheme-dark";
export const CAMPO_TEXTO = CAMPO.replace("h-12 ", "");
export const borda = (erro) => (erro ? "border-danger" : "border-line focus:border-gold");

export function Campo({ rotulo, erro, children }) {
  return (
    <label className="block text-xs text-ink-2">
      {rotulo}
      <div className="mt-1.5">{children}</div>
      {erro && <span className="mt-1 block text-[11px] text-danger">{erro}</span>}
    </label>
  );
}

/**
 * @param empreendimento
 * @param opcoes
 * @param canal
 * @param aoVoltar
 */
export default function FormularioContato({ empreendimento = null, opcoes = [], autoFoco = false, aoVoltar, aoEnviar, canal = "", textoBotao = "Quero falar com um especialista" }) {
  const [f, setF] = useState({ escolha: "", detalhes: "", nome: "", email: "", telefone: "", website: "", aceite: false, novidades: false, preferencia: "conversar" });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const primeiro = useRef(null);
  useEffect(() => {
    if (autoFoco) primeiro.current?.focus();
  }, [autoFoco]);

  const set = (campo) => (e) => setF((s) => ({ ...s, [campo]: campo === "telefone" ? mascarar(e.target.value) : e.target.value }));
  const escolhido = empreendimento ?? opcoes.find((o) => String(o.id) === f.escolha) ?? null;
  // Pedido de pronto/usado fora do catálogo: o cliente conta o que procura.
  const pedirDetalhes = Boolean(empreendimento?.pedirDetalhes);
  // Dados completos (segmento, etapa) do imóvel escolhido, para decidir se mostra "resolver online".
  const doCatalogo = escolhido ? opcoes.find((o) => String(o.id) === String(escolhido.id)) : null;
  const mostrarOnline = aceitaResolverOnline(pedirDetalhes ? empreendimento : escolhido && { segmento: doCatalogo?.segmento ?? escolhido.segmento, tag: doCatalogo?.tag ?? escolhido.tag });
  const preferencia = mostrarOnline ? f.preferencia : "conversar";

  async function enviar(ev) {
    ev.preventDefault();
    const e = {};
    if (!empreendimento && !f.escolha) e.escolha = "Escolha o empreendimento de interesse.";
    if (!f.nome.trim()) e.nome = "Informe seu nome.";
    const fone = normalizarTelefone(f.telefone);
    if (!fone.ok) e.telefone = fone.erro;
    if (!EMAIL_REGEX.test(f.email.trim())) e.email = "Informe um e-mail válido.";
    if (!f.aceite) e.aceite = "Para continuar, autorize o contato.";
    setErros(e);
    setErroGeral("");
    if (Object.keys(e).length) return;

    setEnviando(true);
    try {
      await enviarLead({
        nome: f.nome.trim(),
        email: f.email.trim(),
        telefone: fone.digitos,
        empreendimento: escolhido ? { id: escolhido.id, title: escolhido.title } : null,
        website: f.website,
        canal,
        consentimento: { novidades: f.novidades },
        preferencia,
        detalhes: pedirDetalhes ? f.detalhes : "",
      });
      registrarEvento({ tipo: "contato" });
      liberarAcesso();
      setEnviado(true);
      aoEnviar?.();
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="animate-fade-up space-y-4 py-2 text-center" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" strokeDasharray="1" style={{ animation: "check-draw 0.6s 0.15s ease-out both" }} />
          </svg>
        </span>
        <p className="text-sm text-ink-2">
          Recebemos as suas informações. <strong className="text-ink">Um especialista da Place Brokers entrará em contato</strong> com você em breve.
        </p>
        {aoVoltar && (
          <button type="button" onClick={aoVoltar} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110">
            Voltar ao site
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-3.5">
      {!empreendimento && (
        <Campo rotulo="Empreendimento de interesse" erro={erros.escolha}>
          <select ref={primeiro} value={f.escolha} onChange={set("escolha")} className={`${CAMPO} ${borda(erros.escolha)}`}>
            <option value="" disabled>Escolha pelo nome...</option>
            {opcoes.map((o) => <option key={o.id} value={o.id}>{o.title} — {o.city}</option>)}
            <option value="geral">Ainda não decidi</option>
          </select>
        </Campo>
      )}
      {pedirDetalhes && (
        <Campo rotulo="O que você procura? (opcional)">
          <textarea ref={primeiro} value={f.detalhes} onChange={set("detalhes")} maxLength={LIMITE_DETALHES} rows={3}
            placeholder="Ex.: 3 quartos em Boa Viagem, até R$ 700 mil, pronto para morar"
            className={`${CAMPO_TEXTO} ${borda()} resize-none py-3 leading-relaxed`} />
        </Campo>
      )}
      <Campo rotulo="Nome" erro={erros.nome}>
        <input ref={empreendimento && !pedirDetalhes ? primeiro : undefined} value={f.nome} onChange={set("nome")} autoComplete="name" className={`${CAMPO} ${borda(erros.nome)}`} />
      </Campo>
      <Campo rotulo="WhatsApp (com DDD)" erro={erros.telefone}>
        <input value={f.telefone} onChange={set("telefone")} inputMode="tel" autoComplete="tel" placeholder="(81) 99999-9999" className={`${CAMPO} ${borda(erros.telefone)}`} />
      </Campo>
      <Campo rotulo="E-mail" erro={erros.email}>
        <input type="email" value={f.email} onChange={set("email")} autoComplete="email" className={`${CAMPO} ${borda(erros.email)}`} />
      </Campo>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Não preencha este campo
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
        </label>
      </div>

      {mostrarOnline && (
      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-xs text-ink-2">Como prefere seguir?</legend>
        <div className="grid grid-cols-2 gap-2">
          {[["conversar", "Conversar com um especialista"], ["online", "Receber os valores e resolver online"]].map(([valor, rotulo]) => (
            <label key={valor} className={`flex min-h-12 cursor-pointer items-center rounded-xl border px-3 py-2 text-[12px] leading-snug transition-colors ${f.preferencia === valor ? "border-gold bg-gold/10 text-ink" : "border-line text-ink-2"}`}>
              <input type="radio" name="preferencia" value={valor} checked={f.preferencia === valor} onChange={() => setF((s) => ({ ...s, preferencia: valor }))} className="sr-only" />
              {rotulo}
            </label>
          ))}
        </div>
      </fieldset>
      )}

      <div className="space-y-2 pt-1">
        <label className="flex items-start gap-2.5 text-[12px] leading-snug text-ink-2">
          <input type="checkbox" checked={f.aceite} onChange={(e) => setF((s) => ({ ...s, aceite: e.target.checked }))}
            aria-invalid={Boolean(erros.aceite)} className="mt-0.5 size-4.5 shrink-0 accent-[#c9a54c]" />
          <span>
            Autorizo a Place Brokers a usar meus dados para falar comigo sobre imóveis, conforme a{" "}
            <Link to="/privacidade" target="_blank" className="text-gold underline">política de privacidade</Link>.
          </span>
        </label>
        {erros.aceite && <span className="block text-[11px] text-danger">{erros.aceite}</span>}
        <label className="flex items-start gap-2.5 text-[12px] leading-snug text-ink-2">
          <input type="checkbox" checked={f.novidades} onChange={(e) => setF((s) => ({ ...s, novidades: e.target.checked }))}
            className="mt-0.5 size-4.5 shrink-0 accent-[#c9a54c]" />
          <span>Quero receber avisos de lançamentos com o meu perfil (opcional).</span>
        </label>
      </div>

      {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
      <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
        {enviando ? "Enviando..." : textoBotao}
      </button>
      <p className="text-center text-[11px] text-ink-3">Você pode pedir para apagar seus dados quando quiser.</p>
    </form>
  );
}
