export const STATUS = {
  lancamento: { label: "Lançamento", color: "var(--color-ok)" },
  obras: { label: "Em obras", color: "var(--color-info)" },
  pronto: { label: "Pronto", color: "var(--color-gold)" },
  outros: { label: "Outros", color: "var(--color-ink-3)" },
};

const base = { quartos: "2 e 3 quartos", vagas: "1 e 2 vagas", lazer: "Lazer completo", capa: null };

export const EMPREENDIMENTOS = [
  { ...base, id: 1, nome: "Mirante Belvedere", bairro: "Boa Viagem", cidade: "Recife", uf: "PE", status: "lancamento", lat: -8.1187, lng: -34.904, atualizadoEm: "2026-09-23" },
  { ...base, id: 2, nome: "Vila do Paraíso", bairro: "Piedade", cidade: "Jaboatão dos Guararapes", uf: "PE", status: "obras", lat: -8.169, lng: -34.916, atualizadoEm: "2026-09-22" },
  { ...base, id: 3, nome: "Parque São Lucas", bairro: "Mooca", cidade: "São Paulo", uf: "SP", status: "pronto", lat: -23.5505, lng: -46.6333, atualizadoEm: "2026-09-20" },
  { ...base, id: 4, nome: "Jardins do Pina", bairro: "Pina", cidade: "Recife", uf: "PE", status: "pronto", lat: -8.09, lng: -34.885, atualizadoEm: "2026-09-18" },
  { ...base, id: 5, nome: "Casa Forte Residence", bairro: "Casa Forte", cidade: "Recife", uf: "PE", status: "lancamento", lat: -8.033, lng: -34.918, atualizadoEm: "2026-09-15" },
  { ...base, id: 6, nome: "Graças Prime", bairro: "Graças", cidade: "Recife", uf: "PE", status: "obras", lat: -8.042, lng: -34.899, atualizadoEm: "2026-09-12" },
  { ...base, id: 7, nome: "Imbiribeira Park", bairro: "Imbiribeira", cidade: "Recife", uf: "PE", status: "outros", lat: -8.113, lng: -34.916, atualizadoEm: "2026-09-10" },
];