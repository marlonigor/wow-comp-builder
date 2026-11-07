import assert from "node:assert/strict";
import { test } from "node:test";
import { getCoverage, getSpecCoverage, getUtilityProviders, rankSpecs } from "../src/compEngine.ts";

const utilities = [
  { id: "bloodlust", category: "CORE" },
  { id: "poison_dispel", category: "DISPEL" },
  { id: "soothe", category: "DISPEL" },
  { id: "curse_dispel", category: "DISPEL" },
  { id: "intellect", category: "RAID_BUFF" },
];

const dungeon = {
  mode: "DUNGEON_5",
  dungeon: {
    criticalUtilities: ["poison_dispel", "soothe"],
    bonusUtilities: ["intellect"],
  },
};

test("lista os fornecedores em ordem de vaga, inclusive specs repetidas", () => {
  const healer = { utilities: ["poison_dispel"] };
  const group = [
    { slotNumber: 2, spec: healer },
    { slotNumber: 3, spec: { utilities: ["bloodlust"] } },
    { slotNumber: 4, spec: healer },
  ];
  assert.deepEqual(
    getUtilityProviders(group, "poison_dispel").map(({ slotNumber }) => slotNumber),
    [2, 4],
  );
  assert.deepEqual(getUtilityProviders(group, "intellect"), []);
});

test("detalha os críticos e bônus que a spec ainda pode acrescentar", () => {
  const group = [{ utilities: ["soothe"] }];
  const coverage = getCoverage(utilities, group, dungeon);
  const spec = { utilities: ["soothe", "poison_dispel", "intellect", "curse_dispel", "intellect"] };
  const { critical, bonus } = getSpecCoverage(spec, coverage, utilities);
  assert.deepEqual(
    critical.map(({ id }) => id),
    ["poison_dispel"],
  );
  assert.deepEqual(
    bonus.map(({ id }) => id),
    ["intellect"],
  );
  assert.deepEqual(getSpecCoverage(group[0], coverage, utilities), { critical: [], bonus: [] });
});

test("CT-01: usa utilitários Core e os críticos da dungeon selecionada", () => {
  assert.deepEqual(getCoverage(utilities, [], dungeon), {
    missingCritical: ["bloodlust", "poison_dispel", "soothe"],
    missingBonus: ["intellect"],
  });
});

test("CT-02: buffs e dispels são críticos em todos os tamanhos de raid", () => {
  for (const mode of ["RAID_10", "RAID_20", "RAID_40"]) {
    assert.deepEqual(getCoverage(utilities, [], { mode }), {
      missingCritical: utilities.map(({ id }) => id),
      missingBonus: [],
    });
  }
});

test("CT-03: pontua apenas lacunas críticas distintas em um grupo parcial", () => {
  const group = [{ utilities: ["bloodlust"] }, { utilities: ["curse_dispel"] }];
  const { missingCritical } = getCoverage(utilities, group, dungeon);
  const narrow = { utilities: ["soothe", "soothe", "bloodlust", "intellect"] };
  const broad = { utilities: ["poison_dispel", "soothe"] };
  const ranked = rankSpecs([narrow, broad], missingCritical);
  assert.deepEqual(
    ranked.map(({ spec, score }) => [spec, score]),
    [
      [broad, 2],
      [narrow, 1],
    ],
  );
});

test("CT-04: Smart Fill prioriza os alertas selecionados e desempata pela cobertura", () => {
  const both = { utilities: ["bloodlust", "curse_dispel"] };
  const narrow = { utilities: ["curse_dispel"] };
  const broad = { utilities: ["bloodlust", "soothe", "intellect"] };
  const none = { utilities: ["soothe", "intellect"] };
  const missing = ["bloodlust", "curse_dispel", "soothe", "intellect"];
  const ranked = rankSpecs([none, narrow, broad, both], missing, ["bloodlust", "curse_dispel"]);
  assert.deepEqual(
    ranked.map(({ spec, matchCount }) => [spec, matchCount]),
    [
      [both, 2],
      [broad, 1],
      [narrow, 1],
      [none, 0],
    ],
  );
});
