export type RoleType = "TANK" | "HEALER" | "MELEE_DPS" | "RANGED_DPS";
export type UtilityCategory = "CORE" | "DISPEL" | "CC" | "RAID_BUFF";

export interface UtilityDefinition {
  id: string;
  name: string;
  shortName: string;
  category: UtilityCategory;
  icon: string;
  description: string;
}

export interface SpecDefinition {
  id: string;
  className: string;
  specName: string;
  role: RoleType;
  colorHex: string;
  shortcuts: readonly string[];
  utilities: readonly string[];
  notes: string;
}

export interface DungeonProfile {
  id: string;
  name: string;
  criticalUtilities: readonly string[];
  bonusUtilities: readonly string[];
}

export interface ForeverGameData {
  patchVersion: string;
  utilities: readonly UtilityDefinition[];
  specs: readonly SpecDefinition[];
  dungeons: readonly DungeonProfile[];
}
