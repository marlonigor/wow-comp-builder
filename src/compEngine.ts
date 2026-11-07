import type { DungeonProfile, SpecDefinition, UtilityDefinition } from "./data/forever-data.schema.ts";

export type CoverageContext = { mode: "DUNGEON_5"; dungeon: DungeonProfile } | { mode: "RAID_10" | "RAID_20" | "RAID_40" };

export interface Coverage {
  missingCritical: string[];
  missingBonus: string[];
}

export interface CoverageMember {
  slotNumber: number;
  spec: SpecDefinition;
}

/** Lista os integrantes que fornecem um utilitário. Exemplo: getUtilityProviders(grupo, "poison_dispel"). */
export function getUtilityProviders(group: readonly CoverageMember[], utilityId: string): readonly CoverageMember[] {
  return group.filter(({ spec }) => spec.utilities.includes(utilityId));
}

/** Separa os críticos promovidos pelo perfil da masmorra. Exemplo: getDungeonCriticalIds(contexto, perfilGeral). */
export function getDungeonCriticalIds(context: CoverageContext, general: DungeonProfile | undefined): readonly string[] {
  if (context.mode !== "DUNGEON_5" || context.dungeon.id === "general") return [];
  return context.dungeon.criticalUtilities.filter((id) => !general?.criticalUtilities.includes(id));
}

interface SpecCoverage {
  critical: UtilityDefinition[];
  bonus: UtilityDefinition[];
}

/** Identifica lacunas que uma spec pode cobrir. Exemplo: getSpecCoverage(spec, lacunas, catalogo). */
export function getSpecCoverage(spec: SpecDefinition, coverage: Coverage, utilities: readonly UtilityDefinition[]): SpecCoverage {
  const provided = utilities.filter(({ id }) => spec.utilities.includes(id));
  return {
    critical: provided.filter(({ id }) => coverage.missingCritical.includes(id)),
    bonus: provided.filter(({ id }) => coverage.missingBonus.includes(id)),
  };
}

interface RankedSpec {
  spec: SpecDefinition;
  score: number;
  matchCount: number;
}

/** Calcula as lacunas para o contexto escolhido. Exemplo: getCoverage(catalogo, grupo, contexto). */
export function getCoverage(utilities: readonly UtilityDefinition[], group: readonly SpecDefinition[], context: CoverageContext): Coverage {
  const covered = new Set(group.flatMap((spec) => spec.utilities));
  const missing = utilities.filter((utility) => !covered.has(utility.id));
  if (context.mode !== "DUNGEON_5") {
    return { missingCritical: missing.map((utility) => utility.id), missingBonus: [] };
  }

  const critical = new Set(context.dungeon.criticalUtilities);
  const bonus = new Set(context.dungeon.bonusUtilities);
  const missingCritical = missing.filter(({ id, category }) => category === "CORE" || critical.has(id));
  const criticalIds = new Set(missingCritical.map(({ id }) => id));
  return {
    missingCritical: [...criticalIds],
    missingBonus: missing.filter(({ id }) => bonus.has(id) && !criticalIds.has(id)).map(({ id }) => id),
  };
}

/** Ordena specs pela cobertura de lacunas. Exemplo: rankSpecs(paleta, lacunas, alertasSelecionados). */
export function rankSpecs(
  specs: readonly SpecDefinition[],
  missingCritical: readonly string[],
  selected: readonly string[] = [],
): RankedSpec[] {
  const missing = new Set(missingCritical);
  const active = new Set(selected.filter((id) => missing.has(id)));
  return specs
    .map((spec) => {
      const covered = [...new Set(spec.utilities)].filter((id) => missing.has(id));
      return {
        spec,
        score: covered.length,
        matchCount: covered.filter((id) => active.has(id)).length,
      };
    })
    .sort((left, right) => right.matchCount - left.matchCount || right.score - left.score);
}
