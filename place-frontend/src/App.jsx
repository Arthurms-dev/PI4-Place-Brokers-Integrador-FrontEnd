import { Navigate, Route, Routes } from "react-router-dom";

import SiteLayout from "@/components/site/SiteLayout";
import HomePage from "@/pages/HomePage";
import SobrePage from "@/pages/SobrePage";
import ContatoPage from "@/pages/ContatoPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AcessoNegadoPage from "@/pages/AcessoNegadoPage";
import PerfilPage from "@/pages/PerfilPage";
import AreaLayout from "@/pages/AreaLayout";
import { AuthLayout } from "@/components/auth/AuthLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VendasPage from "@/pages/VendasPage";
import ComingSoonPage from "@/pages/admin/ComingSoonPage";

import AdminLayout from "@/pages/admin/AdminLayout";
import PainelAdmPage from "@/pages/admin/PainelAdmPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import LeadsPage from "@/pages/admin/LeadsPage";
import AgendamentosPage from "@/pages/admin/AgendamentosPage";
import EmpreendimentosPage from "@/pages/admin/EmpreendimentosPage";
import ClientesPage from "@/pages/admin/ClientesPage";
import RelatoriosPage from "@/pages/admin/RelatoriosPage";
import EquipePage from "@/pages/admin/EquipePage";

import CorretorHomePage from "@/pages/corretor/CorretorHomePage";
import CatalogoPage from "@/pages/corretor/CatalogoPage";
import MapaGeralPage from "@/pages/corretor/MapaGeralPage";
import MeusLeadsPage from "@/pages/corretor/MeusLeadsPage";
import AgendaPage from "@/pages/corretor/AgendaPage";

import GerenteInicioPage from "@/pages/gerente/GerenteInicioPage";
import MinhaEquipePage from "@/pages/gerente/MinhaEquipePage";
import GerenteLeadsPage from "@/pages/gerente/GerenteLeadsPage";
import GerenteAgendaPage from "@/pages/gerente/GerenteAgendaPage";

import ViabilizadorInicioPage from "@/pages/viabilizador/ViabilizadorInicioPage";
import MeusProdutosPage from "@/pages/viabilizador/MeusProdutosPage";
import ViabilizadorBooksPage from "@/pages/viabilizador/ViabilizadorBooksPage";
import OportunidadesPage from "@/pages/viabilizador/OportunidadesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/imoveis/:id" element={<HomePage />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/contato" element={<ContatoPage />} />
      </Route>

      <Route path="/acesso-negado" element={<AcessoNegadoPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/corretor" element={<AreaLayout cargo="corretor" />}>
        <Route index element={<CorretorHomePage />} />
        <Route path="empreendimentos" element={<CatalogoPage />} />
        <Route path="empreendimentos/:id" element={<CatalogoPage />} />
        <Route path="mapa" element={<MapaGeralPage />} />
        <Route path="books" element={<CatalogoPage modo="books" />} />
        <Route path="clientes/novo" element={<MeusLeadsPage abrirCadastro />} />
        <Route path="leads" element={<MeusLeadsPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="vendas" element={<VendasPage />} />
        <Route path="configuracoes" element={<PerfilPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="/gerente" element={<AreaLayout cargo="gerente" />}>
        <Route index element={<GerenteInicioPage />} />
        <Route path="equipe" element={<MinhaEquipePage />} />
        <Route path="leads" element={<GerenteLeadsPage />} />
        <Route path="agendamentos" element={<GerenteAgendaPage />} />
        <Route path="vendas" element={<VendasPage />} />
        <Route path="configuracoes" element={<PerfilPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="/viabilizador" element={<AreaLayout cargo="viabilizador" />}>
        <Route index element={<ViabilizadorInicioPage />} />
        <Route path="produtos" element={<MeusProdutosPage />} />
        <Route path="books" element={<ViabilizadorBooksPage />} />
        <Route path="oportunidades" element={<OportunidadesPage />} />
        <Route path="configuracoes" element={<PerfilPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="painel" element={<PainelAdmPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="imoveis" element={<EmpreendimentosPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route path="vendas" element={<VendasPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="equipe" element={<EquipePage />} />
        <Route path="configuracoes" element={<PerfilPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
