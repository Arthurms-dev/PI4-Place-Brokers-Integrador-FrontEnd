import { useState } from "react";
import { Avatar, CAMPO, Selo, Vazio } from "./ui";

// Cargos internos que o admin cria (sem cadastro público) e o que cada um enxerga.
export const CARGOS_INTERNOS = [
  ["gerente", "Gerente", "Leads, agenda, focos e vendas da própria equipe."],
  ["diretor", "Diretor", "VGV, dashboard e vendas da própria diretoria. Só leitura."],
  ["recepcao", "Recepção", "Marca a chegada e roda a roleta do dia. Não vê mais nada."],
  ["cadastro", "Cadastro", "Cadastra empreendimentos, fotos, books e tabelas."],
  ["rh", "RH", "Candidaturas do Trabalhe conosco e vagas."],
  ["viabilizador", "Viabilizador", "Books, tabelas e disponibilidade dos produtos da própria construtora."],
];
export const NOME_DO_CARGO = Object.fromEntries(CARGOS_INTERNOS.map(([v, r]) => [v, r]));

function Linha({ m, diretorias, onMudar }) {
  const [salvando, setSalvando] = useState(false);
  async function aplicar(mudancas) {
    setSalvando(true);
    try {
      await onMudar(m.id, mudancas);
    } catch {
      // A página mostra o erro.
    } finally {
      setSalvando(false);
    }
  }
  return (
    <li className="space-y-3 rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar nome={m.nome} src={m.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{m.nome}</p>
          <p className="truncate text-[12px] text-ink-3">{m.email}</p>
        </div>
        <Selo tom="ouro">{NOME_DO_CARGO[m.cargo] ?? m.cargo}</Selo>
        {!m.ativo && <Selo tom="perigo">Inativo</Selo>}
      </div>
      <div className={`grid gap-2 ${m.cargo === "diretor" ? "sm:grid-cols-[1fr_auto]" : ""}`}>
        {m.cargo === "diretor" && (
          <label className="block text-xs text-ink-2">
            Diretoria
            <select value={m.diretoria_id ?? ""} disabled={salvando} onChange={(e) => e.target.value && aplicar({ diretoriaId: e.target.value })}
              className={`${CAMPO} mt-1.5 ${m.diretoria_id ? "border-line" : "border-danger"} focus:border-gold`}>
              <option value="" disabled>Escolha a diretoria</option>
              {diretorias.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </label>
        )}
        <button type="button" disabled={salvando} onClick={() => aplicar({ ativo: !m.ativo })}
          className={`h-12 self-end rounded-xl border px-4 text-sm transition-colors disabled:opacity-50 ${m.ativo ? "border-line text-ink-2 hover:border-danger/50 hover:text-danger" : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"}`}>
          {m.ativo ? "Desativar acesso" : "Reativar acesso"}
        </button>
      </div>
    </li>
  );
}

export default function AcessosInternosTab({ membros, diretorias, onMudar, onNovo }) {
  // Viabilizadores têm aba própria (com a construtora); aqui ficam os demais cargos internos.
  const internos = membros.filter((m) => NOME_DO_CARGO[m.cargo] && m.cargo !== "viabilizador");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <ul className="grid gap-1 text-[12px] text-ink-3 sm:grid-cols-2">
          {CARGOS_INTERNOS.map(([v, rotulo, faz]) => <li key={v}><b className="font-medium text-ink-2">{rotulo}:</b> {faz}</li>)}
        </ul>
        <button type="button" onClick={onNovo} className="inline-flex h-11 shrink-0 items-center rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110">
          Novo acesso
        </button>
      </div>
      {internos.length === 0 ? (
        <Vazio>Nenhum acesso interno criado. Use "Novo acesso" para criar o login do RH, da recepção, de um diretor, do cadastro ou de um viabilizador.</Vazio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {internos.map((m) => <Linha key={m.id} m={m} diretorias={diretorias} onMudar={onMudar} />)}
        </ul>
      )}
    </div>
  );
}
