/**
 * Complementos editoriais temporários de tipologias, verificados em books.
 * NÃO representam estoque ou disponibilidade de unidades.
 * Não armazene aqui tabelas comerciais, plantas, preços ou URLs privadas.
 * Migrar futuramente para tipologias estruturadas no back-end.
 */
const FICHAS = Object.freeze({
  'candeias life club': {
    suitesTexto: '1 suíte nas tipologias do projeto',
    nota: 'Book Candeias Life Club atualizado, páginas 33 a 37: projetos de 2 e 3 quartos com 1 suíte.',
  },
  'porto carolina': {
    suitesTexto: 'Suíte opcional conforme a unidade',
    nota: 'Book Porto Carolina, página 10; configuração garden da página 13 apresenta 2 suítes.',
  },
  'viva paineiras': {
    suitesTexto: '1 suíte nas tipologias do projeto',
    nota: 'Pré-book Viva Paineiras, páginas 23 e 25 a 26.',
  },
  'brisa do mar': {
    suitesTexto: 'Opções com suíte',
    nota: 'Book Brisa do Mar, páginas 35 a 38; projetos com e sem suíte.',
  },
  'carneiros park': {
    tipoTexto: 'Studios no projeto',
    nota: 'Book Carneiros Park Flats, páginas 12, 16 e 17.',
  },
});

export function obterFichaPublicaVerificada(nome) {
  const chave = String(nome ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
  return FICHAS[chave] ?? null;
}
