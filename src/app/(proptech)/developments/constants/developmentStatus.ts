export type DevelopmentStatusCode = "available" | "sold" | "reserved";

export interface DevelopmentStatusOption {
  value: DevelopmentStatusCode;
  label: string;
}

export const DEVELOPMENT_STATUSES: DevelopmentStatusOption[] = [
  { value: "available", label: "Disponible" },
  { value: "sold", label: "Vendido" },
  { value: "reserved", label: "Reservado" },
];

export const getDevelopmentStatusLabel = (status: string | null | undefined): string => {
  const normalized = status?.toLowerCase() ?? "";
  const found = DEVELOPMENT_STATUSES.find(s => s.value === normalized);
  return found?.label ?? "";
};

export const getDevelopmentStatusBadgeClasses = (status: string | null | undefined): string => {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case "available":
      return "bg-green-100 dark:bg-green-900/30";
    case "sold":
      return "bg-red-100 dark:bg-red-900/30";
    case "reserved":
      return "bg-yellow-100 dark:bg-yellow-900/30";
    default:
      return "bg-gray-100 dark:bg-gray-900/30";
  }
};

