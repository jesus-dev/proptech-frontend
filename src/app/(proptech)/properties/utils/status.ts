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

export const normalizePropertyStatus = (
  statusValue?: string | null
): "active" | "inactive" => {
  if (!statusValue || typeof statusValue !== "string") {
    return "active";
  }

  const trimmed = statusValue.trim();
  if (!trimmed) return "active";

  const upper = trimmed.toUpperCase();
  if (ACTIVE_STATUS_CODES.has(upper)) {
    return "active";
  }

  const normalizedKey = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");

  if (ACTIVE_STATUS_KEYS.has(normalizedKey)) {
    return "active";
  }

  if (normalizedKey === "true" || normalizedKey === "1" || normalizedKey === "si") {
    return "active";
  }

  if (normalizedKey === "false" || normalizedKey === "0" || normalizedKey === "no") {
    return "inactive";
  }

  return "inactive";
};

const pickStatusCandidates = (property: Record<string, any>): Array<string | undefined> => {
  const candidates: Array<string | undefined> = [];

  const pushValue = (value: unknown) => {
    if (!value) return;
    if (typeof value === "string") {
      candidates.push(value);
    } else if (typeof value === "object" && value !== null) {
      if ("code" in value && typeof (value as any).code === "string") {
        candidates.push((value as any).code);
      }
      if ("status" in value && typeof (value as any).status === "string") {
        candidates.push((value as any).status);
      }
      if ("name" in value && typeof (value as any).name === "string") {
        candidates.push((value as any).name);
      }
    }
  };

  pushValue(property.status);
  pushValue(property.propertyStatus);
  pushValue(property.propertyStatusCode);
  pushValue(property.propertyStatusLabel);
  pushValue(property.statusCode);
  pushValue(property.state);
  pushValue(property.statusName);
  pushValue(property.propertyStatusName);

  return candidates;
};

export const resolvePropertyStatus = (
  property: Record<string, any> | null | undefined
): "active" | "inactive" => {
  if (!property) return "active";

  const candidates = pickStatusCandidates(property);
  for (const candidate of candidates) {
    if (candidate) {
      return normalizePropertyStatus(candidate);
    }
  }

  return "active";
};

