import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { clearComposition, loadComposition, loadDrafts, saveComposition } from "./browserComposition.ts";
import type { CompositionBrowser, CompositionDrafts } from "./browserComposition.ts";
import type { CompositionLink, GroupSize } from "./compositionLink.ts";

interface DraftControls {
  composition: CompositionLink;
  revision: number;
  notice: string;
  onChange: (composition: CompositionLink) => void;
  onModeChange: (size: GroupSize) => void;
  clear: () => void;
}

/** Conserva rascunhos em memória mesmo sem armazenamento disponível. Exemplo: useCompositionDrafts(window). */
export function useCompositionDrafts(browser: CompositionBrowser): DraftControls {
  const [drafts, setDrafts] = useState(() => loadDrafts(browser));
  const [size, setSize] = useState(() => loadComposition(browser).size);
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const composition = drafts[size];
  useEffect(() => saveComposition(browser, composition), [browser, composition]);
  const onChange = (next: CompositionLink): void => changeDraft(setDrafts, next, setNotice);
  const onModeChange = (next: GroupSize): void => {
    setSize(next);
    setNotice("");
  };
  function clear(): void {
    onChange(clearComposition(composition));
    setRevision((value) => value + 1);
    setNotice("Composição limpa. Escolha uma vaga para montar um novo grupo.");
  }
  return { composition, revision, notice, onChange, onModeChange, clear };
}

function changeDraft(update: Dispatch<SetStateAction<CompositionDrafts>>, next: CompositionLink, notice: (value: string) => void): void {
  update((current) => ({ ...current, [next.size]: next }));
  notice("");
}
