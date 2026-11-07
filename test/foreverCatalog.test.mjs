import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { findSpec, foreverCatalog } from "../src/data/foreverCatalog.ts";

test("o catálogo versionado tem IDs únicos e referências válidas", () => {
  const { patchVersion, utilities, specs, dungeons } = foreverCatalog;
  assert.match(patchVersion, /^forever-\d+\.\d+\.\d+\.\d+$/);
  for (const entries of [utilities, specs, dungeons]) {
    assert.equal(new Set(entries.map(({ id }) => id)).size, entries.length);
  }
  const utilityIds = new Set(utilities.map(({ id }) => id));
  const references = [
    ...specs.flatMap((spec) => spec.utilities),
    ...dungeons.flatMap(({ criticalUtilities, bonusUtilities }) => [...criticalUtilities, ...bonusUtilities]),
  ];
  assert.deepEqual(
    references.filter((id) => !utilityIds.has(id)),
    [],
  );
  assert.ok(dungeons.some(({ id }) => id === "general"));
});

test("cada classe do seletor tem três especializações distintas", () => {
  const byClass = Map.groupBy(foreverCatalog.specs, ({ className }) => className);
  assert.equal(byClass.size, 9);
  for (const specs of byClass.values()) {
    assert.equal(specs.length, 3);
    assert.equal(new Set(specs.map(({ specName }) => specName)).size, 3);
  }
});

test("cada classe e especialização do catálogo tem um ícone local", () => {
  for (const spec of foreverCatalog.specs) {
    const classIcon = new URL(`../src/assets/classes/${spec.className.toLowerCase()}.jpg`, import.meta.url);
    const specIcon = new URL(`../src/assets/specs/${spec.id}.jpg`, import.meta.url);
    assert.ok(existsSync(classIcon), spec.className);
    assert.ok(existsSync(specIcon), spec.id);
    assert.equal(findSpec(spec.id), spec);
  }
  assert.equal(findSpec("unavailable-spec"), undefined);
});

test("o catálogo distingue os alertas específicos do perfil geral", () => {
  const profiles = new Map(foreverCatalog.dungeons.map((dungeon) => [dungeon.id, dungeon]));
  assert.equal(profiles.size, 36);
  assert.ok(profiles.get("wailing-caverns").criticalUtilities.includes("poison_dispel"));
  assert.ok(profiles.get("shadowfang-keep").criticalUtilities.includes("curse_dispel"));
  assert.ok(profiles.get("general").bonusUtilities.includes("curse_dispel"));
});
