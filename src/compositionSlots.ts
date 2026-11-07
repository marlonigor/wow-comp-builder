import type { SpecDefinition } from "./data/forever-data.schema.ts";

export interface CompositionSlot {
  readonly role: "TANK" | "HEALER" | "DPS";
  readonly specId: string | null;
}

const roleLabels = { TANK: "Tanque", HEALER: "Curador", DPS: "DPS" };

function slotRoleFor(role: SpecDefinition["role"]): CompositionSlot["role"] {
  return role === "MELEE_DPS" || role === "RANGED_DPS" ? "DPS" : role;
}

/** Verifica se a função da spec corresponde à vaga. Exemplo: isSlotRoleCompatible(slot, spec.role). */
export function isSlotRoleCompatible(slot: CompositionSlot, role: SpecDefinition["role"]): boolean {
  return slot.role === slotRoleFor(role);
}

/** Exibe a função da vaga. Exemplo: slotRoleLabel("MELEE_DPS"). */
export function slotRoleLabel(role: SpecDefinition["role"] | CompositionSlot["role"]): string {
  return roleLabels[role === "DPS" ? role : slotRoleFor(role)];
}

/** Encontra a primeira vaga livre compatível. Exemplo: findFirstSlot(slots, spec.role). */
export function findFirstSlot(slots: readonly CompositionSlot[], role: SpecDefinition["role"]): number {
  return slots.findIndex((slot) => isSlotRoleCompatible(slot, role) && slot.specId === null);
}

/** Valida uma vaga específica antes de usá-la. Exemplo: isOpenSlotAt(slots, 2, spec.role). */
export function isOpenSlotAt(slots: readonly CompositionSlot[], index: number, role: SpecDefinition["role"]): boolean {
  const slot = slots[index];
  return slot !== undefined && slot.specId === null && isSlotRoleCompatible(slot, role);
}

/** Aloca uma spec no primeiro slot livre da sua função. Exemplo: assignFirstSlot(slots, spec). */
export function assignFirstSlot(slots: readonly CompositionSlot[], spec: SpecDefinition): CompositionSlot[] | null {
  return assignSlotAt(slots, spec, findFirstSlot(slots, spec.role));
}

/** Preenche a vaga escolhida se ela estiver livre e for compatível. Exemplo: assignSlotAt(slots, spec, 2). */
export function assignSlotAt(slots: readonly CompositionSlot[], spec: SpecDefinition, index: number): CompositionSlot[] | null {
  if (!isOpenSlotAt(slots, index, spec.role)) return null;
  return slots.map((slot, position) => (position === index ? { ...slot, specId: spec.id } : slot));
}
