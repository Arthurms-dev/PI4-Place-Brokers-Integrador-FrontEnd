import { useMemo } from "react";
import { Selo, Vazio } from "@/components/admin/equipe/ui";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { linkWhatsApp } from "@/lib/atendimento";
import { useDadosDiretoria } from "./useDadosDiretoria";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Ranking({ titulo, itens }) {
  const max = Math.max(...itens.map((i) => i.vgv), 1);
  return (
    <section className="animate-fade-up rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-4 text-[15px] font-semibold">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="text-[13px] text-ink-3">Nenhuma venda confirmada ainda.</p>
      ) : (
        <ol className="space-y-3">
          {itens.map((i, n) => (
            <li key={i.id} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate"><span className="mr-2 text-ink-3">{n + 1}</span>{i.nome}</span>
                <span className="shrink-0 font-semibold text-gold">{brl(i.vgv)} <span className="font-normal text-ink-3">· {i.qtd} {i.qtd === 1 ? "venda" : "vendas"}</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-gold" style={{ width: `${(i.vgv / max) * 100}%` }} /></div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Só leitura: equipes, gerentes e ranking de VGV confirmado da diretoria do diretor. */
export default function MinhaDiretoriaPage() {
  usePageTitle("Minha diretoria");
  const { diretoria, equipes, membros, vendas, carregando, erro } = useDadosDiretoria();

  const { porEquipe, porCorretor } = useMemo(() => {
    const confirmadas = vendas.filter((v) => v.status === "confirmada");
    const equipeDe = new Map(membros.map((m) => [m.id, m.equipeId]));
    const somar = (chave, nome) => {
      const m = new Map();
      for (const v of confirmadas) {
        const id = chave(v);
        if (!id) continue;
        const atual = m.get(id) ?? { id, nome: nome(id, v), vgv: 0, qtd: 0 };
        atual.vgv += Number(v.valor);
        atual.qtd += 1;
        m.set(id, atual);
      }
      return [...m.values()].sort((a, b) => b.vgv - a.vgv);
    };
    return {
      porEquipe: somar((v) => equipeDe.get(v.corretor_id ?? v.corretor?.id), (id) => equipes.find((e) => e.id === id)?.nome ?? "Equipe"),
      porCorretor: somar((v) => v.corretor_id ?? v.corretor?.id, (id, v) => v.corretor?.nome ?? membros.find((m) => m.id === id)?.nome ?? "Corretor"),
    };
  }, [vendas, membros, equipes]);

  if (carregando) return <div className="grid gap-3 lg:grid-cols-2" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />)}</div>;

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <p className="pb-eyebrow">Gestão da diretoria</p>
        <h1 className="text-xl font-semibold">{diretoria?.nome ?? "Minha diretoria"}</h1>
        <p className="text-[13px] text-ink-2">Equipes, gerentes e o VGV confirmado de cada um. Só leitura: quem monta as equipes é o admin.</p>
      </div>
      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      {!diretoria ? (
        <Vazio>Sua conta ainda não está ligada a uma diretoria. Peça ao admin para escolher a diretoria em Equipe › Acessos internos.</Vazio>
      ) : equipes.length === 0 ? (
        <Vazio>Nenhuma equipe na sua diretoria ainda. O admin liga as equipes à diretoria em Equipe › Equipes da Place.</Vazio>
      ) : (
        <>
          <ul className="grid gap-3 lg:grid-cols-2">
            {equipes.map((e) => {
              const corretores = membros.filter((m) => m.equipeId === e.id);
              return (
                <li key={e.id} className="animate-fade-up min-w-0 space-y-3 rounded-2xl border border-line bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold">{e.nome}</h2>
                      <p className="truncate text-[13px] text-ink-2">Gerente: {e.gerente?.nome ?? "sem gerente"}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {e.sede && <Selo tom="ouro">{e.sede}</Selo>}
                      <Selo tom="azul">{corretores.length} {corretores.length === 1 ? "corretor" : "corretores"}</Selo>
                    </div>
                  </div>
                  {corretores.length > 0 && <p className="text-xs text-ink-3">{corretores.map((c) => c.nome).join(" · ")}</p>}
                  {e.gerente?.telefone && (
                    <a href={linkWhatsApp(e.gerente.telefone)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#25D366]/40 px-4 text-[13px] text-[#25D366] hover:bg-[#25D366]/10">
                      <Icon name="messageCircle" className="size-4" /> WhatsApp do gerente
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="grid gap-4 lg:grid-cols-2">
            <Ranking titulo="VGV por equipe" itens={porEquipe} />
            <Ranking titulo="VGV por corretor" itens={porCorretor} />
          </div>
        </>
      )}
    </div>
  );
}
