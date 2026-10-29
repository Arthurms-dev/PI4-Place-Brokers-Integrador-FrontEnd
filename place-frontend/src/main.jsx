import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});

// Depois de um deploy, quem estava com o site aberto ainda tem a versão antiga e os arquivos
// dela não existem mais: em vez de tela branca, recarrega uma vez para pegar a versão nova.
window.addEventListener("vite:preloadError", (evento) => {
  const CHAVE = "placebrokers_recarregou_versao";
  let ultima = 0;
  try { ultima = Number(sessionStorage.getItem(CHAVE)) || 0; } catch { /* sem sessionStorage */ }
  if (Date.now() - ultima < 30_000) return; // já tentou agora: não entra em loop
  try { sessionStorage.setItem(CHAVE, String(Date.now())); } catch { /* segue mesmo assim */ }
  evento.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);