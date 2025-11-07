export type ProptechStatKey = 'agents' | 'properties' | 'satisfaction';

interface ProptechStatDefinition {
  key: ProptechStatKey;
  value: string;
  label: string;
}

type ProptechStatsCopy = Record<ProptechStatKey, { headline: string }>;

export const PROPTECH_STATS: ProptechStatDefinition[] = [
  {
    key: 'agents',
    value: '50+',
    label: 'Agentes activos',
  },
  {
    key: 'properties',
    value: '1K+',
    label: 'Propiedades gestionadas',
  },
  {
    key: 'satisfaction',
    value: '98%',
    label: 'Satisfacción del cliente',
  },
];

export const PROPTECH_STATS_COPY: ProptechStatsCopy = {
  agents: {
    headline: 'más de 50 agentes inmobiliarios',
  },
  properties: {
    headline: 'más de 1.000 propiedades gestionadas',
  },
  satisfaction: {
    headline: 'un 98% de satisfacción del cliente',
  },
};

export function getProptechStatByKey(key: ProptechStatKey) {
  return PROPTECH_STATS.find((stat) => stat.key === key);
}

