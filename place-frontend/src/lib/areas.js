export const ROLE_HOME = {
  admin: "/admin/painel",
  gerente: "/gerente",
  corretor: "/corretor",
  viabilizador: "/viabilizador",
  rh: "/rh",
  recepcao: "/recepcao",
  diretor: "/diretor",
  cadastro: "/cadastro",
};

export const AREAS = {
  corretor: {
    home: "/corretor",
    items: [
      { label: "Início", href: "/corretor", icon: "home", end: true },
      { label: "Meus leads", href: "/corretor/leads", icon: "users", match: ["/corretor/clientes"] },
      { label: "Agenda", href: "/corretor/agenda", icon: "calendar" },
      { label: "Empreendimentos", href: "/corretor/empreendimentos", icon: "building", match: ["/corretor/mapa", "/corretor/books"] },
      { label: "Vendas", href: "/corretor/vendas", icon: "chart" },
      { label: "Treinamento", href: "/corretor/treinamento", icon: "star" },
      { label: "Configurações", href: "/corretor/configuracoes", icon: "settings" },
    ],
  },

  gerente: {
    home: "/gerente",
    items: [
      { label: "Início", href: "/gerente", icon: "home", end: true },
      { label: "Leads", href: "/gerente/leads", icon: "users" },
      { label: "Agendamentos", href: "/gerente/agendamentos", icon: "calendar" },
      { label: "Minha equipe", href: "/gerente/equipe", icon: "team" },
      { label: "Focos da equipe", href: "/gerente/focos", icon: "list" },
      { label: "Empreendimentos", href: "/gerente/empreendimentos", icon: "building", match: ["/gerente/books"] },
      { label: "Vendas", href: "/gerente/vendas", icon: "chart" },
      { label: "Treinamento", href: "/gerente/treinamento", icon: "star" },
      { label: "Configurações", href: "/gerente/configuracoes", icon: "settings" },
    ],
  },

  viabilizador: {
    home: "/viabilizador",
    items: [
      { label: "Início", href: "/viabilizador", icon: "home", end: true },
      { label: "Meus produtos", href: "/viabilizador/produtos", icon: "building" },
      { label: "Books e Tabelas", href: "/viabilizador/books", icon: "book" },
      { label: "Oportunidades", href: "/viabilizador/oportunidades", icon: "activity" },
      { label: "Configurações", href: "/viabilizador/configuracoes", icon: "settings" },
    ],
  },

  // Cargos internos criados pelo admin (divisão de cargos de 17/11/2026).
  rh: {
    home: "/rh",
    items: [
      { label: "Candidaturas", href: "/rh", icon: "users", end: true },
      { label: "Vagas", href: "/rh/vagas", icon: "list" },
      { label: "Configurações", href: "/rh/configuracoes", icon: "settings" },
    ],
  },

  recepcao: {
    home: "/recepcao",
    items: [
      { label: "Roleta do dia", href: "/recepcao", icon: "refresh", end: true },
      { label: "Configurações", href: "/recepcao/configuracoes", icon: "settings" },
    ],
  },

  diretor: {
    home: "/diretor",
    items: [
      { label: "Dashboard", href: "/diretor", icon: "dashboard", end: true },
      { label: "Vendas", href: "/diretor/vendas", icon: "chart" },
      { label: "Configurações", href: "/diretor/configuracoes", icon: "settings" },
    ],
  },

  cadastro: {
    home: "/cadastro",
    items: [
      { label: "Empreendimentos", href: "/cadastro", icon: "building", end: true },
      { label: "Configurações", href: "/cadastro/configuracoes", icon: "settings" },
    ],
  },
};
