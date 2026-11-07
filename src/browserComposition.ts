import { decodeCompositionLink, encodeCompositionLink } from "./compositionLink.ts";
import type { CompositionLink, GroupSize } from "./compositionLink.ts";
import type { CompositionSlot } from "./compositionSlots.ts";
import { foreverCatalog } from "./data/foreverCatalog.ts";

export const groupSizes: readonly GroupSize[] = [5, 10, 20, 40];
const storageKey = "wow-forever:composition";

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
export function loadComposition(browser: Window): CompositionLink {
  const linked = decodeCompositionLink(browser.location.search, foreverCatalog, templates);
  if (linked) return linked;

  try {
    const saved = browser.localStorage.getItem(storageKey);
    return (saved && decodeCompositionLink(saved, foreverCatalog, templates)) || emptyComposition(5);
  } catch {
    return emptyComposition(5);
  }
}

/** Atualiza o link e salva o rascunho quando possível. Exemplo: saveComposition(window, composicao). */
export function saveComposition(browser: Window, composition: CompositionLink): void {
  const query = encodeCompositionLink(composition);
  browser.history.replaceState(null, "", query);
  try {
    browser.localStorage.setItem(storageKey, query);
  } catch {
    // O endereço continua disponível quando o navegador bloqueia o armazenamento.
  }
}
