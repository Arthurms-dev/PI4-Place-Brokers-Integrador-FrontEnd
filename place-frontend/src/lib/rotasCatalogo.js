/** Mantém navegação na área correta, sem atravessar o controle de cargos. */
export function rotaBaseCatalogo(pathname = "") {
  return pathname === "/gerente" || pathname.startsWith("/gerente/")
    ? "/gerente/empreendimentos"
    : "/corretor/empreendimentos";
}
