import type { SpecDefinition, UtilityDefinition } from "./data/forever-data.schema.ts";

function normalize(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ");
}

function specTerms(spec: SpecDefinition): string[] {
  return [spec.id, spec.specName, spec.className, `${spec.specName} ${spec.className}`].map(normalize);
}

/** Encontra candidatos pelo comando digitado. Exemplo: searchSpecs("rdruid", specs, utilities). */
export function searchSpecs(
  query: string,
  specs: readonly SpecDefinition[],
  utilities: readonly UtilityDefinition[],
): readonly SpecDefinition[] {
  const term = normalize(query);
  if (!term) return specs;

  const exact = specs.filter((spec) => spec.shortcuts.some((alias) => normalize(alias) === term));
  if (exact.length > 0) return exact;

  const matchingIds = new Set(
    utilities
      .filter(({ id, name, shortName }) => [id, name, shortName].some((value) => normalize(value).includes(term)))
      .map(({ id }) => id),
  );
  return specs.filter((spec) => specTerms(spec).some((value) => value.includes(term)) || spec.utilities.some((id) => matchingIds.has(id)));
}
