import "@testing-library/jest-dom/vitest";

// Node 25+ traz um localStorage próprio que, sem --localstorage-file, fica vazio (undefined)
// e esconde o do jsdom nos testes ("Cannot read properties of undefined (reading 'getItem')").
// Aqui os testes voltam a usar o armazenamento do jsdom, em qualquer versão do Node.
const janelaJsdom = globalThis.jsdom?.window;
for (const chave of ["localStorage", "sessionStorage"]) {
  if (janelaJsdom && typeof globalThis[chave]?.getItem !== "function") {
    Object.defineProperty(globalThis, chave, { value: janelaJsdom[chave], configurable: true, writable: true });
  }
}
