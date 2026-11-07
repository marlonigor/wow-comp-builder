import data from "./forever-data.json" with { type: "json" };
import type { ForeverGameData } from "./forever-data.schema.ts";

// A atribuição tipada verifica o JSON no build sem abrir mão do arquivo versionado.
export const foreverCatalog: ForeverGameData = {
  ...data,
  utilities: data.utilities.map((entry) => ({ ...entry, category: parseCategory(entry.category) })),
  specs: data.specs.map((entry) => ({ ...entry, role: parseRole(entry.role) })),
};

const specsById = new Map(foreverCatalog.specs.map((spec) => [spec.id, spec]));

/** Busca a especialização pelo ID salvo. Exemplo: findSpec("mage-frost"). */
export function findSpec(id: string): ForeverGameData["specs"][number] | undefined {
  return specsById.get(id);
}

function parseCategory(category: string): ForeverGameData["utilities"][number]["category"] {
  if (category === "CORE" || category === "DISPEL" || category === "CC" || category === "RAID_BUFF") return category;
  throw new Error(`Categoria recebida: ${category}. Formato esperado: CORE, DISPEL, CC ou RAID_BUFF.`);
}

function parseRole(role: string): ForeverGameData["specs"][number]["role"] {
  if (role === "TANK" || role === "HEALER" || role === "MELEE_DPS" || role === "RANGED_DPS") return role;
  throw new Error(`Função recebida: ${role}. Formato esperado: TANK, HEALER, MELEE_DPS ou RANGED_DPS.`);
}
