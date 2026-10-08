import { useEffect, useState } from "react";
import {
  getAgendamentos,
  criarAgendamento,
  atualizarStatusAgendamento,
  getClientes,
  getEmpreendimentos,
} from "../../services/admin/agendamentos";
import { getCorretores } from "@/services/admin/leads";
import AgendamentosSummary from "../../components/admin/agendamentos/AgendamentosSummary";
import AgendamentosToolbar from "../../components/admin/agendamentos/AgendamentosToolbar";
import AgendamentosTable from "../../components/admin/agendamentos/AgendamentosTable";
import AgendamentosCalendar from "../../components/admin/agendamentos/AgendamentosCalendar";
import AgendamentoFormDrawer from "../../components/admin/agendamentos/AgendamentoFormDrawer";
import AgendamentoDetailsDrawer from "../../components/admin/agendamentos/AgendamentoDetailsDrawer";

export default function AgendamentosPage() {
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

  function mudarSemana(dias) {
    setSemanaBase((data) => {
      const nova = new Date(data);
      nova.setDate(nova.getDate() + dias);
      return nova;
    });
  }

  if (carregando) {
    return <p className="p-6 text-sm text-slate-500">Carregando agendamentos...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Agendamentos</h1>
        <p className="text-sm text-slate-500">Visitas a imóveis e reuniões marcadas com os clientes.</p>
      </div>

      {erro && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}

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
        agendamento={agendamentoSelecionado}
        onFechar={() => setAgendamentoSelecionado(null)}
        onAtualizarStatus={handleAtualizarStatus}
      />
    </div>
  );
}