import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Campo, CAMPO, CAMPO_TEXTO, borda, mascarar } from "@/components/site/FormularioContato";
import Reveal from "@/components/site/Reveal";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { normalizarTelefone } from "@/lib/telefone";
import {
  AREAS, LIMITE_CURRICULO, NOME_DA_AREA, UNIDADES, detalhesDaVaga, enviarCandidatura, itensDosRequisitos, listarVagasAbertas, ordenarVagas,
} from "@/services/trabalheConosco";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_REGEX = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/i;
const BANCO = "";

const MOTIVOS = [
  ["building", "Lançamentos de várias construtoras", "MCMV, médio e alto padrão e litoral no mesmo catálogo."],
  ["refresh", "Leads todos os dias", "Os contatos dos anúncios chegam pela roleta, na ordem de chegada da equipe."],
  ["mapPin", "Recife, Caruaru e Paulista", "Escolha a unidade mais perto de você."],
];

const REQUISITOS_VISIVEIS = 3;

function Chips({ vaga }) {
  const chips = detalhesDaVaga(vaga);
  if (!chips.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Detalhes da vaga">
      {chips.map((c) => (
        <li key={c.texto} className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.urgente ? "bg-gold/15 text-gold" : "bg-white/8 text-ink-2"}`}>{c.texto}</li>
      ))}
    </ul>
  );
}

function Requisitos({ texto }) {
  const [todos, setTodos] = useState(false);
  const itens = itensDosRequisitos(texto);
  if (!itens.length) return null;
  const mostrados = todos ? itens : itens.slice(0, REQUISITOS_VISIVEIS);
  return (
    <div className="mt-3">
      <p className="text-[13px] font-medium text-ink">Requisitos</p>
      <ul className="mt-1 space-y-1 text-[13px] leading-relaxed text-ink-2">
        {mostrados.map((r) => (
          <li key={r} className="flex gap-2"><span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-gold/70" />{r}</li>
        ))}
      </ul>
      {itens.length > REQUISITOS_VISIVEIS && (
        <button type="button" onClick={() => setTodos((v) => !v)} aria-expanded={todos} className="inline-flex min-h-11 items-center text-[13px] text-gold hover:underline">
          {todos ? "Ver menos" : `Ver todos (${itens.length})`}
        </button>
      )}
    </div>
  );
}

const vazio = { vagaId: BANCO, area: "", unidade: "", nome: "", telefone: "", email: "", creci: "", linkedin: "", mensagem: "", website: "", aceite: false };

export default function TrabalheConoscoPage() {
  usePageTitle("Trabalhe conosco");
  const [vagas, setVagas] = useState([]);
  const [f, setF] = useState(vazio);
  const [arquivo, setArquivo] = useState(null);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const formulario = useRef(null);

  useEffect(() => {
    listarVagasAbertas().then((v) => setVagas(ordenarVagas(v ?? []))).catch(() => setVagas([]));
  }, []);

  const set = (campo) => (e) => setF((s) => ({ ...s, [campo]: campo === "telefone" ? mascarar(e.target.value) : e.target.value }));
  const vaga = vagas.find((v) => v.id === f.vagaId) ?? null;
  const area = vaga ? vaga.area : f.area;

  function escolherVaga(v) {
    setF((s) => ({ ...s, vagaId: v?.id ?? BANCO, area: v?.area ?? s.area, unidade: v?.unidade ?? s.unidade }));
    formulario.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  function escolherArquivo(e) {
    const a = e.target.files?.[0] ?? null;
    if (a && (a.type !== "application/pdf" || a.size > LIMITE_CURRICULO)) {
      setErros((s) => ({ ...s, curriculo: "Envie o currículo em PDF de até 5 MB." }));
      setArquivo(null);
      e.target.value = "";
      return;
    }
    setErros(({ curriculo, ...resto }) => resto);
    setArquivo(a);
  }

  async function enviar(ev) {
    ev.preventDefault();
    const e = {};
    if (!area) e.area = "Escolha a área de interesse.";
    if (f.nome.trim().length < 2) e.nome = "Informe seu nome.";
    const fone = normalizarTelefone(f.telefone);
    if (!fone.ok) e.telefone = fone.erro;
    if (!EMAIL_REGEX.test(f.email.trim())) e.email = "Informe um e-mail válido.";
    if (f.linkedin.trim() && !LINKEDIN_REGEX.test(f.linkedin.trim())) e.linkedin = "Cole o link completo (https://linkedin.com/in/...).";
    if (!f.aceite) e.aceite = "Para continuar, autorize o uso dos seus dados.";
    setErros(e);
    setErroGeral("");
    if (Object.keys(e).length) return;

    setEnviando(true);
    try {
      await enviarCandidatura({
        vagaId: f.vagaId,
        area,
        unidade: f.unidade,
        nome: f.nome.trim(),
        telefone: fone.digitos,
        email: f.email.trim(),
        creci: area === "corretor" ? f.creci.trim() : "",
        linkedin: f.linkedin.trim(),
        mensagem: f.mensagem.trim(),
        website: f.website,
        aceite: true,
      }, arquivo);
      setEnviado(true);
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pb-editorial-page mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold">Trabalhe conosco</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">Venda imóveis com a Place Brokers</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          Estamos sempre conhecendo corretores e profissionais para as nossas unidades. Se não houver uma vaga aberta para o seu perfil,
          o seu contato fica no banco de talentos e o RH chama quando surgir a oportunidade.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0 space-y-8">
          <ul className="space-y-3">
            {MOTIVOS.map(([icone, titulo, texto], i) => (
              <Reveal key={titulo} atraso={i * 80}>
                <li className="flex items-start gap-4 rounded-2xl border border-line bg-card p-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold"><Icon name={icone} className="size-6" /></span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium">{titulo}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">{texto}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>

          <section aria-labelledby="vagas-abertas">
            <h2 id="vagas-abertas" className="text-lg font-semibold">Vagas abertas</h2>
            {vagas.length === 0 ? (
              <p className="mt-2 text-[14px] text-ink-2">Nenhuma vaga específica no momento. Envie seus dados pelo banco de talentos.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {vagas.map((v) => (
                  <li key={v.id} className={`rounded-2xl border bg-card p-4 transition-colors ${f.vagaId === v.id ? "border-gold" : "border-line"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{v.titulo}</p>
                        <p className="text-[12px] text-ink-3">{NOME_DA_AREA[v.area]}{v.unidade ? ` · ${v.unidade}` : ""}</p>
                      </div>
                      <button type="button" onClick={() => escolherVaga(v)}
                        className="h-11 shrink-0 rounded-full border border-gold/60 px-4 text-[13px] font-medium text-gold transition-colors hover:bg-gold/10">
                        {f.vagaId === v.id ? "Selecionada" : "Candidatar-se"}
                      </button>
                    </div>
                    <Chips vaga={v} />
                    {v.descricao && <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-ink-2">{v.descricao}</p>}
                    <Requisitos texto={v.requisitos} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <Reveal atraso={120} className="min-w-0">
          <div ref={formulario} className="scroll-mt-24 rounded-3xl border border-gold/40 bg-card p-6 shadow-xl shadow-black/30 sm:p-8">
            {enviado ? (
              <div className="animate-fade-up space-y-3 py-2 text-center" role="status">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <h2 className="text-xl font-semibold">Candidatura recebida</h2>
                <p className="text-sm text-ink-2">O RH da Place Brokers vai analisar o seu perfil e entra em contato pelo WhatsApp ou e-mail.</p>
                <Link to="/" className="mt-2 inline-flex h-12 items-center justify-center rounded-xl border border-line px-5 text-sm transition-colors hover:border-gold">Voltar ao site</Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">Envie seus dados</h2>
                <p className="mb-5 mt-1 text-[13px] text-ink-2">Leva menos de 2 minutos. O currículo é opcional.</p>
                <form onSubmit={enviar} noValidate className="space-y-3.5">
                  <Campo rotulo="Vaga" erro={erros.vagaId}>
                    <select value={f.vagaId} onChange={(e) => escolherVaga(vagas.find((v) => v.id === e.target.value) ?? null)} className={`${CAMPO} ${borda(erros.vagaId)}`}>
                      <option value={BANCO}>Banco de talentos</option>
                      {vagas.map((v) => <option key={v.id} value={v.id}>{v.titulo}</option>)}
                    </select>
                  </Campo>
                  {vaga && (
                    <p className="-mt-2 text-xs text-ink-3">
                      {[NOME_DA_AREA[vaga.area], vaga.unidade, ...detalhesDaVaga(vaga).map((c) => c.texto)].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Campo rotulo="Área de interesse" erro={erros.area}>
                      <select value={area} onChange={set("area")} disabled={Boolean(vaga)} className={`${CAMPO} ${borda(erros.area)} disabled:opacity-70`}>
                        <option value="" disabled>Escolha...</option>
                        {AREAS.map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
                      </select>
                    </Campo>
                    <Campo rotulo="Unidade" erro={erros.unidade}>
                      <select value={f.unidade} onChange={set("unidade")} className={`${CAMPO} ${borda(erros.unidade)}`}>
                        <option value="">Qualquer unidade</option>
                        {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </Campo>
                  </div>
                  <Campo rotulo="Nome completo" erro={erros.nome}>
                    <input value={f.nome} onChange={set("nome")} autoComplete="name" className={`${CAMPO} ${borda(erros.nome)}`} />
                  </Campo>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Campo rotulo="WhatsApp (com DDD)" erro={erros.telefone}>
                      <input value={f.telefone} onChange={set("telefone")} inputMode="tel" autoComplete="tel" placeholder="(81) 99999-9999" className={`${CAMPO} ${borda(erros.telefone)}`} />
                    </Campo>
                    <Campo rotulo="E-mail" erro={erros.email}>
                      <input type="email" value={f.email} onChange={set("email")} autoComplete="email" className={`${CAMPO} ${borda(erros.email)}`} />
                    </Campo>
                  </div>
                  {area === "corretor" && (
                    <Campo rotulo="CRECI (se já tiver)" erro={erros.creci}>
                      <input value={f.creci} onChange={set("creci")} maxLength={30} placeholder="Ex.: 12345-F" className={`${CAMPO} ${borda(erros.creci)}`} />
                    </Campo>
                  )}
                  <Campo rotulo="LinkedIn (opcional)" erro={erros.linkedin}>
                    <input type="url" value={f.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/seu-perfil" className={`${CAMPO} ${borda(erros.linkedin)}`} />
                  </Campo>
                  <Campo rotulo="Currículo em PDF (opcional, até 5 MB)" erro={erros.curriculo}>
                    <input type="file" accept="application/pdf" onChange={escolherArquivo}
                      className={`${CAMPO} ${borda(erros.curriculo)} py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/15 file:px-3 file:py-1.5 file:text-[12px] file:text-gold`} />
                  </Campo>
                  <Campo rotulo="Conte um pouco sobre você (opcional)" erro={erros.mensagem}>
                    <textarea value={f.mensagem} onChange={set("mensagem")} maxLength={1500} rows={3}
                      placeholder="Experiência com vendas, disponibilidade, se já trabalhou com lançamentos..."
                      className={`${CAMPO_TEXTO} ${borda(erros.mensagem)} resize-none py-3 leading-relaxed`} />
                  </Campo>

                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>
                      Não preencha este campo
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
                    </label>
                  </div>

                  <label className="flex items-start gap-2.5 pt-1 text-[12px] leading-snug text-ink-2">
                    <input type="checkbox" checked={f.aceite} onChange={(e) => setF((s) => ({ ...s, aceite: e.target.checked }))}
                      aria-invalid={Boolean(erros.aceite)} className="mt-0.5 size-4.5 shrink-0 accent-[#c9a54c]" />
                    <span>
                      Autorizo a Place Brokers a guardar meus dados e meu currículo para processos seletivos, conforme a{" "}
                      <Link to="/privacidade" target="_blank" className="-my-3.5 inline-block py-3.5 text-gold underline">política de privacidade</Link>.
                    </span>
                  </label>
                  {erros.aceite && <span className="block text-xs text-danger">{erros.aceite}</span>}

                  {erroGeral && !Object.keys(erros).length && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
                  <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                    {enviando ? "Enviando..." : "Enviar candidatura"}
                  </button>
                  <p className="text-center text-xs text-ink-3">Você pode pedir para apagar seus dados quando quiser.</p>
                </form>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
