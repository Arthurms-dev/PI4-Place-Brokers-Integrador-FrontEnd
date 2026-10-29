// Aviso de lead novo no celular (Web Push). O navegador guarda uma "inscrição" e o back
// usa essa inscrição para mandar a notificação, mesmo com o site fechado.
import { api } from "@/lib/apiClient";

/** Chave pública VAPID (base64url) para o formato que o navegador pede. */
export function chaveParaBytes(base64url) {
  const preenchimento = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + preenchimento).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(base64);
  return Uint8Array.from(bruto, (c) => c.charCodeAt(0));
}

export const suportaNotificacoes = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/** iPhone/iPad só recebem push com o site adicionado à Tela de Início. */
export function precisaInstalarNoIOS() {
  if (typeof navigator === "undefined") return false;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalado = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
  return ios && !instalado;
}

export async function chavePublica() {
  try {
    return (await api.get("/notificacoes/chave")).chave ?? null;
  } catch {
    return null;
  }
}

/** "ativo" | "bloqueado" | "pendente" (ainda não pediu) */
export async function estadoNotificacoes() {
  if (!suportaNotificacoes()) return "indisponivel";
  if (Notification.permission === "denied") return "bloqueado";
  const registro = await navigator.serviceWorker.getRegistration();
  const inscricao = await registro?.pushManager.getSubscription();
  return inscricao && Notification.permission === "granted" ? "ativo" : "pendente";
}

export async function ativarNotificacoes(chave) {
  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") return permissao === "denied" ? "bloqueado" : "pendente";
  const registro = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const inscricao =
    (await registro.pushManager.getSubscription()) ??
    (await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chaveParaBytes(chave) }));
  await api.post("/notificacoes/inscricao", inscricao.toJSON());
  return "ativo";
}

export async function desativarNotificacoes() {
  const registro = await navigator.serviceWorker.getRegistration();
  const inscricao = await registro?.pushManager.getSubscription();
  if (!inscricao) return;
  await api.delete(`/notificacoes/inscricao?endpoint=${encodeURIComponent(inscricao.endpoint)}`).catch(() => {});
  await inscricao.unsubscribe();
}
