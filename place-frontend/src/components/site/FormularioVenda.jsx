import { useState } from "react";
import { Link } from "react-router-dom";
import { registrarEvento } from "@/services/eventos";
import { enviarLead } from "@/services/leadsPublico";
import { normalizarTelefone } from "@/lib/telefone";
import { CANAL_VENDA, LIMITE_OBSERVACOES, SITUACOES_IMOVEL, TIPOS_IMOVEL, VENDER_IMOVEL, linhaDoImovel } from "@/lib/vendaImovel";
import { CAMPO, CAMPO_TEXTO, Campo, borda, mascarar } from "./FormularioContato";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VAZIO = { tipo: "", local: "", quartos: "", area: "", valor: "", situacao: "", observacoes: "", nome: "", telefone: "", email: "", website: "", aceite: false };

/** Formulário de quem quer vender o imóvel com a Place: vira lead de captação. */
export default function FormularioVenda({ canal = CANAL_VENDA }) {
  const [f, setF] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const set = (campo) => (e) => setF((s) => ({ ...s, [campo]: campo === "telefone" ? mascarar(e.target.value) : e.target.value }));

  async function enviar(ev) {
    ev.preventDefault();
    const e = {};
    if (!f.tipo) e.tipo = "Escolha o tipo do imóvel.";
    if (!f.local.trim()) e.local = "Informe o bairro e a cidade.";
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
        empreendimento: { id: VENDER_IMOVEL.id, title: VENDER_IMOVEL.title },
        website: f.website,
        canal,
        consentimento: { novidades: false },
        imovel: linhaDoImovel(f),
      });
      registrarEvento({ tipo: "contato" });
      setEnviado(true);
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="animate-fade-up space-y-3 py-6 text-center" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" strokeDasharray="1" style={{ animation: "check-draw 0.6s 0.15s ease-out both" }} />
          </svg>
        </span>
        <p className="text-sm text-ink-2">
          Recebemos os dados do seu imóvel. <strong className="text-ink">Um corretor da Place liga para combinar a avaliação</strong>, sem compromisso.
        </p>
        <button type="button" onClick={() => { setF(VAZIO); setEnviado(false); }} className="min-h-11 text-[13px] font-semibold text-gold underline-offset-4 hover:underline">
          Cadastrar outro imóvel
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Campo rotulo="Tipo do imóvel" erro={erros.tipo}>
          <select value={f.tipo} onChange={set("tipo")} className={`${CAMPO} ${borda(erros.tipo)}`}>
            <option value="" disabled>Escolha...</option>
            {TIPOS_IMOVEL.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Bairro e cidade" erro={erros.local}>
          <input value={f.local} onChange={set("local")} maxLength={80} placeholder="Ex.: Boa Viagem, Recife" className={`${CAMPO} ${borda(erros.local)}`} />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        <Campo rotulo="Quartos">
          <input value={f.quartos} onChange={set("quartos")} inputMode="numeric" maxLength={2} placeholder="3" className={`${CAMPO} ${borda()}`} />
        </Campo>
        <Campo rotulo="Área (m²)">
          <input value={f.area} onChange={set("area")} inputMode="decimal" maxLength={6} placeholder="90" className={`${CAMPO} ${borda()}`} />
        </Campo>
        <Campo rotulo="Situação">
          <select value={f.situacao} onChange={set("situacao")} className={`${CAMPO} ${borda()} col-span-2 sm:col-span-1`}>
            <option value="">Não sei</option>
            {SITUACOES_IMOVEL.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Campo>
      </div>
      <Campo rotulo="Quanto quer pelo imóvel? (opcional)">
        <input value={f.valor} onChange={set("valor")} maxLength={40} placeholder="Ex.: R$ 750 mil" className={`${CAMPO} ${borda()}`} />
      </Campo>
      <Campo rotulo="Algo mais sobre o imóvel? (opcional)">
        <textarea value={f.observacoes} onChange={set("observacoes")} maxLength={LIMITE_OBSERVACOES} rows={3}
          placeholder="Ex.: andar alto, nascente, 2 vagas, aceita permuta"
          className={`${CAMPO_TEXTO} ${borda()} resize-none py-3 leading-relaxed`} />
      </Campo>

      <div className="grid gap-3.5 border-t border-line-soft pt-3.5 sm:grid-cols-2">
        <Campo rotulo="Seu nome" erro={erros.nome}>
          <input value={f.nome} onChange={set("nome")} autoComplete="name" className={`${CAMPO} ${borda(erros.nome)}`} />
        </Campo>
        <Campo rotulo="WhatsApp (com DDD)" erro={erros.telefone}>
          <input value={f.telefone} onChange={set("telefone")} inputMode="tel" autoComplete="tel" placeholder="(81) 99999-9999" className={`${CAMPO} ${borda(erros.telefone)}`} />
        </Campo>
      </div>
      <Campo rotulo="E-mail" erro={erros.email}>
        <input type="email" value={f.email} onChange={set("email")} autoComplete="email" className={`${CAMPO} ${borda(erros.email)}`} />
      </Campo>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Não preencha este campo
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
        </label>
      </div>

      <label className="flex items-start gap-2.5 text-[12px] leading-snug text-ink-2">
        <input type="checkbox" checked={f.aceite} onChange={(e) => setF((s) => ({ ...s, aceite: e.target.checked }))}
          aria-invalid={Boolean(erros.aceite)} className="mt-0.5 size-4.5 shrink-0 accent-[#c9a54c]" />
        <span>
          Autorizo a Place Brokers a usar meus dados para falar comigo sobre a venda do imóvel, conforme a{" "}
          <Link to="/privacidade" target="_blank" className="text-gold underline">política de privacidade</Link>.
        </span>
      </label>
      {erros.aceite && <span className="block text-[11px] text-danger">{erros.aceite}</span>}

      {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
      <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
        {enviando ? "Enviando..." : "Quero uma avaliação do meu imóvel"}
      </button>
      <p className="text-center text-[11px] text-ink-3">Sem custo e sem compromisso. A Place só anuncia depois de combinar tudo com você.</p>
    </form>
  );
}
