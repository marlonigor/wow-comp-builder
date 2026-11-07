import { assignFirstSlot } from "./compositionSlots.ts";
import type { CompositionSlot } from "./compositionSlots.ts";
import type { ForeverGameData } from "./data/forever-data.schema.ts";

export type GroupSize = 5 | 10 | 20 | 40;

export interface CompositionLink {
  size: GroupSize;
  dungeonId: string;
  slots: readonly CompositionSlot[];
}

/** Gera a query de uma composição. Exemplo: encodeCompositionLink(composicao). */
export function encodeCompositionLink({ size, dungeonId, slots }: CompositionLink): string {
  const query = new URLSearchParams({ m: String(size) });
  if (size === 5) {
    query.set("dg", dungeonId);
  }

  const ids = slots
    .map(({ specId }) => specId ?? "")
    .join(",")
    .replace(/,+$/, "");
  query.set("c", ids);
  return `?${query}`;
}

/** Valida e recupera uma composição compartilhada. Exemplo: decodeCompositionLink(query, catalogo, modelos). */
export function decodeCompositionLink(
  search: string,
  catalog: Pick<ForeverGameData, "specs" | "dungeons">,
  templates: Readonly<Record<GroupSize, readonly CompositionSlot[]>>,
): CompositionLink | null {
  const query = new URLSearchParams(search);
  const size = parseGroupSize(query.get("m"));
  if (size === null || !query.has("c")) return null;

  const dungeonId = size === 5 ? (query.get("dg") ?? "general") : "general";
  if (size === 5 && !catalog.dungeons.some(({ id }) => id === dungeonId)) return null;

  const ids = (query.get("c") ?? "").split(",");
  const template = templates[size];
  if (ids.length > template.length) return null;

  const specs = new Map(catalog.specs.map((spec) => [spec.id, spec]));
  const slots = template.map(({ role }, index) => decodeSlot(role, ids[index], specs));
  if (slots.some((slot) => slot === null)) return null;
  return { size, dungeonId, slots: slots.filter((slot) => slot !== null) };
}

function parseGroupSize(value: string | null): GroupSize | null {
  const sizes: readonly GroupSize[] = [5, 10, 20, 40];
  return sizes.find((size) => String(size) === value) ?? null;
}

function decodeSlot(
  role: CompositionSlot["role"],
  id: string | undefined,
  specs: ReadonlyMap<string, ForeverGameData["specs"][number]>,
): CompositionSlot | null {
  const slot = { role, specId: null };
  if (!id) return slot;

  const spec = specs.get(id);
  return spec ? (assignFirstSlot([slot], spec)?.[0] ?? null) : null;
}
