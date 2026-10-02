export const ROLE_HOME = {
  admin: "/admin",
  gerente: "/gerente",
  corretor: "/corretor",
  viabilizador: "/viabilizador",
};

export const AREAS = {
  corretor: {
    home: "/corretor",
    items: [
      { label: "Início", href: "/corretor", icon: "home", end: true },
      { label: "Empreendimentos", href: "/corretor/empreendimentos", icon: "building" },
      { label: "Mapa Geral", href: "/corretor/mapa", icon: "map" },
      { label: "Ver Book e Tabelas", href: "/corretor/books", icon: "book" },
      { label: "Cadastrar Cliente", href: "/corretor/clientes/novo", icon: "userPlus" },
      { label: "Meus Leads", href: "/corretor/leads", icon: "users" },
      { label: "Configurações", href: "/corretor/configuracoes", icon: "settings" },
    ],
  },
  gerente: {
    home: "/gerente",
    items: [
      { label: "Início", href: "/gerente", icon: "home", end: true },
      { label: "Minha equipe", href: "/gerente/equipe", icon: "team" },
      { label: "Leads", href: "/gerente/leads", icon: "users" },
      { label: "Agendamentos", href: "/gerente/agendamentos", icon: "calendar" },
      { label: "Vendas", href: "/gerente/vendas", icon: "chart" },
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
};