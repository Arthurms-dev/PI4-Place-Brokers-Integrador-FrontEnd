export const MOTIVOS_DRIVE = Object.freeze({
  PDF_NOVO_SEM_VINCULO: 'PDF novo sem vínculo',
  ARQUIVO_MODIFICADO: 'Arquivo do Drive modificado',
  SEM_DATA_REFERENCIA: 'Sem data-base para comparar',
  VINCULOS_REPETIDOS: 'Mais de um vínculo para o arquivo',
  LEGADO_REPETIDO: 'Link legado repetido',
});

export function textoMotivo(motivo) {
  return Object.hasOwn(MOTIVOS_DRIVE, motivo)
    ? MOTIVOS_DRIVE[motivo]
    : 'Revisão necessária';
}

export function dataPendencia(valor) {
  if (!valor) return 'Não informada';
  const data = new Date(valor);
  if (!Number.isFinite(data.getTime())) return 'Não informada';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife', dateStyle: 'short' }).format(data);
}
