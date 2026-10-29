/* Place Brokers: service worker só para notificações (não guarda páginas em cache,
   para nunca prender ninguém numa versão antiga do site). */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (evento) => evento.waitUntil(self.clients.claim()));

self.addEventListener("push", (evento) => {
  let dados = {};
  try {
    dados = evento.data ? evento.data.json() : {};
  } catch {
    dados = { titulo: "Place Brokers", corpo: evento.data ? evento.data.text() : "" };
  }
  const titulo = dados.titulo || "Place Brokers";
  evento.waitUntil(
    self.registration.showNotification(titulo, {
      body: dados.corpo || "",
      icon: "/icone-192.png",
      badge: "/icone-192.png",
      tag: dados.tag || undefined,
      renotify: Boolean(dados.tag),
      requireInteraction: Boolean(dados.urgente),
      data: { url: dados.url || "/corretor" },
    }),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const destino = new URL(evento.notification.data?.url || "/corretor", self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas.find((j) => j.url.startsWith(self.location.origin));
      if (aberta) {
        aberta.navigate(destino).catch(() => {});
        return aberta.focus();
      }
      return self.clients.openWindow(destino);
    }),
  );
});
