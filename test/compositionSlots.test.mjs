import assert from "node:assert/strict";
import { test } from "node:test";
import { assignFirstSlot, assignSlotAt, findFirstSlot, slotRoleLabel } from "../src/compositionSlots.ts";

const slots = [
  { role: "DPS", specId: "occupied-dps" },
  { role: "TANK", specId: null },
  { role: "HEALER", specId: null },
  { role: "DPS", specId: null },
  { role: "DPS", specId: null },
];

test("aloca no primeiro slot livre da função e preserva a composição anterior", () => {
  const result = assignFirstSlot(slots, { id: "test-healer", role: "HEALER" });
  assert.deepEqual(
    result?.map(({ specId }) => specId),
    ["occupied-dps", null, "test-healer", null, null],
  );
  assert.equal(slots[2].specId, null);
});

test("DPS corpo a corpo e à distância usam os mesmos slots", () => {
  for (const role of ["MELEE_DPS", "RANGED_DPS"]) {
    const result = assignFirstSlot(slots, { id: "test-dps", role });
    assert.deepEqual(
      result?.map(({ specId }) => specId),
      ["occupied-dps", null, null, "test-dps", null],
    );
  }
});

test("retorna null quando o slot compatível está ocupado ou ausente", () => {
  const spec = { id: "test-tank", role: "TANK" };
  assert.equal(assignFirstSlot([{ role: "TANK", specId: "occupied-tank" }], spec), null);
  assert.equal(assignFirstSlot([{ role: "HEALER", specId: null }], spec), null);
});

test("prévia e alocação apontam para a mesma vaga e bloqueiam funções incompatíveis", () => {
  assert.equal(findFirstSlot(slots, "TANK"), 1);
  assert.equal(findFirstSlot(slots, "HEALER"), 2);
  assert.equal(findFirstSlot(slots, "MELEE_DPS"), 3);
  assert.equal(slotRoleLabel("RANGED_DPS"), slotRoleLabel("DPS"));
  assert.equal(findFirstSlot([{ role: "DPS", specId: null }], "TANK"), -1);
  const tankOnly = [{ role: "TANK", specId: null }];
  assert.equal(findFirstSlot(tankOnly, "RANGED_DPS"), -1);
  assert.equal(assignFirstSlot(tankOnly, { id: "test-dps", role: "RANGED_DPS" }), null);
});

test("aloca na vaga indicada mesmo com outra vaga compatível anterior", () => {
  const spec = { id: "test-dps", role: "RANGED_DPS" };
  assert.deepEqual(
    assignSlotAt(slots, spec, 4)?.map(({ specId }) => specId),
    ["occupied-dps", null, null, null, "test-dps"],
  );
  assert.equal(assignSlotAt(slots, spec, 0), null);
  assert.equal(assignSlotAt(slots, spec, 1), null);
  assert.equal(assignSlotAt(slots, spec, 5), null);
});
