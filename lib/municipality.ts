export const defaultMunicipalityName = process.env.NEXT_PUBLIC_DEFAULT_MUNICIPALITY || "your area";

export function normalizeMunicipalityName(value?: string) {
  const trimmed = value?.trim();
  return trimmed || defaultMunicipalityName;
}

export function municipalityIdFromName(value?: string) {
  return normalizeMunicipalityName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "your-area";
}
