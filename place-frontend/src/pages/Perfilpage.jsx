import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Meter } from "@/components/admin/dashboard/charts";
import { authService } from "@/services/authService";
import { alterarSenha, atualizarPerfil } from "@/services/session";

const CAMPO = "h-12 w-full rounded-xl border bg-card-2 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3";
const borda = (erro) => (erro ? "border-danger" : "border-line focus:border-gold");

function forca(s) {
  if (!s) return 0;
  let pontos = Math.min(s.length, 12) * 5; // até 60
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos += 15;
  if (/\d/.test(s)) pontos += 12;
  if (/[^A-Za-z0-9]/.test(s)) pontos += 13;
  return Math.min(pontos, 100);
}

function Campo({ rotulo, erro, children }) {
  return (
    <label className="block text-xs text-ink-2">
      {rotulo}
      <div className="mt-1.5">{children}</div>
      {erro && <span className="mt-1 block text-[11px] text-danger">{erro}</span>}
    </label>
  );
}

function CampoSenha({ rotulo, valor, onChange, erro, auto }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <Campo rotulo={rotulo} erro={erro}>
      <div className="relative">
        <input type={visivel ? "text" : "password"} value={valor} onChange={(e) => onChange(e.target.value)} autoComplete={auto} className={`${CAMPO} pr-24 ${borda(erro)}`} />
        <button type="button" onClick={() => setVisivel((v) => !v)} aria-label={visivel ? "Ocultar senha" : "Mostrar senha"} className="absolute right-1.5 top-1.5 h-9 rounded-lg px-3 text-[12px] text-ink-2 transition-colors hover:text-ink">
          {visivel ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </Campo>
  );
}

export default function PerfilPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [nome, setNome] = useState(user.name);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [senha, setSenha] = useState({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
  const [errosSenha, setErrosSenha] = useState({});
  const [trocando, setTrocando] = useState(false);
  const [msgSenha, setMsgSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const set = (c) => (v) => setSenha((s) => ({ ...s, [c]: v }));
  const pontos = forca(senha.novaSenha);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagem("");
    setErro("");
    try {
      await atualizarPerfil({ nome });
      setMensagem("Perfil atualizado.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha(e) {
    e.preventDefault();
    setTrocando(true);
    setMsgSenha("");
    setErroSenha("");
    setErrosSenha({});
    try {
      await alterarSenha(senha);
      setSenha({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
      setMsgSenha("Senha alterada. Use a nova senha no próximo login.");
    } catch (err) {
      setErrosSenha(err.fieldErrors ?? {});
      if (!Object.keys(err.fieldErrors ?? {}).length) setErroSenha(err.message);
    } finally {
      setTrocando(false);
    }
  }

  function sair() {
    authService.logout();
    navigate("/login", { replace: true });
  }

  const iniciais = (user.name ?? "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <header className="animate-fade-up flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gold-gradient text-xl font-semibold text-[#1a1408]">{iniciais}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{user.name}</h1>
          <p className="text-[13px] text-ink-2">{user.role}</p>
        </div>
      </header>

      <form onSubmit={salvar} style={{ animationDelay: "70ms" }} className="animate-fade-up space-y-4 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-[15px] font-semibold">Dados da conta</h2>
        <Campo rotulo="Nome"><input value={nome} onChange={(e) => setNome(e.target.value)} className={`${CAMPO} ${borda(false)}`} /></Campo>
        <Campo rotulo="E-mail"><input value={user.email ?? ""} disabled className={`${CAMPO} border-line text-ink-3`} /></Campo>
        {mensagem && <p role="status" className="text-xs text-ok">{mensagem}</p>}
        {erro && <p role="alert" className="text-xs text-danger">{erro}</p>}
        <button type="submit" disabled={salvando || !nome.trim()} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <form onSubmit={trocarSenha} noValidate style={{ animationDelay: "140ms" }} className="animate-fade-up space-y-4 rounded-2xl border border-line bg-card p-5">
        <div>
          <h2 className="text-[15px] font-semibold">Alterar senha</h2>
          <p className="text-[12px] text-ink-3">Mínimo de 8 caracteres. Misturar letras, números e símbolos deixa a senha mais forte.</p>
        </div>
        <CampoSenha rotulo="Senha atual" valor={senha.senhaAtual} onChange={set("senhaAtual")} erro={errosSenha.senhaAtual} auto="current-password" />
        <div>
          <CampoSenha rotulo="Nova senha" valor={senha.novaSenha} onChange={set("novaSenha")} erro={errosSenha.novaSenha} auto="new-password" />
          {senha.novaSenha && (
            <div className="mt-2 flex items-center gap-3">
              <Meter pct={pontos} className="flex-1" />
              <span className="w-12 text-right text-[11px] text-ink-3">{pontos < 45 ? "Fraca" : pontos < 75 ? "Boa" : "Forte"}</span>
            </div>
          )}
        </div>
        <CampoSenha rotulo="Confirmar nova senha" valor={senha.confirmarSenha} onChange={set("confirmarSenha")} erro={errosSenha.confirmarSenha} auto="new-password" />
        {msgSenha && <p role="status" className="text-xs text-ok">{msgSenha}</p>}
        {erroSenha && <p role="alert" className="text-xs text-danger">{erroSenha}</p>}
        <button type="submit" disabled={trocando} className="h-12 w-full rounded-xl border border-gold/50 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 disabled:opacity-60">
          {trocando ? "Alterando..." : "Alterar senha"}
        </button>
      </form>

      <button type="button" onClick={sair} style={{ animationDelay: "210ms" }}
        className="animate-fade-up flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-danger/40 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
        <Icon name="arrowRight" className="size-4" /> Sair da conta
      </button>
    </div>
  );
}