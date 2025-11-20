const ACTIVE_STATUS_CODES = new Set([
  "ACTIVE",
  "AVAILABLE",
  "FOR_SALE",
  "FOR_RENT",
  "PUBLISHED",
  "PUBLICADA",
  "PUBLICADO"
]);

const ACTIVE_STATUS_KEYS = new Set([
  "active",
  "available",
  "disponible",
  "activo",
  "activa",
  "forsale",
  "forrent",
  "enventa",
  "enalquiler",
  "published",
  "publicada",
  "publicado",
  "vigente"
]);

const DRAFT_STATUS_CODES = new Set([
  "DRAFT",
  "BORRADOR",
  "PENDING",
  "PENDIENTE",
  "EN_REVISION",
  "REVISION"
]);

const DRAFT_STATUS_KEYS = new Set([
  "draft",
  "borrador",
  "pendiente",
  "enrevision",
  "enrevisión",
  "revision",
  "revisión"
]);

export const normalizePropertyStatus = (
  statusValue?: string | null
): "active" | "inactive" | "draft" => {
  if (!statusValue || typeof statusValue !== "string") {
    return "active";
  }

  const trimmed = statusValue.trim();
  if (!trimmed) return "active";

  const upper = trimmed.toUpperCase();
  if (ACTIVE_STATUS_CODES.has(upper)) {
    return "active";
  }
  if (DRAFT_STATUS_CODES.has(upper)) {
    return "draft";
  }

  const normalizedKey = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "")
    .replace(/\./g, "");

  if (ACTIVE_STATUS_KEYS.has(normalizedKey)) {
    return "active";
  }

  if (DRAFT_STATUS_KEYS.has(normalizedKey)) {
    return "draft";
  }

  if (normalizedKey === "true" || normalizedKey === "1" || normalizedKey === "si") {
    return "active";
  }

  if (normalizedKey === "false" || normalizedKey === "0" || normalizedKey === "no") {
    return "inactive";
  }

  return "inactive";
};

const STATUS_CANDIDATE_KEYS = [
  "propertyStatusLabel",
  "propertyStatusName",
  "propertyStatusText",
  "statusLabel",
  "statusName",
  "statusText",
  "propertyStatusCode",
  "statusCode",
  "propertyStatus",
  "status",
  "state",
];

const pickStatusCandidates = (property: Record<string, any>): Array<string | undefined> => {
  const candidates: Array<string | undefined> = [];

  const pushValue = (value: unknown) => {
    if (!value) return;
    if (typeof value === 'string') {
      candidates.push(value);
    } else if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      if (typeof obj.code === 'string') {
        candidates.push(obj.code);
      }
      if (typeof obj.status === 'string') {
        candidates.push(obj.status);
      }
      if (typeof obj.name === 'string') {
        candidates.push(obj.name);
      }
      if (typeof obj.label === 'string') {
        candidates.push(obj.label);
      }
    }
  };

  for (const key of STATUS_CANDIDATE_KEYS) {
    pushValue(property[key]);
  }

  return candidates;
};

export const resolvePropertyStatus = (
  property: Record<string, any> | null | undefined
): "active" | "inactive" | "draft" => {
  if (!property) return "active";

  const candidates = pickStatusCandidates(property);
  let foundActive: "active" | null = null;
  let foundInactive: "inactive" | null = null;

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizePropertyStatus(candidate);
    if (normalized === "draft") {
      return "draft";
    }
    if (normalized === "active") {
      foundActive = "active";
    }
    if (normalized === "inactive" && !foundInactive) {
      foundInactive = "inactive";
    }
  }

  if (foundActive) return foundActive;
  if (foundInactive) return foundInactive;

  return "active";
};

