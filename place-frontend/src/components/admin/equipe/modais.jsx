import { useState } from "react";
import { criarDiretoria, criarGerente, criarTime, atualizarTime } from "@/services/admin/equipe";
import { CAMPO, Campo, Folha, SEDES } from "./ui";

const borda = (erros, c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");
const Botao = ({ enviando, children }) => (
  <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
    {enviando ? "Salvando..." : children}
  </button>
);

function useEnvio(acao, aoConcluir) {
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  async function enviar(e) {
    e.preventDefault();
    setErros({});
    setErroGeral("");
    setEnviando(true);
    try {
      await aoConcluir(await acao());
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }
  return { erros, erroGeral, enviando, enviar };
}
const Erro = ({ texto }) => (texto ? <p role="alert" className="text-xs text-danger">{texto}</p> : null);

export function ModalEquipe({ time, diretorias, gerentes, onClose, onSalvo }) {
  const [f, setF] = useState({ nome: time?.nome ?? "", sede: time?.sede ?? "", diretoriaId: time?.diretoriaId ?? "", gerenteId: time?.gerenteId ?? "" });
  const set = (c) => (e) => setF((s) => ({ ...s, [c]: e.target.value }));
  const { erros, erroGeral, enviando, enviar } = useEnvio(
    () => (time ? atualizarTime(time.id, f) : criarTime(f)),
    onSalvo,
  );
  return (
    <Folha titulo={time ? "Editar equipe" : "Nova equipe"} onClose={onClose}>
      <form onSubmit={enviar} noValidate className="space-y-3.5">
        <Campo rotulo="Nome da equipe" erro={erros.nome}><input value={f.nome} onChange={set("nome")} className={`${CAMPO} ${borda(erros, "nome")}`} /></Campo>
        <Campo rotulo="Sede" erro={erros.sede}>
          <select value={f.sede} onChange={set("sede")} className={`${CAMPO} ${borda(erros, "sede")}`}>
            <option value="">Sem sede definida</option>
            {SEDES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Diretoria" erro={erros.diretoriaId}>
          <select value={f.diretoriaId} onChange={set("diretoriaId")} className={`${CAMPO} ${borda(erros, "diretoriaId")}`}>
            <option value="">Sem diretoria</option>
            {diretorias.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Gerente" erro={erros.gerenteId}>
          <select value={f.gerenteId} onChange={set("gerenteId")} className={`${CAMPO} ${borda(erros, "gerenteId")}`}>
            <option value="">Sem gerente</option>
            {gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>
        </Campo>
        <Erro texto={erroGeral && !Object.keys(erros).length ? erroGeral : ""} />
        <Botao enviando={enviando}>{time ? "Salvar alterações" : "Criar equipe"}</Botao>
      </form>
    </Folha>
  );
}

export function ModalDiretoria({ onClose, onSalvo }) {
  const [nome, setNome] = useState("");
  const { erros, erroGeral, enviando, enviar } = useEnvio(() => criarDiretoria({ nome }), onSalvo);
  return (
    <Folha titulo="Nova diretoria" onClose={onClose}>
      <form onSubmit={enviar} noValidate className="space-y-3.5">
        <Campo rotulo="Nome da diretoria" erro={erros.nome}><input value={nome} onChange={(e) => setNome(e.target.value)} className={`${CAMPO} ${borda(erros, "nome")}`} /></Campo>
        <Erro texto={erroGeral && !Object.keys(erros).length ? erroGeral : ""} />
        <Botao enviando={enviando}>Criar diretoria</Botao>
      </form>
    </Folha>
  );
}

export function ModalGerente({ onClose, onSalvo }) {
  const [f, setF] = useState({ nome: "", email: "", password: "" });
  const set = (c) => (e) => setF((s) => ({ ...s, [c]: e.target.value }));
  const { erros, erroGeral, enviando, enviar } = useEnvio(() => criarGerente(f), onSalvo);
  return (
    <Folha titulo="Novo gerente" onClose={onClose}>
      <form onSubmit={enviar} noValidate className="space-y-3.5">
        <p className="text-[13px] text-ink-2">O gerente já entra aprovado e só faz login. Combine a senha temporária com ele por fora.</p>
        <Campo rotulo="Nome" erro={erros.nome}><input value={f.nome} onChange={set("nome")} autoComplete="off" className={`${CAMPO} ${borda(erros, "nome")}`} /></Campo>
        <Campo rotulo="E-mail" erro={erros.email}><input type="email" value={f.email} onChange={set("email")} autoComplete="off" className={`${CAMPO} ${borda(erros, "email")}`} /></Campo>
        <Campo rotulo="Senha temporária" erro={erros.password}><input type="text" value={f.password} onChange={set("password")} autoComplete="new-password" className={`${CAMPO} ${borda(erros, "password")}`} /></Campo>
        <Erro texto={erroGeral && !Object.keys(erros).length ? erroGeral : ""} />
        <Botao enviando={enviando}>Criar gerente</Botao>
      </form>
    </Folha>
  );
}