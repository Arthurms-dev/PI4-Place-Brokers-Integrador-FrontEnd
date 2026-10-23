import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarAtividades, registrarAtividade } from '@/services/leadAtividades';

const TIPOS = [
  ['ligacao','Ligação'], ['whatsapp','WhatsApp'], ['email','E-mail'],
  ['visita','Visita'], ['observacao','Observação'],
];
const exibir = (d) => d ? new Date(d).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' }) : '';

export function LeadAtividades({ leadId }) {
  const [atividades,setAtividades] = useState([]);
  const [loading,setLoading] = useState(true);
  const [salvando,setSalvando] = useState(false);
  const [erro,setErro] = useState('');
  const [tipo,setTipo] = useState('ligacao');
  const [descricao,setDescricao] = useState('');
  const [proximoContatoEm,setProximoContatoEm] = useState('');
  const carregar = useCallback(async () => {
    setLoading(true); setErro('');
    try { setAtividades(await listarAtividades(leadId)); }
    catch(e) { setErro(e.message); }
    finally { setLoading(false); }
  },[leadId]);
  useEffect(() => { carregar(); }, [carregar]);
  const proximo = useMemo(() => atividades
    .filter(a=>a.proximoContatoEm)
    .sort((a,b)=>new Date(b.criadoEm)-new Date(a.criadoEm))[0]?.proximoContatoEm,
    [atividades]);
  async function salvar(e) {
    e.preventDefault(); setErro(''); setSalvando(true);
    try {
      const item = await registrarAtividade(leadId, {
        tipo, descricao, proximoContatoEm: proximoContatoEm ? new Date(proximoContatoEm).toISOString() : null,
      });
      setAtividades(old => [item, ...old]); setDescricao(''); setProximoContatoEm('');
    } catch(err) { setErro(err.message); }
    finally { setSalvando(false); }
  }
  const campo = 'w-full min-h-10 rounded-lg border border-line bg-card-2 px-3 py-2 text-xs text-ink outline-none focus:border-gold';
  return <div className="space-y-4 text-xs">
    {proximo && <p className={`rounded-lg border p-3 ${new Date(proximo) < new Date() ? 'border-danger/40 bg-danger/10 text-danger' : 'border-gold/30 bg-gold/10 text-ink'}`}>
      <strong>Próximo contato:</strong> {exibir(proximo)}{new Date(proximo) < new Date() ? ' · Atrasado' : ''}
    </p>}
    <form onSubmit={salvar} className="space-y-2 rounded-xl border border-line-soft bg-card-2/40 p-3">
      <label className="block space-y-1">Tipo de atividade
        <select className={campo} value={tipo} onChange={e=>setTipo(e.target.value)}>
          {TIPOS.map(([v,r]) => <option key={v} value={v}>{r}</option>)}
        </select>
      </label>
      <label className="block space-y-1">Resumo do atendimento
        <textarea className={campo} value={descricao} onChange={e=>setDescricao(e.target.value)}
          maxLength={2000} required rows={3} placeholder="Ex.: Ligação realizada; cliente pediu condições de pagamento." />
      </label>
      <label className="block space-y-1">Próximo contato (opcional)
        <input className={campo} type="datetime-local" value={proximoContatoEm} onChange={e=>setProximoContatoEm(e.target.value)} />
      </label>
      <button disabled={salvando || !descricao.trim()} type="submit" className="rounded-lg bg-gold px-4 py-2.5 font-semibold text-[#1a1408] disabled:opacity-40">
        {salvando ? 'Salvando…' : 'Registrar atendimento'}
      </button>
    </form>
    {erro && <p role="alert" className="text-danger">{erro}</p>}
    {loading ? <p className="text-ink-3">Carregando histórico…</p> : atividades.length ? (
      <ol className="space-y-2 border-l border-line pl-4">
        {atividades.map(a=><li key={a.id} className="relative rounded-lg border border-line-soft bg-card-2 p-3">
          <p className="font-semibold">{TIPOS.find(([v])=>v===a.tipo)?.[1] ?? a.tipo} · {exibir(a.criadoEm)}</p>
          <p className="mt-1 whitespace-pre-wrap text-ink-2">{a.descricao}</p>
          {a.proximoContatoEm && <p className="mt-2 text-gold">Retornar em {exibir(a.proximoContatoEm)}</p>}
        </li>)}
      </ol>
    ) : <p className="text-ink-3">Nenhum atendimento registrado ainda.</p>}
  </div>;
}

export function LeadAtividadesToggle({ leadId }) {
  const [aberto,setAberto] = useState(false);
  return <div className="border-t border-line-soft pt-2">
    <button type="button" onClick={()=>setAberto(v=>!v)} aria-expanded={aberto}
      className="min-h-10 text-xs font-medium text-gold hover:underline">
      {aberto ? 'Ocultar histórico' : 'Histórico e próximo contato'}
    </button>
    {aberto && <LeadAtividades leadId={leadId} />}
  </div>;
}
