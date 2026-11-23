// Rolagem do site público: abas do header, links com âncora (#vender) e troca de página.

/** Home e modal do empreendimento são a mesma tela: abrir/fechar o modal não volta ao topo. */
const ehHome = (caminho) => caminho === "/" || caminho.startsWith("/imoveis/");

/**
 * Ao trocar de página o site deve abrir no topo, como um site comum.
 * Exceções: voltar/avançar do navegador (ele mesmo devolve a posição), endereço com âncora (#vender),
 * pedido para rolar até uma seção (state.rolar) e abrir/fechar o modal do empreendimento sobre a home.
 */
export function deveVoltarAoTopo({ anterior, atual, tipo, hash = "", rolar = null }) {
  if (anterior === atual) return false;
  if (tipo === "POP") return false;
  if (hash || rolar) return false;
  if (ehHome(anterior) && ehHome(atual)) return false;
  return true;
}

const movimentoReduzido = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

/** Distância que a seção deve ficar do topo: o scroll-margin-top dela (já conta o header fixo). */
function margemDoTopo(el) {
  const margem = parseFloat(window.getComputedStyle(el).scrollMarginTop);
  return Number.isFinite(margem) && margem > 0 ? margem : 96;
}

const posicaoDe = (el) => Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - margemDoTopo(el)));

/**
 * Rola até a seção sempre no mesmo lugar (logo abaixo do header).
 * Espera dois quadros para o menu do celular fechar antes de medir, e corrige no fim
 * se algo mudou de altura no caminho (fotos carregando, header encolhendo).
 */
export function rolarAteSecao(id, { suave = true } = {}) {
  const comportamento = suave && !movimentoReduzido() ? "smooth" : "auto";
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      window.scrollTo({ top: posicaoDe(el), behavior: comportamento });

      let corrigido = false;
      const usuarioMexeu = ["wheel", "touchstart", "keydown"];
      const encerrar = () => {
        corrigido = true;
        window.removeEventListener("scrollend", corrigir);
        usuarioMexeu.forEach((evento) => window.removeEventListener(evento, encerrar));
      };
      const corrigir = () => {
        if (corrigido) return;
        encerrar();
        const destino = posicaoDe(el);
        if (Math.abs(window.scrollY - destino) > 2) window.scrollTo({ top: destino, behavior: "auto" });
      };
      window.addEventListener("scrollend", corrigir, { once: true });
      // Se a pessoa rolar por conta própria no meio do caminho, não puxa a tela de volta.
      usuarioMexeu.forEach((evento) => window.addEventListener(evento, encerrar, { once: true, passive: true }));
      // Navegadores sem o evento "scrollend": confere depois que a animação terminou.
      window.setTimeout(corrigir, comportamento === "smooth" ? 1200 : 50);
    })
  );
}
