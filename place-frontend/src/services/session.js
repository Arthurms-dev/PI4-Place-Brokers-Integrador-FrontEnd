/**
 * Usuário logado (ADMIN). Placeholder até existir autenticação.
 * Depois: ler o token/cookie e chamar GET /me na API.
 */
export async function getCurrentUser() {
  return {
    name: "Arthur Vinícius",
    role: "Administrador",
    unreadNotifications: 0,
  };
}
