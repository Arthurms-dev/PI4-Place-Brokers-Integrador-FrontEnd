import { obterMidiasPublicasVerificadas } from '@/data/midiasPublicasVerificadas';

// Apenas os três acervos limpos conferidos nas pastas de imagens do Drive.
const NOMES = new Set(['engenho paulista', 'carneiros park', 'porto carolina']);
const normalizar = (nome) => String(nome ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');

export function listarAcervoCadastro(nome) {
  const chave = normalizar(nome);
  if (!NOMES.has(chave)) return [];
  return obterMidiasPublicasVerificadas(nome).map((foto, indice) => ({
    ...foto, numero: indice + 1,
    arquivoNome: `${chave.replace(/\s+/g, '-')}-${String(indice + 1).padStart(2, '0')}.webp`,
  }));
}

export async function carregarFotoDoAcervo(nome, src) {
  const foto = listarAcervoCadastro(nome).find((item) => item.src === src);
  if (!foto) throw new Error('Essa imagem não pertence ao acervo conferido deste empreendimento.');
  const resposta = await fetch(foto.src, { signal: AbortSignal.timeout(15000) });
  if (!resposta.ok) throw new Error(`Não foi possível carregar a foto ${foto.numero} do acervo.`);
  const arquivo = await resposta.blob();
  if (arquivo.type !== 'image/webp' || !arquivo.size || arquivo.size > 15 * 1024 * 1024) {
    throw new Error(`A foto ${foto.numero} retornou um arquivo inválido. Recarregue a página.`);
  }
  return new File([arquivo], foto.arquivoNome, { type: 'image/webp' });
}
