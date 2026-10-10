import { useEffect, useState } from "react";
import {
  atualizarStatusAgendamento,
  criarAgendamento,
  getAgendamentos,
  getClientes,
  getEmpreendimentos,
  remarcarAgendamento,
} from "@/services/admin/agendamentos";
import { getCorretores } from "@/services/admin/leads";
import { usePageTitle } from "@/hooks/usePageTitle";
import AgendamentosSummary from "@/components/admin/agendamentos/AgendamentosSummary";
import AgendamentosToolbar from "@/components/admin/agendamentos/AgendamentosToolbar";
import AgendamentosTable from "@/components/admin/agendamentos/AgendamentosTable";
import AgendamentosCalendar from "@/components/admin/agendamentos/AgendamentosCalendar";
import AgendamentoFormDrawer from "@/components/admin/agendamentos/AgendamentoFormDrawer";
import AgendamentoDetailsDrawer from "@/components/admin/agendamentos/AgendamentoDetailsDrawer";

export default function AgendamentosPage() {
  usePageTitle("Agendamentos");
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [empreendimentos, setEmpreendimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [viewMode, setViewMode] = useState("calendario");
  const [semanaBase, setSemanaBase] = useState(new Date());
  const [filtros, setFiltros] = useState({ status: "", tipo: "", corretorId: "" });
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [formAberto, setFormAberto] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    setErro("");
    try {
      const [resAgendamentos, resCorretores, resClientes, resEmpreendimentos] = await Promise.allSettled([
        getAgendamentos(),
        getCorretores(),
        getClientes(),
        getEmpreendimentos(),
      ]);
      setAgendamentos(resAgendamentos.status === "fulfilled" ? resAgendamentos.value : []);
      setCorretores(resCorretores.status === "fulfilled" ? resCorretores.value : []);
      setClientes(resClientes.status === "fulfilled" ? resClientes.value : []);
      setEmpreendimentos(resEmpreendimentos.status === "fulfilled" ? resEmpreendimentos.value : []);
      if (resAgendamentos.status === "rejected") {
        setErro(resAgendamentos.reason?.message ?? "Não foi possível carregar os agendamentos.");
      }
    } finally {
      setCarregando(false);
    }
  }

  const agendamentosFiltrados = agendamentos.filter((a) => {
    if (filtros.status && a.status !== filtros.status) return false;
    if (filtros.tipo && a.tipo !== filtros.tipo) return false;
    if (filtros.corretorId && a.corretor?.id !== filtros.corretorId) return false;
    return true;
  });

  async function handleCriar(dados) {
    const novo = await criarAgendamento(dados);
    setAgendamentos((lista) => [...lista, novo]);
    setFormAberto(false);
  }

  async function handleAtualizarStatus(id, status, extra) {
    const atualizado = await atualizarStatusAgendamento(id, status, extra);
    setAgendamentos((lista) => lista.map((a) => (a.id === id ? atualizado : a)));
    setAgendamentoSelecionado(atualizado);
  }

  async function handleRemarcar(id, dataHora) {
    const atualizado = await remarcarAgendamento(id, dataHora);
    setAgendamentos((lista) => lista.map((a) => (a.id === id ? atualizado : a)));
    setAgendamentoSelecionado(atualizado);
  }

  function mudarSemana(dias) {
    setSemanaBase((data) => {
      const nova = new Date(data);
      nova.setDate(nova.getDate() + dias);
      return nova;
    });
  }

  if (carregando) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Carregando agendamentos">
        <div className="h-9 w-56 animate-pulse rounded-xl bg-card" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-card" />)}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold">Agendamentos</h1>
        <p className="text-[13px] text-ink-2">Visitas a imóveis e reuniões marcadas com os clientes.</p>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      <AgendamentosSummary agendamentos={agendamentos} />

      <AgendamentosToolbar
        filtros={filtros}
        onFiltrosChange={setFiltros}
        corretores={corretores}
        onNovoAgendamento={() => setFormAberto(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "calendario" ? (
        <AgendamentosCalendar
          agendamentos={agendamentosFiltrados}
          semanaBase={semanaBase}
          onMudarSemana={mudarSemana}
          onSelecionar={setAgendamentoSelecionado}
        />
      ) : (
        <AgendamentosTable agendamentos={agendamentosFiltrados} onSelecionar={setAgendamentoSelecionado} />
      )}

      <AgendamentoFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        onSalvar={handleCriar}
        clientes={clientes}
        corretores={corretores}
        empreendimentos={empreendimentos}
      />

      <AgendamentoDetailsDrawer
        key={agendamentoSelecionado?.id ?? "nenhum"}
        agendamento={agendamentoSelecionado}
        onFechar={() => setAgendamentoSelecionado(null)}
        onAtualizarStatus={handleAtualizarStatus}
        onRemarcar={handleRemarcar}
      />
    </div>
  );
}