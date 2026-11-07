import assert from "node:assert/strict";
import { test } from "node:test";
import { clearComposition, emptyComposition, loadComposition, loadDrafts, saveComposition } from "../src/browserComposition.ts";

/** Porta em memória para exercitar persistência sem I/O. Exemplo: new MemoryBrowser(). */
class MemoryBrowser {
  values = new Map();
  location = { search: "" };
  history = {
    replaceState: (_data, _title, url) => {
      this.location.search = url;
    },
  };
  localStorage = {
    getItem: (key) => this.values.get(key) ?? null,
    setItem: (key, value) => {
      this.values.set(key, value);
    },
  };
}

/** Simula indisponibilidade de armazenamento. Exemplo: new BlockedBrowser(). */
class BlockedBrowser extends MemoryBrowser {
  localStorage = {
    getItem: () => {
      throw new Error("Armazenamento bloqueado");
    },
    setItem: () => {
      throw new Error("Armazenamento bloqueado");
    },
  };
}

test("salva quatro modos independentes e restaura o último modo ativo", () => {
  const browser = new MemoryBrowser();
  for (const size of [5, 10, 20, 40]) saveComposition(browser, emptyComposition(size));
  browser.location.search = "";
  assert.equal(loadComposition(browser).size, 40);
  assert.deepEqual(
    Object.values(loadDrafts(browser)).map(({ size }) => size),
    [5, 10, 20, 40],
  );
});

test("migra rascunho antigo e prioriza link explícito sem apagar outros modos", () => {
  const browser = new MemoryBrowser();
  browser.values.set("wow-forever:composition", "?m=10&c=warrior-protection");
  assert.equal(loadDrafts(browser)[10].slots[0].specId, "warrior-protection");
  browser.location.search = "?m=5&dg=hall-of-thanes&c=paladin-protection";
  const drafts = loadDrafts(browser);
  assert.equal(drafts[5].slots[0].specId, "paladin-protection");
  assert.equal(drafts[10].slots[0].specId, "warrior-protection");
  saveComposition(browser, drafts[5]);
  assert.equal(loadDrafts(browser)[10].slots[0].specId, "warrior-protection");
});

test("descarta rascunho inválido ou de tamanho diferente e tolera bloqueio", () => {
  const browser = new MemoryBrowser();
  browser.values.set("wow-forever:composition:10", "?m=20&c=");
  browser.values.set("wow-forever:composition:20", "inválido");
  assert.deepEqual(loadDrafts(browser)[10], emptyComposition(10));
  assert.deepEqual(loadDrafts(browser)[20], emptyComposition(20));
  const blocked = new BlockedBrowser();
  assert.deepEqual(loadComposition(blocked), emptyComposition(5));
  assert.equal(loadDrafts(blocked)[40].size, 40);
  saveComposition(blocked, emptyComposition(20));
  assert.equal(loadComposition(blocked).size, 20);
});

test("limpeza não muta o original nem muda masmorra e funções", () => {
  const browser = new MemoryBrowser();
  browser.location.search = "?m=5&dg=hall-of-thanes&c=warrior-protection";
  const original = loadComposition(browser);
  const cleared = clearComposition(original);
  assert.equal(cleared.dungeonId, "hall-of-thanes");
  assert.equal(cleared.size, 5);
  assert.ok(cleared.slots.every(({ specId }) => specId === null));
  assert.equal(original.slots[0].specId, "warrior-protection");
  assert.deepEqual(
    cleared.slots.map(({ role }) => role),
    original.slots.map(({ role }) => role),
  );
});
