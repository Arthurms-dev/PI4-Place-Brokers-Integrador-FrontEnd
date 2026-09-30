import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";  

const MENU_SIMPLES = [
  { label: "Visão Geral", href: "/admin", icon: "home", end: true },
  { label: "Equipe", href: "/admin/equipe", icon: "team" },
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

const MENU_COMPLETO = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard", end: true },
  { label: "Imóveis", href: "/admin/imoveis", icon: "home" },
  { label: "Leads", href: "/admin/leads", icon: "users" }, 
  { label: "Clientes", href: "/admin/clientes", icon: "user" },
  { label: "Agendamentos", href: "/admin/agendamentos", icon: "calendar" }, 
  { label: "Relatórios", href: "/admin/relatorios", icon: "chart" }, 
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isHomeAdmin = location.pathname === "/admin" || location.pathname === "/admin/";

  const itensParaMostrar = isHomeAdmin ? MENU_SIMPLES : MENU_COMPLETO;
  
  const linkDaLogo = isHomeAdmin ? "/admin" : "/admin/dashboard";

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        items={itensParaMostrar} 
        home={linkDaLogo}
      />

      <main className="flex-1 flex flex-col h-screen overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
}