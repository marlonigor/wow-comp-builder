import { decodeCompositionLink, encodeCompositionLink } from "./compositionLink.ts";
import type { CompositionLink, GroupSize } from "./compositionLink.ts";
import type { CompositionSlot } from "./compositionSlots.ts";
import { foreverCatalog } from "./data/foreverCatalog.ts";

export const groupSizes: readonly GroupSize[] = [5, 10, 20, 40];
const storageKey = "wow-forever:composition";

export interface CompositionBrowser {
  location: { search: string };
  history: { replaceState: (data: null, unused: string, url: string) => void };
  localStorage: Pick<Storage, "getItem" | "setItem">;
}

export type CompositionDrafts = Record<GroupSize, CompositionLink>;

function makeSlots(size: GroupSize, tanks: number, healers: number): CompositionSlot[] {
  return Array.from({ length: size }, (_, index) => ({
    role: index < tanks ? "TANK" : index < tanks + healers ? "HEALER" : "DPS",
    specId: null,
  }));
}

const templates = { 5: makeSlots(5, 1, 1), 10: makeSlots(10, 2, 2), 20: makeSlots(20, 2, 4), 40: makeSlots(40, 2, 8) };

/** Cria uma composição vazia. Exemplo: emptyComposition(5). */
export function emptyComposition(size: GroupSize): CompositionLink {
  return { size, dungeonId: "general", slots: templates[size] };
}

/** Restaura o link ou o rascunho local. Exemplo: loadComposition(window). */
export function loadComposition(browser: CompositionBrowser): CompositionLink {
  const linked = decodeCompositionLink(browser.location.search, foreverCatalog, templates);
  return linked ?? readSaved(browser, storageKey) ?? emptyComposition(5);
}

function readSaved(browser: CompositionBrowser, key: string): CompositionLink | null {
  try {
    const saved = browser.localStorage.getItem(key);
    return saved ? decodeCompositionLink(saved, foreverCatalog, templates) : null;
  } catch {
    return null;
  }
}

/** Atualiza o link e salva o rascunho quando possível. Exemplo: saveComposition(window, composicao). */
export function saveComposition(browser: CompositionBrowser, composition: CompositionLink): void {
  const query = encodeCompositionLink(composition);
  browser.history.replaceState(null, "", query);
  try {
    preserveLegacy(browser);
    browser.localStorage.setItem(`${storageKey}:${composition.size}`, query);
    browser.localStorage.setItem(storageKey, query);
  } catch {
    // O endereço continua disponível quando o navegador bloqueia o armazenamento.
  }
}

function preserveLegacy(browser: CompositionBrowser): void {
  const legacy = readSaved(browser, storageKey);
  if (!legacy) return;
  const key = `${storageKey}:${legacy.size}`;
  if (readSaved(browser, key)?.size !== legacy.size) browser.localStorage.setItem(key, encodeCompositionLink(legacy));
}

function loadMode(browser: CompositionBrowser, size: GroupSize): CompositionLink {
  const saved = readSaved(browser, `${storageKey}:${size}`);
  if (saved?.size === size) return saved;
  const legacy = readSaved(browser, storageKey);
  return legacy?.size === size ? legacy : emptyComposition(size);
}

/** Recupera grupos independentes; o link explícito prevalece no modo aberto. Exemplo: loadDrafts(window). */
export function loadDrafts(browser: CompositionBrowser): CompositionDrafts {
  const drafts: CompositionDrafts = {
    5: loadMode(browser, 5),
    10: loadMode(browser, 10),
    20: loadMode(browser, 20),
    40: loadMode(browser, 40),
  };
  const active = loadComposition(browser);
  drafts[active.size] = active;
  return drafts;
}

/** Esvazia integrantes preservando modo, funções e masmorra. Exemplo: clearComposition(grupo). */
export function clearComposition(composition: CompositionLink): CompositionLink {
  return { ...composition, slots: composition.slots.map((slot) => ({ ...slot, specId: null })) };
}
