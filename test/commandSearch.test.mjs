import assert from "node:assert/strict";
import { test } from "node:test";
import { searchSpecs } from "../src/commandSearch.ts";
import { assignFirstSlot } from "../src/compositionSlots.ts";
import { foreverCatalog } from "../src/data/foreverCatalog.ts";

const { specs, utilities } = foreverCatalog;

test("resolve o atalho normalizado e permite ocupar a vaga da função", () => {
  const result = searchSpecs("  RDRUID  ", specs, utilities);
  assert.deepEqual(
    result.map(({ id }) => id),
    ["druid-restoration"],
  );
  const slots = [
    { role: "TANK", specId: null },
    { role: "HEALER", specId: null },
  ];
  assert.deepEqual(
    assignFirstSlot(slots, result[0]).map(({ specId }) => specId),
    [null, "druid-restoration"],
  );
});

test("busca classe e utilitário sem descartar resultados ambíguos", () => {
  const mageIds = ["mage-arcane", "mage-fire", "mage-frost"];
  assert.deepEqual(
    searchSpecs("mage", specs, utilities).map(({ id }) => id),
    mageIds,
  );
  assert.deepEqual(searchSpecs("INTERUPCAO", specs, utilities), []);
  assert.deepEqual(
    searchSpecs("interrupcao   a distancia", specs, utilities).map(({ id }) => id),
    [...mageIds, "warlock-affliction", "warlock-demonology", "warlock-destruction"],
  );
  assert.deepEqual(searchSpecs("  ", specs, utilities), specs);
});

test("um atalho exato precede o nome de um utilitário", () => {
  const aliases = specs.map((spec) => (spec.id === "druid-restoration" ? { ...spec, shortcuts: ["mage"] } : spec));
  assert.deepEqual(
    searchSpecs("mage", aliases, utilities).map(({ id }) => id),
    ["druid-restoration"],
  );
});
