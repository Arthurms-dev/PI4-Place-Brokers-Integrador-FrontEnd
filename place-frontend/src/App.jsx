import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import AcessoNegadoPage from "@/pages/AcessoNegadoPage";
import PerfilPage from "@/pages/PerfilPage";
import AreaLayout from "@/pages/AreaLayout";
import { AuthLayout } from "@/components/auth/AuthLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import CorretorHomePage from "@/pages/corretor/CorretorHomePage";
import MapaGeralPage from "@/pages/corretor/MapaGeralPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import PainelAdmPage from "@/pages/admin/PainelAdmPage";
import LeadsPage from "@/pages/admin/LeadsPage";
import ComingSoonPage from "@/pages/admin/ComingSoonPage";
import AgendamentosPage from "@/pages/admin/AgendamentosPage";
import AgendaPage from "@/pages/corretor/AgendaPage";
import ImovelDetalhes from "@/pages/ImovelDetalhes";
import { Navigate } from "react-router-dom";
import EquipePage from "@/pages/admin/EquipePage";
import EmpreendimentosPage from "@/pages/admin/EmpreendimentosPage";
import VendasPage from "@/pages/VendasPage";
import MeusLeadsPage from "@/pages/corretor/MeusLeadsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      
      <Route path="/imoveis/:id" element={<ImovelDetalhes />} />

      <Route path="/acesso-negado" element={<AcessoNegadoPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/corretor" element={<AreaLayout cargo="corretor" />}>
      <Route path="leads" element={<MeusLeadsPage />} />
        <Route path="clientes/novo" element={<MeusLeadsPage abrirCadastro />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="vendas" element={<VendasPage />} />
        <Route index element={<CorretorHomePage />} />
        <Route path="mapa" element={<MapaGeralPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="/gerente" element={<AreaLayout cargo="gerente" />}>
      <Route path="vendas" element={<VendasPage />} />
        <Route index element={<ComingSoonPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="/viabilizador" element={<AreaLayout cargo="viabilizador" />}>
        <Route index element={<ComingSoonPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<PainelAdmPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="imoveis" element={<EmpreendimentosPage />} />
        <Route path="equipe" element={<EquipePage />} />
        <Route path="vendas" element={<VendasPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}