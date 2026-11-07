import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeCompositionLink, encodeCompositionLink } from "../src/compositionLink.ts";

const dungeonSlots = ["TANK", "HEALER", "DPS", "DPS", "DPS"].map((role) => ({ role, specId: null }));
const raidSlots = Array.from({ length: 40 }, () => ({ role: "DPS", specId: null }));
const templates = { 5: dungeonSlots, 10: raidSlots.slice(0, 10), 20: raidSlots.slice(0, 20), 40: raidSlots };
const catalog = {
  specs: [
    { id: "test-tank", role: "TANK" },
    { id: "test-healer", role: "HEALER" },
    { id: "test-melee", role: "MELEE_DPS" },
    { id: "test-ranged", role: "RANGED_DPS" },
    { id: "test-other-dps", role: "RANGED_DPS" },
  ],
  dungeons: [{ id: "general" }, { id: "test-dungeon" }],
};

test("restaura os cinco jogadores e a dungeon escolhida pelo link", () => {
  const slots = dungeonSlots.map((slot, index) => ({ ...slot, specId: catalog.specs[index].id }));
  const composition = { size: 5, dungeonId: "test-dungeon", slots };
  const search = encodeCompositionLink(composition);
  assert.deepEqual(decodeCompositionLink(search, catalog, templates), composition);
});

test("preserva posições vazias e omite slots vazios no final da query", () => {
  const slots = dungeonSlots.map((slot, index) => (index === 2 ? { ...slot, specId: "test-melee" } : slot));
  const composition = { size: 5, dungeonId: "general", slots };
  const search = encodeCompositionLink(composition);
  assert.equal(new URLSearchParams(search).get("c"), ",,test-melee");
  assert.deepEqual(decodeCompositionLink(search, catalog, templates), composition);
});

test("restaura uma raid de 40 posições e omite o perfil de dungeon", () => {
  const slots = raidSlots.map((slot) => ({ ...slot, specId: "test-ranged" }));
  const composition = { size: 40, dungeonId: "general", slots };
  const search = encodeCompositionLink(composition);
  assert.equal(new URLSearchParams(search).has("dg"), false);
  assert.deepEqual(decodeCompositionLink(search, catalog, templates), composition);
});

test("rejeita links com modo, dungeon, quantidade ou especialização inválidos", () => {
  const invalid = ["?m=25&c=", "?m=5", "?m=5&dg=unknown&c=", "?m=5&c=,,,,,test-ranged", "?m=5&c=unknown", "?m=5&c=test-healer"];
  for (const search of invalid) {
    assert.equal(decodeCompositionLink(search, catalog, templates), null, search);
  }
});
