import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import HomePage from "@/pages/HomePage";
import { AuthLayout } from "@/components/auth/AuthLayout";


const SobrePage = lazy(() => import("@/pages/SobrePage"));
const ContatoPage = lazy(() => import("@/pages/ContatoPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const AcessoNegadoPage = lazy(() => import("@/pages/AcessoNegadoPage"));
const PerfilPage = lazy(() => import("@/pages/PerfilPage"));
const AreaLayout = lazy(() => import("@/pages/AreaLayout"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const VendasPage = lazy(() => import("@/pages/VendasPage"));
const ComingSoonPage = lazy(() => import("@/pages/admin/ComingSoonPage"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const PainelAdmPage = lazy(() => import("@/pages/admin/PainelAdmPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const LeadsPage = lazy(() => import("@/pages/admin/LeadsPage"));
const AgendamentosPage = lazy(() => import("@/pages/admin/AgendamentosPage"));
const EmpreendimentosPage = lazy(() => import("@/pages/admin/EmpreendimentosPage"));
const ClientesPage = lazy(() => import("@/pages/admin/ClientesPage"));
const RelatoriosPage = lazy(() => import("@/pages/admin/RelatoriosPage"));
const EquipePage = lazy(() => import("@/pages/admin/EquipePage"));
const RoletaPage = lazy(() => import("@/pages/admin/RoletaPage"));
const CorretorHomePage = lazy(() => import("@/pages/corretor/CorretorHomePage"));
const CatalogoPage = lazy(() => import("@/pages/corretor/CatalogoPage"));
const MapaGeralPage = lazy(() => import("@/pages/corretor/MapaGeralPage"));
const MeusLeadsPage = lazy(() => import("@/pages/corretor/MeusLeadsPage"));
const AgendaPage = lazy(() => import("@/pages/corretor/AgendaPage"));
const TreinamentoPage = lazy(() => import("@/pages/corretor/TreinamentoPage"));
const GerenteInicioPage = lazy(() => import("@/pages/gerente/GerenteInicioPage"));
const MinhaEquipePage = lazy(() => import("@/pages/gerente/MinhaEquipePage"));
const GerenteLeadsPage = lazy(() => import("@/pages/gerente/GerenteLeadsPage"));
const GerenteAgendaPage = lazy(() => import("@/pages/gerente/GerenteAgendaPage"));
const FocosEquipePage = lazy(() => import("@/pages/gerente/FocosEquipePage"));

export default function App() {
  return (
    <Suspense fallback={<div role="status" className="grid min-h-[50vh] place-items-center bg-page px-6 text-sm text-ink-2">Carregando página…</div>}>
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
        <Route path="treinamento" element={<TreinamentoPage />} />
        <Route path="vendas" element={<VendasPage />} />
        <Route path="configuracoes" element={<PerfilPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>


      <Route path="/gerente" element={<AreaLayout cargo="gerente" />}>
        <Route index element={<GerenteInicioPage />} />
        <Route path="empreendimentos" element={<CatalogoPage />} />
        <Route path="empreendimentos/:id" element={<CatalogoPage />} />
        <Route path="books" element={<CatalogoPage modo="books" />} />
        <Route path="equipe" element={<MinhaEquipePage />} />
        <Route path="leads" element={<GerenteLeadsPage />} />
        <Route path="agendamentos" element={<GerenteAgendaPage />} />
        <Route path="focos" element={<FocosEquipePage />} />
        <Route path="treinamento" element={<TreinamentoPage />} />
        <Route path="vendas" element={<VendasPage />} />
        <Route path="configuracoes" element={<PerfilPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="/viabilizador/*" element={<Navigate to="/acesso-negado" replace />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="painel" replace />} />
        <Route path="painel" element={<PainelAdmPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="imoveis" element={<EmpreendimentosPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route path="vendas" element={<VendasPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="equipe" element={<EquipePage />} />
        <Route path="roleta" element={<RoletaPage />} />
        <Route path="focos" element={<FocosEquipePage />} />
        <Route path="configuracoes" element={<PerfilPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
